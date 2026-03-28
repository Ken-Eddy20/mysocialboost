import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { getAuth as getAdminAuth } from 'firebase-admin/auth';
import { verifyPaystackTransaction, initializePaystackTransaction } from './lib/paystack.js';
import {
    syncUserToFirestore,
    getUserFromFirestore,
    logTransaction,
    ghsToUsdRate,
    ensureFreshGhsUsdRate,
    startGhsUsdRateRefreshLoop,
    initFirestoreAdmin,
} from './lib/firestore-admin.js';
import { forwardOrderToProvider } from './lib/jap.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });

// ── Server-side price catalog (id → price per 1000) ──────────────────
const SERVICE_PRICES = buildServicePriceMap();

function buildServicePriceMap() {
    const dataPath = path.join(__dirname, 'js', 'data.js');
    const raw = fs.readFileSync(dataPath, 'utf8');
    const map = {};
    const re = /id:\s*'([^']+)'[^}]*price:\s*([\d.]+)/g;
    let m;
    while ((m = re.exec(raw)) !== null) {
        map[m[1]] = parseFloat(m[2]);
    }
    return map;
}

function serverSideCostUsd(serviceId, quantity) {
    const pricePerK = SERVICE_PRICES[serviceId];
    if (pricePerK == null) return null;
    return parseFloat(((quantity / 1000) * pricePerK).toFixed(2));
}

// ── Express setup ────────────────────────────────────────────────────
const app = express();

app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
}));

const allowedOrigins = (process.env.ALLOWED_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean);
app.use(cors(allowedOrigins.length > 0 ? {
    origin(origin, cb) {
        if (!origin || allowedOrigins.includes(origin)) cb(null, true);
        else cb(new Error('CORS blocked'));
    },
} : undefined));

app.use(express.json({ limit: '50kb' }));

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 30,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Too many attempts. Try again in 15 minutes.' },
});

const paymentLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Too many payment requests. Slow down.' },
});

// ── Block sensitive files from being served ──────────────────────────
const BLOCKED_FILES = new Set([
    '/database.json',
    '/serviceaccountkey.json',
    '/serviceaccount.json',
    '/.env',
    '/server.js',
    '/package.json',
    '/package-lock.json',
    '/build.mjs',
    '/.gitignore',
]);

app.use((req, res, next) => {
    const lower = req.path.toLowerCase();
    if (BLOCKED_FILES.has(lower) || lower.startsWith('/lib/') || lower.startsWith('/scripts/')) {
        return res.status(404).end();
    }
    next();
});

/** Serialize wallet mutations so parallel requests cannot corrupt database.json */
let addFundsChain = Promise.resolve();
function runAddFundsSerial(task) {
    const run = () => task();
    const p = addFundsChain.then(run, run);
    addFundsChain = p.catch(() => {});
    return p;
}
let orderChain = Promise.resolve();
function runOrderSerial(task) {
    const run = () => task();
    const p = orderChain.then(run, run);
    orderChain = p.catch(() => {});
    return p;
}

let signupChain = Promise.resolve();
function runSignupSerial(task) {
    const run = () => task();
    const p = signupChain.then(run, run);
    signupChain = p.catch(() => {});
    return p;
}

const dbPath = path.join(__dirname, 'database.json');

const PENDING_PAYSTACK_MAX_MS = 48 * 60 * 60 * 1000;

function normalizeDb(raw) {
    const data = raw && typeof raw === 'object' ? raw : {};
    if (!Array.isArray(data.users)) data.users = [];
    if (!Array.isArray(data.usedPaystackReferences)) data.usedPaystackReferences = [];
    if (!data.pendingPaystackTopups || typeof data.pendingPaystackTopups !== 'object' || Array.isArray(data.pendingPaystackTopups)) {
        data.pendingPaystackTopups = {};
    }
    return data;
}

