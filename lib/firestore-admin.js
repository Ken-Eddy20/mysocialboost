import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
/** Project root (folder containing server.js), not process.cwd() */
const PROJECT_ROOT = path.resolve(__dirname, '..');

function resolveExistingServiceAccountFile(maybePath) {
    if (!maybePath) return null;
    const trimmed = maybePath.trim();
    const candidates = [];
    if (path.isAbsolute(trimmed)) {
        candidates.push(trimmed);
    } else {
        const noDot = trimmed.replace(/^\.\//, '');
        candidates.push(path.join(PROJECT_ROOT, noDot));
        candidates.push(path.resolve(process.cwd(), trimmed));
    }
    for (const filePath of candidates) {
        if (filePath && fs.existsSync(filePath)) return filePath;
    }
    return null;
}

function getServiceAccountFromEnv() {
    const jsonStr = process.env.FIREBASE_SERVICE_ACCOUNT_JSON?.trim();
    if (jsonStr) {
        try {
            return JSON.parse(jsonStr);
        } catch {
            console.error('[Firestore] FIREBASE_SERVICE_ACCOUNT_JSON is not valid JSON');
            return null;
        }
    }
    const envPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH || process.env.GOOGLE_APPLICATION_CREDENTIALS;
    const resolved = resolveExistingServiceAccountFile(envPath);
    if (resolved) {
        return JSON.parse(fs.readFileSync(resolved, 'utf8'));
    }
    for (const name of ['serviceAccountKey.json', 'serviceAccount.json']) {
        const fp = path.join(PROJECT_ROOT, name);
        if (fs.existsSync(fp)) {
            return JSON.parse(fs.readFileSync(fp, 'utf8'));
        }
    }
    return null;
}

const FIRESTORE_MAX_RETRIES = 3;
const FIRESTORE_BASE_DELAY_MS = 500;

async function firestoreRetry(label, fn) {
    for (let attempt = 0; attempt <= FIRESTORE_MAX_RETRIES; attempt++) {
        try {
            return await fn();
        } catch (e) {
            const retryable = e.code === 14 || e.code === 'unavailable' || e.code === 'deadline-exceeded'
                || e.code === 'resource-exhausted' || e.message?.includes('UNAVAILABLE')
                || e.message?.includes('DEADLINE_EXCEEDED');
            if (retryable && attempt < FIRESTORE_MAX_RETRIES) {
                const delay = FIRESTORE_BASE_DELAY_MS * Math.pow(2, attempt);
                console.warn(`[Firestore] ${label} — retry ${attempt + 1}/${FIRESTORE_MAX_RETRIES} in ${delay}ms`);
                await new Promise(r => setTimeout(r, delay));
                continue;
            }
            throw e;
        }
    }
}

let firestoreInstance = null;

export function initFirestoreAdmin() {
    if (firestoreInstance) return firestoreInstance;
    const svc = getServiceAccountFromEnv();
    if (!svc) {
        console.warn(
            '[Firestore] Admin not configured. Set FIREBASE_SERVICE_ACCOUNT_PATH (or FIREBASE_SERVICE_ACCOUNT_JSON) to your service account JSON. Signups and wallet updates will not appear in Firestore until then.'
        );
        return null;
    }
    try {
        if (!getApps().length) {
            initializeApp({ credential: cert(svc) });
        }
        firestoreInstance = getFirestore();
        return firestoreInstance;
    } catch (e) {
        console.error('[Firestore] init failed:', e.message);
        return null;
    }
}

import {
    ghsToUsdRate,
    ensureFreshGhsUsdRate,
    startGhsUsdRateRefreshLoop,
} from './fx-ghs-usd.js';

export { ghsToUsdRate, ensureFreshGhsUsdRate, startGhsUsdRateRefreshLoop };

/**
 * Writes `users/{id}` (profile) and `wallets/{id}` (balances) via Admin SDK.
 * Requires FIREBASE_SERVICE_ACCOUNT_PATH or FIREBASE_SERVICE_ACCOUNT_JSON.
 * @returns {boolean} true if Firestore was updated
 */
export async function syncUserToFirestore(user) {
    const id = user?.id != null ? String(user.id) : '';
    if (!id) return false;
    const fsdb = initFirestoreAdmin();
    if (!fsdb) return false;
    try {
        const { username, email } = user;
        await firestoreRetry('syncUser', () =>
            fsdb
                .collection('users')
                .doc(id)
                .set(
                    {
                        id,
                        username: username ?? '',
                        email: (email ?? '').toLowerCase(),
                        updatedAt: FieldValue.serverTimestamp(),
                    },
                    { merge: true }
                )
        );
        await syncUserWallet(id, Number(user.balance) || 0);
        return true;
    } catch (e) {
        console.error('[Firestore] syncUserToFirestore failed:', e.message);
        return false;
    }
}

export async function syncUserWallet(userId, balanceUsd) {
    try {
        const fsdb = initFirestoreAdmin();
        if (!fsdb) return;
        const rate = await ensureFreshGhsUsdRate();
        const balance = parseFloat((balanceUsd / rate).toFixed(2));
        await firestoreRetry('syncWallet', () =>
            fsdb
                .collection('wallets')
                .doc(userId)
                .set(
                    {
                        balance,
                        balanceUsd: parseFloat(Number(balanceUsd).toFixed(4)),
                        updatedAt: FieldValue.serverTimestamp(),
                    },
                    { merge: true }
                )
        );
    } catch (e) {
        console.error('[Firestore] syncUserWallet failed:', e.message);
    }
}

export async function getUserFromFirestore(uid) {
    const fsdb = initFirestoreAdmin();
    if (!fsdb) return null;
    try {
        const userDoc = await firestoreRetry('getUser', () =>
            fsdb.collection('users').doc(uid).get()
        );
        const walletDoc = await firestoreRetry('getWallet', () =>
            fsdb.collection('wallets').doc(uid).get()
        );
        if (!userDoc.exists) return null;
        const userData = userDoc.data();
        const walletData = walletDoc.exists ? walletDoc.data() : {};
        return {
            id: uid,
            username: userData.username || '',
            email: (userData.email || '').toLowerCase(),
            balance: walletData.balanceUsd || 0,
        };
    } catch (e) {
        console.error('[Firestore] getUserFromFirestore failed:', e.message);
        return null;
    }
}

export async function logTransaction(entry) {
    try {
        const fsdb = initFirestoreAdmin();
        if (!fsdb) return;
        await firestoreRetry('logTransaction', () =>
            fsdb.collection('transactions').add({
                ...entry,
                createdAt: FieldValue.serverTimestamp(),
            })
        );
    } catch (e) {
        console.error('[Firestore] logTransaction failed:', e.message);
    }
}