function prunePendingPaystackTopups(data) {
    const p = data.pendingPaystackTopups;
    if (!p || typeof p !== 'object') return;
    const now = Date.now();
    for (const k of Object.keys(p)) {
        const at = p[k]?.at;
        if (typeof at !== 'number' || now - at > PENDING_PAYSTACK_MAX_MS) delete p[k];
    }
}

function userPublicView(user) {
    if (!user) return null;
    const rate = ghsToUsdRate();
    const balanceUsd = Number(user.balance) || 0;
    const balanceGhs = parseFloat((balanceUsd / rate).toFixed(2));
    return {
        id: user.id,
        username: user.username,
        email: user.email,
        balance: balanceUsd,
        balanceGhs,
    };
}

function callbackPublicOrigin(req) {
    const xfHost = req.get('x-forwarded-host');
    const host = (xfHost || req.get('host') || '').split(',')[0].trim();
    let proto = req.protocol || 'http';
    const xfProto = req.get('x-forwarded-proto');
    if (xfProto) proto = String(xfProto).split(',')[0].trim();
    if (!host) {
        const port = process.env.PORT || 3000;
        return `http://127.0.0.1:${port}`;
    }
    return `${proto}://${host}`.replace(/\/$/, '');
}

function resolveUserForTopup(db, uid, reference) {
    const pend = db.pendingPaystackTopups?.[reference];
    const pendUserId = pend?.userId != null ? String(pend.userId) : null;

    if (uid) {
        const i = db.users.findIndex((u) => u.id === uid);
        if (i !== -1) {
            if (pendUserId && uid !== pendUserId) return -1;
            return i;
        }
    }
    if (pendUserId) {
        return db.users.findIndex((u) => u.id === pendUserId);
    }
    return -1;
}

if (!fs.existsSync(dbPath)) {
    fs.writeFileSync(dbPath, JSON.stringify(normalizeDb({ users: [] }), null, 2));
}

function getDB() {
    const raw = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
    const db = normalizeDb(raw);
    prunePendingPaystackTopups(db);
    return db;
}

function saveDB(data) {
    const normalized = normalizeDb(data);
    fs.writeFileSync(dbPath, JSON.stringify(normalized, null, 2));
}

// ── Validation helpers ───────────────────────────────────────────────
const STRICT_EMAIL_RE = /^[a-zA-Z0-9](?:[a-zA-Z0-9._%+\-]*[a-zA-Z0-9])?@[a-zA-Z0-9](?:[a-zA-Z0-9\-]*[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9\-]*[a-zA-Z0-9])?)*\.[a-zA-Z]{2,12}$/;

function isValidEmail(s) {
    if (typeof s !== 'string' || s.length > 254) return false;
    if (!STRICT_EMAIL_RE.test(s)) return false;
    const local = s.split('@')[0];
    if (local.length < 2) return false;
    if (/^\d+$/.test(local)) return false;
    if (s.includes('..')) return false;
    return true;
}

function isDisposableEmail(email) {
    const domain = (email.split('@')[1] || '').toLowerCase();
    return DISPOSABLE_DOMAINS.has(domain);
}

const DISPOSABLE_DOMAINS = new Set([
    'tempmail.com', 'temp-mail.org', 'temp-mail.io', 'tempmailo.com',
    'guerrillamail.com', 'guerrillamail.net', 'guerrillamail.org', 'guerrillamailblock.com', 'grr.la', 'sharklasers.com',
    'mailinator.com', 'mailinator.net', 'mailinator2.com',
    'yopmail.com', 'yopmail.fr', 'yopmail.net',
    'throwaway.email', 'throwaway.com',
    '10minutemail.com', '10minutemail.net', '10minemail.com',
    'dispostable.com', 'disposableemailaddresses.emailmiser.com',
    'maildrop.cc', 'maildrop.ml',
    'fakeinbox.com', 'fakemail.net', 'fakemail.fr',
    'trashmail.com', 'trashmail.me', 'trashmail.net', 'trashmail.org',
    'mohmal.com', 'mohmal.im',
    'getnada.com', 'getnada.cc',
    'emailondeck.com',
    'mailnesia.com',
    'tempinbox.com',
    'mytemp.email',
    'tempr.email',
    'discard.email',
    'mailsac.com',
    'harakirimail.com',
    'spamgourmet.com',
    'tmail.ws',
    'mailcatch.com',
    'meltmail.com',
    'jetable.org',
    'incognitomail.org', 'incognitomail.com',
    'mintemail.com',
    'tempail.com',
    'burnermail.io',
    'crazymailing.com',
    'mailnull.com',
    'spamfree24.org',
    'boun.cr',
    'mailexpire.com',
    'tempomail.fr',
    'tmpmail.net', 'tmpmail.org',
    'emailfake.com',
    'generator.email',
    'inboxbear.com',
    'safetymail.info',
    'mailtemp.info',
    'receiveee.com',
    'tempmailer.com',
    'emailtemporanee.com',
    'mail-temporaire.fr',
    'ephemail.net',
    'filzmail.com',
    'trash-mail.com',
    'bugmenot.com',
    'nwldx.com',
    'dropmail.me',
    'instantemailaddress.com',
    'emailisvalid.com',
    'emailable.rocks',
    'anonymmail.net',
    'anonbox.net',
    'wegwerfmail.de', 'wegwerfmail.net',
]);

function isValidUsername(s) {
    return typeof s === 'string' && /^[a-zA-Z0-9_.-]{3,30}$/.test(s);
}

// ── Firebase Auth token verification ─────────────────────────────────
async function verifyFirebaseToken(req) {
    const hdr = req.headers.authorization;
    if (!hdr || !hdr.startsWith('Bearer ')) return null;
    const idToken = hdr.slice(7);
    if (!idToken || idToken.length < 20) return null;
    try {
        return await getAdminAuth().verifyIdToken(idToken);
    } catch (e) {
        return null;
    }
}

async function restoreUserFromFirestore(uid, email) {
    const fsUser = await getUserFromFirestore(uid);
    if (!fsUser) return null;
    fsUser.email = fsUser.email || (email || '').toLowerCase();
    return fsUser;
}

// ── AUTH ROUTES (Firebase Auth) ──────────────────────────────────────

app.post('/api/validate-signup', authLimiter, async (req, res) => {
    try {
        const { username, email } = req.body || {};
        if (!isValidUsername(username)) {
            return res.json({ success: false, message: 'Username must be 3-30 characters (letters, numbers, _ . -)' });
        }
        if (!isValidEmail(email)) {
            return res.json({ success: false, message: 'Enter a valid email address.' });
        }
        if (isDisposableEmail(email)) {
            return res.json({ success: false, message: 'Disposable/temporary email addresses are not allowed. Use a real email.' });
        }
        const db = getDB();
        const emailLower = email.toLowerCase();
        const usernameLower = username.toLowerCase();
        if (db.users.find((u) => u.email?.toLowerCase() === emailLower)) {
            return res.json({ success: false, message: 'Email already registered.' });
        }
        if (db.users.find((u) => u.username?.toLowerCase() === usernameLower)) {
            return res.json({ success: false, message: 'Username already taken.' });
        }
        res.json({ success: true });
    } catch (e) {
        console.error('[validate-signup]', e);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

app.post('/api/register', authLimiter, (req, res) => {
    runSignupSerial(async () => {
        try {
            const decoded = await verifyFirebaseToken(req);
            if (!decoded) return res.json({ success: false, message: 'Not authenticated' });

            const { username } = req.body || {};
            if (!isValidUsername(username)) {
                return res.json({ success: false, message: 'Username must be 3-30 characters (letters, numbers, _ . -)' });
            }

            const uid = decoded.uid;
            const email = (decoded.email || '').toLowerCase();

            let db = getDB();
            const existing = db.users.find((u) => u.id === uid);
            if (existing) {
                return res.json({ success: true, user: userPublicView(existing) });
            }
            if (db.users.find((u) => u.username?.toLowerCase() === username.toLowerCase())) {
                return res.json({ success: false, message: 'Username already taken.' });
            }
            if (email && db.users.find((u) => u.email?.toLowerCase() === email && u.id !== uid)) {
                return res.json({ success: false, message: 'Email already registered under a different account.' });
            }

            const newUser = { id: uid, username, email, balance: 0.0 };
            db = getDB();
            if (db.users.find((u) => u.id === uid)) {
                return res.json({ success: true, user: userPublicView(db.users.find((u) => u.id === uid)) });
            }
            db.users.push(newUser);
            saveDB(db);

            const fsOk = await syncUserToFirestore(newUser);
            if (!fsOk) console.warn(`[register] Firestore sync skipped for ${email}`);
            await ensureFreshGhsUsdRate();
            res.json({ success: true, user: userPublicView(newUser) });
        } catch (e) {
            console.error('[register]', e);
            if (!res.headersSent) res.status(500).json({ success: false, message: 'Server error' });
        }
    });
});

app.get('/api/me', async (req, res) => {
    try {
        const decoded = await verifyFirebaseToken(req);
        if (!decoded) return res.json({ success: false, message: 'Not authenticated' });

        let db = getDB();
        let user = db.users.find((u) => u.id === decoded.uid);

        if (!user) {
            user = await restoreUserFromFirestore(decoded.uid, decoded.email);
            if (user) {
                db = getDB();
                if (!db.users.find((u) => u.id === decoded.uid)) {
                    db.users.push(user);
                    saveDB(db);
                    console.log(`[me] Restored user ${decoded.uid} from Firestore`);
                }
            }
        }

        if (user) {
            await syncUserToFirestore(user);
            res.json({ success: true, user: userPublicView(user) });
        } else {
            res.json({ success: false, message: 'User not registered. Please complete sign-up.' });
        }
    } catch (e) {
        console.error('[me]', e);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// ── Paystack checkout ────────────────────────────────────────────────
app.post('/api/paystack/initialize', paymentLimiter, async (req, res) => {
    try {
        const decoded = await verifyFirebaseToken(req);
        if (!decoded) return res.json({ success: false, message: 'Unauthorized' });

        const { amountGHS } = req.body;
        const amt = Number(amountGHS);
        if (!Number.isFinite(amt) || amt < 10 || amt > 50000) {
            return res.json({ success: false, message: 'Enter a valid amount (GHS 10 – 50,000).' });
        }
        const db = getDB();
        const user = db.users.find((u) => u.id === decoded.uid);
        if (!user) {
            return res.json({ success: false, message: 'User not found. Please complete sign-up.' });
        }
        const reference = 'TOPUP_' + Date.now() + '_' + crypto.randomBytes(4).toString('hex');
        const callbackUrl = `${callbackPublicOrigin(req)}/paystack-callback.html`;
        const init = await initializePaystackTransaction({
            email: user.email,
            amountGHS: amt,
            reference,
            callbackUrl,
        });
        if (!init.ok) {
            return res.json({ success: false, message: init.reason || 'Could not start checkout' });
        }
        db.pendingPaystackTopups[reference] = { userId: user.id, expectedAmountGHS: amt, at: Date.now() };
        saveDB(db);
        res.json({
            success: true,
            authorizationUrl: init.authorizationUrl,
            reference: init.reference,
        });
    } catch (e) {
        console.error('[paystack/initialize]', e);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// ── Wallet credit (after Paystack verify) ────────────────────────────
app.post('/api/add-funds', paymentLimiter, (req, res) => {
    runAddFundsSerial(async () => {
        try {
            const { reference } = req.body;
            if (!reference || typeof reference !== 'string' || reference.length > 100) {
                res.json({ success: false, message: 'Missing payment reference' });
                return;
            }

            const decoded = await verifyFirebaseToken(req);
            const uid = decoded?.uid || null;

            let db = getDB();
            let userIndex = resolveUserForTopup(db, uid, reference);
            if (userIndex === -1) {
                res.json({
                    success: false,
                    message: 'Could not match this payment to your account. Please log in and try again, or contact support with your Paystack reference.',
                });
                return;
            }

            if (db.usedPaystackReferences.includes(reference)) {
                const u = db.users[userIndex];
                res.json({
                    success: true,
                    newBalance: u.balance,
                    newBalanceGhs: userPublicView(u).balanceGhs,
                    message: 'Payment already credited',
                });
                return;
            }

            const pend = db.pendingPaystackTopups?.[reference];
            const expectedGHS = pend?.expectedAmountGHS;

            const verify = await verifyPaystackTransaction(reference, expectedGHS);
            if (!verify.ok) {
                res.json({ success: false, message: verify.reason || 'Payment verification failed' });
                return;
            }

            const payData = verify.data;
            db = getDB();
            const userIndex2 = resolveUserForTopup(db, uid, reference);
            if (userIndex2 === -1) {
                res.json({ success: false, message: 'Unauthorized' });
                return;
            }
            if (db.usedPaystackReferences.includes(reference)) {
                const u = db.users[userIndex2];
                res.json({
                    success: true,
                    newBalance: u.balance,
                    newBalanceGhs: userPublicView(u).balanceGhs,
                    message: 'Payment already credited',
                });
                return;
            }

            const paidEmail = (payData.customer?.email || payData.authorization?.customer_email || '').toLowerCase();
            const userEmail = db.users[userIndex2].email.toLowerCase();
            if (paidEmail && paidEmail !== userEmail) {
                res.json({ success: false, message: 'Payment email does not match this account' });
                return;
            }

            const paidGHS = verify.amountGHS;
            const liveRate = await ensureFreshGhsUsdRate();
            const addedUsd = parseFloat((paidGHS * liveRate).toFixed(2));

            db.users[userIndex2].balance += addedUsd;
            db.usedPaystackReferences.push(reference);
            delete db.pendingPaystackTopups[reference];
            saveDB(db);

            const user = db.users[userIndex2];

            await logTransaction({
                type: 'paystack_topup',
                userId: user.id,
                reference,
                amountGHS: paidGHS,
                amountUsdCredited: addedUsd,
            });
            await syncUserToFirestore(user);

            console.log(`[add-funds] Credited $${addedUsd} (${paidGHS} GHS) ref=${reference}`);
            res.json({
                success: true,
                newBalance: user.balance,
                newBalanceGhs: userPublicView(user).balanceGhs,
            });
        } catch (e) {
            console.error('[add-funds]', e);
            if (!res.headersSent) res.status(500).json({ success: false, message: 'Server error' });
        }
    });
});

// ── Order route (server-side pricing) ────────────────────────────────
app.post('/api/order', (req, res) => {
    runOrderSerial(async () => {
        try {
            const decoded = await verifyFirebaseToken(req);
            if (!decoded) {
                res.json({ success: false, message: 'Unauthorized' });
                return;
            }

            const { serviceId, link, quantity } = req.body;
            const uid = decoded.uid;

            const qty = parseInt(quantity, 10);
            if (!serviceId || typeof serviceId !== 'string') {
                res.json({ success: false, message: 'Invalid service.' });
                return;
            }
            if (!Number.isFinite(qty) || qty < 100) {
                res.json({ success: false, message: 'Minimum order is 100.' });
                return;
            }
            if (!link || typeof link !== 'string' || link.length > 500) {
                res.json({ success: false, message: 'Provide a valid link.' });
                return;
            }

            const trueCost = serverSideCostUsd(serviceId, qty);
            if (trueCost == null || trueCost <= 0) {
                res.json({ success: false, message: 'Unknown service ID.' });
                return;
            }

            let db = getDB();
            let userIndex = db.users.findIndex((u) => u.id === uid);
            if (userIndex === -1) {
                res.json({ success: false, message: 'User not found. Please complete sign-up.' });
                return;
            }

            let user = db.users[userIndex];
            const balanceBefore = parseFloat(Number(user.balance).toFixed(2));
            if (balanceBefore < trueCost) {
                const deficit = parseFloat((trueCost - balanceBefore).toFixed(2));
                res.json({
                    success: false,
                    message: `Insufficient wallet balance. You need $${deficit} more. Please add funds.`,
                });
                return;
            }

            db = getDB();
            userIndex = db.users.findIndex((u) => u.id === uid);
            if (userIndex === -1) {
                res.json({ success: false, message: 'Unauthorized' });
                return;
            }
            user = db.users[userIndex];
            const freshBalance = parseFloat(Number(user.balance).toFixed(2));
            if (freshBalance < trueCost) {
                const deficit = parseFloat((trueCost - freshBalance).toFixed(2));
                res.json({
                    success: false,
                    message: `Insufficient wallet balance. You need $${deficit} more. Please add funds.`,
                });
                return;
            }

            user.balance = parseFloat((freshBalance - trueCost).toFixed(2));
            if (user.balance < 0) user.balance = 0;
            saveDB(db);

            const jap = await forwardOrderToProvider({ serviceId, link, quantity: qty, costUsd: trueCost });
            if (!jap.ok) {
                const dbRestore = getDB();
                const restoreIndex = dbRestore.users.findIndex((u) => u.id === uid);
                if (restoreIndex !== -1) {
                    dbRestore.users[restoreIndex].balance = parseFloat(
                        (Number(dbRestore.users[restoreIndex].balance) + trueCost).toFixed(2)
                    );
                    saveDB(dbRestore);
                    await syncUserToFirestore(dbRestore.users[restoreIndex]);
                }
                res.json({
                    success: false,
                    message: jap.error || 'Provider could not fulfill the order. Your balance was restored.',
                });
                return;
            }

            console.log(`[order] ${serviceId} qty=${qty} $${trueCost} balance_before=$${freshBalance} balance_after=$${user.balance}`);

            await logTransaction({
                type: 'order',
                userId: user.id,
                serviceId,
                link,
                quantity: qty,
                costUsd: trueCost,
                balanceBefore: freshBalance,
                balanceAfter: user.balance,
                providerSimulated: !!jap.simulated,
            });
            await syncUserToFirestore(user);

            res.json({
                success: true,
                message: 'Order created successfully.',
                newBalance: user.balance,
                newBalanceGhs: userPublicView(user).balanceGhs,
            });
        } catch (e) {
            console.error('[order]', e);
            if (!res.headersSent) res.status(500).json({ success: false, message: 'Server error' });
        }
    });
});

// ── FX rate endpoint ─────────────────────────────────────────────────
app.get('/api/fx/ghs-usd', async (_req, res) => {
    try {
        const rate = await ensureFreshGhsUsdRate();
        res.json({ success: true, ghsToUsd: rate });
    } catch {
        res.json({ success: true, ghsToUsd: ghsToUsdRate() });
    }
});

// ── Static & SPA (AFTER all /api routes) ─────────────────────────────
app.use(express.static(__dirname));

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// ── JSON error handler (always return JSON for /api, never HTML) ─────
app.use((err, req, res, next) => {
    if (err.status === 400 && err.type === 'entity.parse.failed') {
        return res.status(400).json({ success: false, message: 'Invalid JSON body' });
    }
    if (String(req.originalUrl || '').startsWith('/api') && !res.headersSent) {
        const code = Number(err.status || err.statusCode);
        const st = Number.isFinite(code) && code >= 400 && code < 600 ? code : 500;
        return res.status(st).json({ success: false, message: 'Server error' });
    }
    next(err);
});

// ── Start ────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
    console.log(`Server running on http://localhost:${PORT}`);
    if (initFirestoreAdmin()) {
        console.log('[Firestore] Admin OK');
    } else {
        console.warn('[Firestore] Admin not available — set FIREBASE_SERVICE_ACCOUNT_PATH.');
    }
    startGhsUsdRateRefreshLoop();
    const rate = await ensureFreshGhsUsdRate();
    console.log(`[fx] GHS→USD rate: ${rate} (auto-refreshes every 15m)`);
    console.log(`[catalog] ${Object.keys(SERVICE_PRICES).length} service prices loaded`);
});
