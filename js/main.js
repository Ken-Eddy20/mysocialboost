const tabsEl = document.getElementById('tabs');
const gridEl = document.getElementById('grid');
const modal = document.getElementById('modal');
const qtyInp = document.getElementById('f-qty');
let selSvc = null;
let currentUser = null;
let walletListenUnsub = null;

function setBalanceLabel(balanceUsd) {
    const el = document.getElementById('balance');
    if (el) el.innerText = formatCurrency(balanceUsd);
}

async function refreshBalanceFromFirestore(user) {
    if (!user?.id || typeof window.getWallet !== 'function') return;
    try {
        const balance = await window.getWallet(user.id);
        setBalanceLabel(balance);
    } catch (e) {
        console.error(e);
    }
}

async function getAuthToken() {
    if (typeof window.fbGetToken === 'function') {
        return window.fbGetToken();
    }
    return null;
}

async function loadUserProfile() {
    const token = await getAuthToken();
    if (!token) return setAuthState(null);
    try {
        const res = await fetch('/api/me', { headers: { 'Authorization': `Bearer ${token}` } });
        const data = await res.json();
        if (data.success) {
            setAuthState(data.user);
        } else {
            setAuthState(null);
        }
    } catch (e) {
        console.error(e);
        setAuthState(null);
    }
}

window.onFirebaseAuthChanged = function (fbUser) {
    if (fbUser) {
        loadUserProfile();
    } else {
        setAuthState(null);
    }
};

function setAuthState(user) {
    walletListenUnsub?.();
    walletListenUnsub = null;
    currentUser = user;
    try {
        if (user) {
            if(document.getElementById('hero')) document.getElementById('hero').style.display = 'none';
            if(document.getElementById('landing-features')) document.getElementById('landing-features').style.display = 'none';
            if(document.getElementById('how')) document.getElementById('how').style.display = 'none';
            if(document.getElementById('payment')) document.getElementById('payment').style.display = 'none';
            
            // Move services grid into dashboard exclusively
            if(document.getElementById('dash-services-container') && document.getElementById('services')) {
                document.getElementById('dash-services-container').appendChild(document.getElementById('services'));
            }
            
            if(document.getElementById('dash-email')) document.getElementById('dash-email').textContent = user.username || user.email;
            if (typeof user.balance === 'number' && Number.isFinite(user.balance)) {
                setBalanceLabel(user.balance);
            }
            if (typeof window.listenToWallet === 'function') {
                walletListenUnsub = window.listenToWallet(user.id, (balance) => setBalanceLabel(balance));
            }
            void refreshBalanceFromFirestore(user);
            if(document.getElementById('dashboard')) document.getElementById('dashboard').style.display = 'block';
            
            if(document.getElementById('nav-guest')) document.getElementById('nav-guest').style.display = 'none';
            if(document.getElementById('nav-guest-btns')) document.getElementById('nav-guest-btns').style.display = 'none';
            if(document.getElementById('nav-user')) document.getElementById('nav-user').style.display = 'flex';
            if(document.getElementById('nav-user-btns')) document.getElementById('nav-user-btns').style.display = 'flex';
            
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            closeCheckoutPayPage(true);
            if(document.getElementById('hero')) document.getElementById('hero').style.display = 'block';
            if(document.getElementById('landing-features')) document.getElementById('landing-features').style.display = 'block';
            if(document.getElementById('how')) document.getElementById('how').style.display = 'block';
            if(document.getElementById('payment')) document.getElementById('payment').style.display = 'block';
            
            // Return services back to physical flow
            const appServices = document.querySelector('app-services');
            if(appServices && document.getElementById('services')) {
                appServices.appendChild(document.getElementById('services'));
            }
            
            if(document.getElementById('dashboard')) document.getElementById('dashboard').style.display = 'none';
            
            if(document.getElementById('nav-guest')) document.getElementById('nav-guest').style.display = 'flex';
            if(document.getElementById('nav-guest-btns')) document.getElementById('nav-guest-btns').style.display = 'flex';
            if(document.getElementById('nav-user')) document.getElementById('nav-user').style.display = 'none';
            if(document.getElementById('nav-user-btns')) document.getElementById('nav-user-btns').style.display = 'none';
        }
    } catch(e) {
        console.error('State UI Error:', e);
    }
}

async function logout() {
    try {
        if (typeof window.fbSignOut === 'function') await window.fbSignOut();
    } catch (e) { console.error(e); }
    setAuthState(null);
    toast('Logged out successfully', 'succ');
}

// ----- AUTH MODALS -----
function openSignupModal() { closeAuthModals(); document.getElementById('signup-modal').classList.add('open'); }
function openLoginModal() { closeAuthModals(); document.getElementById('login-modal').classList.add('open'); }
function closeAuthModals() {
    document.getElementById('signup-modal').classList.remove('open');
    document.getElementById('login-modal').classList.remove('open');
}

const STRICT_EMAIL_RE = /^[a-zA-Z0-9](?:[a-zA-Z0-9._%+\-]*[a-zA-Z0-9])?@[a-zA-Z0-9](?:[a-zA-Z0-9\-]*[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9\-]*[a-zA-Z0-9])?)*\.[a-zA-Z]{2,12}$/;
function isValidEmailClient(s) {
    if (typeof s !== 'string' || s.length > 254) return false;
    if (!STRICT_EMAIL_RE.test(s)) return false;
    if (s.split('@')[0].length < 2) return false;
    if (/^\d+$/.test(s.split('@')[0])) return false;
    if (s.includes('..')) return false;
    return true;
}

document.getElementById('signup-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('su-username').value.trim();
    const email = document.getElementById('su-email').value.trim();
    const password = document.getElementById('su-password').value;
    const confirmPassword = document.getElementById('su-confirm-password').value;

    if (!isValidEmailClient(email)) {
        return toast('Enter a valid email address (e.g. you@gmail.com).', 'err');
    }
    if (password !== confirmPassword) {
        return toast('Passwords do not match.', 'err');
    }
    if (password.length < 8) {
        return toast('Password must be at least 8 characters.', 'err');
    }
    if (!document.getElementById('su-terms').checked) {
        return toast('You must agree to the Terms and Conditions.', 'err');
    }

    const btn = e.target.querySelector('button[type="submit"]');
    if (btn) { btn.disabled = true; btn.textContent = 'Creating account…'; }

    try {
        const valRes = await fetch('/api/validate-signup', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email }),
        });
        const valData = await valRes.json();
        if (!valData.success) {
            toast(valData.message, 'err');
            if (btn) { btn.disabled = false; btn.textContent = 'Sign Up'; }
            return;
        }

        const cred = await window.fbSignUp(email, password);
        await window.fbUpdateProfile(cred.user, { displayName: username });

        const idToken = await cred.user.getIdToken();
        const regRes = await fetch('/api/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${idToken}` },
            body: JSON.stringify({ username }),
        });
        const regData = await regRes.json();
        if (regData.success) {
            setAuthState(regData.user);
            closeAuthModals();
            toast('Account created successfully!', 'succ');
        } else {
            toast(regData.message || 'Could not complete registration.', 'err');
        }
    } catch (err) {
        console.error(err);
        const code = err?.code || '';
        if (code === 'auth/email-already-in-use') {
            toast('This email is already registered. Please log in instead.', 'err');
        } else if (code === 'auth/weak-password') {
            toast('Password is too weak. Use at least 6 characters.', 'err');
        } else if (code === 'auth/invalid-email') {
            toast('Invalid email address.', 'err');
        } else {
            toast('Sign-up failed: ' + (err.message || 'Unknown error'), 'err');
        }
    } finally {
        if (btn) { btn.disabled = false; btn.textContent = 'Sign Up'; }
    }
});

document.getElementById('login-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('li-email').value.trim();
    const password = document.getElementById('li-password').value;

    const btn = e.target.querySelector('button[type="submit"]');
    if (btn) { btn.disabled = true; btn.textContent = 'Logging in…'; }

    try {
        await window.fbSignIn(email, password);
        closeAuthModals();
        toast('Logged in successfully!', 'succ');
    } catch (err) {
        console.error(err);
        const code = err?.code || '';
        if (code === 'auth/invalid-credential' || code === 'auth/wrong-password' || code === 'auth/user-not-found') {
            toast('Invalid email or password.', 'err');
        } else if (code === 'auth/too-many-requests') {
            toast('Too many failed attempts. Try again later or reset your password.', 'err');
        } else if (code === 'auth/invalid-email') {
            toast('Invalid email address.', 'err');
        } else {
            toast('Login failed: ' + (err.message || 'Unknown error'), 'err');
        }
    } finally {
        if (btn) { btn.disabled = false; btn.textContent = 'Log In'; }
    }
});

// ----- WALLET FUNDS -----
let pendingTopUpGHS = 0;
let checkoutFromFundsModal = false;
let selectedCheckoutMethod = null;

const CHECKOUT_METHOD_INFO = {
    momo: {
        title: 'Mobile Money',
        detail:
            'On the next screen, pick your network (MTN, Vodafone, or AirtelTigo). Approve the prompt on your phone or enter your MoMo PIN when Paystack asks.',
    },
    card: {
        title: 'Debit / credit card',
        detail:
            'On the next screen, enter your card number, expiry date, and CVV. Paystack processes the card; we never see or store your full card details.',
    },
    bank: {
        title: 'Bank',
        detail:
            'On the next screen, Paystack may offer bank transfer or pay-with-bank options depending on your bank. Follow the steps shown there.',
    },
};

function checkoutShowStep(step) {
    const pick = document.getElementById('checkout-step-pick');
    const review = document.getElementById('checkout-step-review');
    const backBtn = document.getElementById('checkout-nav-back');
    if (step === 'review') {
        pick?.classList.remove('is-active');
        review?.classList.add('is-active');
        if (backBtn) backBtn.textContent = '← Change method';
    } else {
        pick?.classList.add('is-active');
        review?.classList.remove('is-active');
        if (backBtn) backBtn.textContent = '← Back';
    }
}

function openAddFundsModal() { document.getElementById('funds-modal').classList.add('open'); }

function openCheckoutPayPage(amountGHS, fromFundsModal = false) {
    pendingTopUpGHS = Number(amountGHS);
    selectedCheckoutMethod = null;
    checkoutFromFundsModal = !!fromFundsModal;
    
    if (!currentUser) return;

    if (fromFundsModal) {
        document.getElementById('funds-modal').classList.remove('open');
    }

    const pg = document.getElementById('checkout-pay-fullpage');
    if (pg) {
        pg.classList.add('open');
        pg.setAttribute('aria-hidden', 'false');
    }
    
    document.body.style.overflow = 'hidden';
    checkoutShowStep('pick');
    
    const usd = pendingTopUpGHS * GHS_TO_USD;
    const sum = document.getElementById('checkout-pay-amount-summary');
    if (sum) sum.textContent = formatCurrency(usd);
    
    const hintC = document.getElementById('f-ghs-checkout-hint1');
    if (hintC) hintC.textContent = `(Paystack securely handles payments in Ghana Cedis. You will be billed roughly GHS ${pendingTopUpGHS.toFixed(2)}.)`;
    
    window.scrollTo(0, 0);
}

/** @param {boolean} [afterSuccess] if true, do not reopen the amount modal */
function closeCheckoutPayPage(afterSuccess) {
    const pg = document.getElementById('checkout-pay-fullpage');
    if (pg) {
        pg.classList.remove('open');
        pg.classList.remove('visible');
        pg.setAttribute('aria-hidden', 'true');
    }
    document.body.style.overflow = '';
    const reopen = checkoutFromFundsModal && !afterSuccess;
    checkoutFromFundsModal = false;
    pendingTopUpGHS = 0;
    if (reopen) openAddFundsModal();
}

function selectCheckoutPaymentMethod(methodId) {
    if (!pendingTopUpGHS || pendingTopUpGHS < 10) {
        toast(`Invalid amount. Please enter a valid equivalent of at least 10 GHS.`, 'err');
        return;
    }
    const info = CHECKOUT_METHOD_INFO[methodId];
    if (!info) return;
    selectedCheckoutMethod = methodId;
    
    checkoutShowStep('review');
    
    const usd = pendingTopUpGHS * GHS_TO_USD;
    const rev = document.getElementById('checkout-review-amount');
    if (rev) rev.textContent = formatCurrency(usd);
    
    const hintC = document.getElementById('f-ghs-checkout-hint2');
    if (hintC) hintC.textContent = `(Paystack securely handles payments in Ghana Cedis. You will be billed roughly GHS ${pendingTopUpGHS.toFixed(2)}.)`;
    
    const mName = document.getElementById('checkout-review-method-name');
    if (mName) mName.textContent = info.title;
    const em = document.getElementById('checkout-review-email');
    if (em) em.textContent = currentUser?.email || '—';
    const det = document.getElementById('checkout-review-detail');
    if (det) det.innerHTML = `<p>${info.detail}</p>`;
}

function checkoutGoBackToMethods() {
    selectedCheckoutMethod = null;
    checkoutShowStep('pick');
}

function checkoutNavBack() {
    const review = document.getElementById('checkout-step-review');
    if (review?.classList.contains('is-active')) {
        checkoutGoBackToMethods();
    } else {
        closeCheckoutPayPage();
    }
}

async function confirmCheckoutAndOpenPaystack() {
    if (!selectedCheckoutMethod) {
        toast('Choose a payment method first.', 'err');
        checkoutShowStep('pick');
        return;
    }
    if (!pendingTopUpGHS || pendingTopUpGHS < 10) {
        toast('Invalid amount.', 'err');
        return;
    }
    if (!currentUser) {
        toast('Please log in to fund your wallet.', 'err');
        return openLoginModal();
    }
    const authToken = await getAuthToken();
    if (!authToken) {
        toast('Session expired. Please log in again.', 'err');
        return openLoginModal();
    }
    const proto = window.location.protocol || '';
    if (proto !== 'http:' && proto !== 'https:') {
        toast(
            'Open this app at http://localhost:3000 (run "npm run dev" in the MysocialBoost folder). Do not open index.html as a file.',
            'err'
        );
        return;
    }
    const btn = document.querySelector('.checkout-review-pay');
    if (btn) btn.disabled = true;
    try {
        toast('Redirecting to Paystack…', 'info');
        const res = await fetch('/api/paystack/initialize', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Accept: 'application/json', 'Authorization': `Bearer ${authToken}` },
            body: JSON.stringify({
                amountGHS: pendingTopUpGHS,
                channel: selectedCheckoutMethod
            }),
        });
        const raw = await res.text();
        const trimmed = raw.trim();
        const ct = (res.headers.get('content-type') || '').toLowerCase();
        const bodyLooksHtml = /^\s*</.test(trimmed) || ct.includes('text/html');
        let data = {};
        try {
            data = trimmed ? JSON.parse(trimmed) : {};
        } catch (parseErr) {
            console.error('Paystack init non-JSON response', res.status, ct, trimmed.slice(0, 400));
            const expressNoRoute = /cannot\s+post\s+\/api/i.test(trimmed);
            const wrongHost =
                expressNoRoute || bodyLooksHtml || res.status === 404
                    ? expressNoRoute
                        ? ' Nothing on this port is running MysocialBoost: stop whatever uses the port (see server terminal), run "npm run dev" here, then reload this tab.'
                        : ' This URL is probably not your Node server: open the app only at the address printed when you run "npm run dev" (e.g. http://localhost:3000). Do not use Live Server or another static host for this project.'
                    : ' Check the server terminal for errors.';
            toast('Payment API did not return JSON.' + wrongHost, 'err');
            if (btn) btn.disabled = false;
            return;
        }
        const paystackUrl =
            (typeof data.authorizationUrl === 'string' && data.authorizationUrl.trim()) ||
            (typeof data.authorization_url === 'string' && data.authorization_url.trim()) ||
            '';
        if (!data.success || !/^https?:\/\//i.test(paystackUrl)) {
            console.error('Paystack init failed:', data);
            toast(data.message || 'Could not start checkout. Open DevTools (F12) → Network → paystack/initialize.', 'err');
            if (btn) btn.disabled = false;
            return;
        }
        try {
            (window.top || window).location.assign(paystackUrl);
        } catch {
            window.location.assign(paystackUrl);
        }
    } catch (e) {
        console.error(e);
        const hint =
            e instanceof TypeError && String(e.message || '').toLowerCase().includes('fetch')
                ? ' Browser could not reach /api. Start the server with npm run dev, then use the same address in the bar (e.g. http://localhost:3000).'
                : '';
        toast((e && e.message ? e.message : 'Request failed') + hint, 'err');
        if (btn) btn.disabled = false;
    }
}

function pay() {
    if (!currentUser) {
        toast('Please log in to fund your wallet.', 'err');
        return openLoginModal();
    }
    openCheckoutPayPage(100);
}

document.getElementById('f-amount-input')?.addEventListener('input', (e) => {
    const amt = parseFloat(e.target.value) || 0;
    
    let usd = 0;
    if (currentDisplayCurrency === 'USD') usd = amt;
    else if (currentDisplayCurrency === 'GHS') usd = amt * GHS_TO_USD;
    else usd = amt / (GLOBAL_RATES[currentDisplayCurrency] || 1);
    
    document.getElementById('f-amount-usd').textContent = usd.toFixed(2);
    
    const ghs = usd / GHS_TO_USD;
    const ghsWarning = document.getElementById('f-ghs-warning');
    if (ghsWarning) {
        ghsWarning.textContent = `Paystack will securely process your payment in Ghana Cedis. You'll be charged roughly GHS ${ghs.toFixed(2)}.`
    }
});

document.getElementById('funds-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const amt = parseFloat(document.getElementById('f-amount-input').value) || 0;
    
    let usd = 0;
    if (currentDisplayCurrency === 'USD') usd = amt;
    else if (currentDisplayCurrency === 'GHS') usd = amt * GHS_TO_USD;
    else usd = amt / (GLOBAL_RATES[currentDisplayCurrency] || 1);
    
    const amountGHS = parseInt(usd / GHS_TO_USD, 10);
    
    if (!Number.isFinite(amountGHS) || amountGHS < 10) {
        return toast('Enter a valid higher amount (minimum equivalent of GHS 10).', 'err');
    }
    document.getElementById('funds-modal').classList.remove('open');
    openCheckoutPayPage(amountGHS, true);
});

// ----- SERVICES RENDERING -----
function renderTabs() {
    Object.keys(services).forEach((plat, i) => {
        const btn = document.createElement('div');
        btn.className = `tab ${i===0?'active':''}`;
        btn.textContent = plat;
        btn.onclick = () => {
            document.querySelectorAll('.tab').forEach(t=>t.classList.remove('active'));
            btn.classList.add('active');
            renderCategories(plat);
        };
        tabsEl.appendChild(btn);
    });
    renderCategories(Object.keys(services)[0]);
}

function renderCategories(plat) {
    const catContainer = document.getElementById('category-container');
    if(!catContainer) return;
    catContainer.innerHTML = '';
    
    const wrap = document.createElement('div');
    wrap.style.display = 'inline-flex';
    wrap.style.alignItems = 'center';
    wrap.style.gap = '15px';
    
    const label = document.createElement('span');
    label.textContent = 'Select Category:';
    label.style.color = 'var(--cyan)';
    label.style.fontWeight = 'bold';
    
    const select = document.createElement('select');
    select.className = 'form-control';
    select.style.width = '280px';
    select.style.margin = '0';
    select.style.cursor = 'pointer';
    
    const categories = Object.keys(services[plat]);
    
    const defaultOpt = document.createElement('option');
    defaultOpt.textContent = '-- Select a Category --';
    defaultOpt.value = '';
    defaultOpt.disabled = true;
    defaultOpt.selected = true;
    select.appendChild(defaultOpt);

    categories.forEach(cat => {
        const opt = document.createElement('option');
        opt.value = cat;
        opt.textContent = cat;
        select.appendChild(opt);
    });
    
    select.onchange = (e) => {
        if(e.target.value) renderGrid(plat, e.target.value);
    };
    
    wrap.appendChild(label);
    wrap.appendChild(select);
    catContainer.appendChild(wrap);
    
    gridEl.innerHTML = '<p style="text-align:center; color:var(--muted); width:100%; padding: 20px;">Please select a category from the dropdown above to view packages.</p>';
}

function renderGrid(plat, cat) {
    gridEl.innerHTML = '';
    services[plat][cat].forEach(s => {
        const secondLabel = s.stay ? 'Duration' : s.time ? 'Watch Time' : 'Speed';
        const secondValue = s.stay || s.time || s.speed || '—';
        const thirdLabel = s.number ? 'Quantity' : 'Max';
        const thirdValue = s.number || s.max || '—';

        gridEl.innerHTML += `
            <div class="card">
                <h3>${s.name}</h3>
                <ul class="card-details">
                    <li><span class="label">Start Time:</span><span>${s.start}</span></li>
                    <li><span class="label">${secondLabel}:</span><span>${secondValue}</span></li>
                    <li><span class="label">${thirdLabel}:</span><span>${thirdValue}</span></li>
                </ul>
                <div class="price">$${s.price.toFixed(2)} <span>/ 1K</span></div>
                <button class="btn btn-primary" style="width:100%" onclick="openModal('${plat}','${cat}','${s.id}')">Order Now</button>
            </div>`;
    });

    if (window.appScrollObserver) {
        gridEl.querySelectorAll('.card').forEach((el, i) => {
            el.classList.add('animate-hidden');
            el.style.transitionDelay = `${(i % 10) * 0.05}s`;
            window.appScrollObserver.observe(el);
        });
    }
}

// ----- ORDERING LOGIC -----
function openModal(plat, cat, id) {
    if (!currentUser) {
        toast('Please Sign Up or Log In to place an order.', 'err');
        return openLoginModal();
    }
    selSvc = services[plat][cat].find(x => x.id === id);
    document.getElementById('s-name').textContent = `${plat} ${selSvc.name}`;
    document.getElementById('s-rate').textContent = `$${selSvc.price.toFixed(2)}`;
    updateSum();
    modal.classList.add('open');
}

function closeModal() { modal.classList.remove('open'); }
function setQty(q) { qtyInp.value = q; updateSum(); }

function updateSum() {
    if(!selSvc) return;
    const q = parseInt(qtyInp.value) || 0;
    const usd = (q / 1000) * selSvc.price;
    document.getElementById('s-usd').textContent = `$${usd.toFixed(2)}`;
    document.getElementById('s-ghs').textContent = `(≈ ${formatCurrency(usd)})`;
    if(document.getElementById('btn-cost')) document.getElementById('btn-cost').textContent = usd.toFixed(2);
}

qtyInp.addEventListener('input', updateSum);

document.getElementById('order-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    const link = document.getElementById('f-link').value;
    const qty = parseInt(qtyInp.value);
    const costUsd = parseFloat(((qty / 1000) * selSvc.price).toFixed(2));

    if (!currentUser) {
        toast('Please log in to place an order.', 'err');
        return openLoginModal();
    }

    const authToken = await getAuthToken();
    if (!authToken) {
        toast('Session expired. Please log in again.', 'err');
        return openLoginModal();
    }

    const walletBalance = Number(currentUser.balance) || 0;
    if (walletBalance < costUsd) {
        const deficit = (costUsd - walletBalance).toFixed(2);
        toast(`Insufficient balance. You need $${deficit} more. Please add funds.`, 'err');
        return;
    }

    const orderBtn = this.querySelector('button[type="submit"]');
    if (orderBtn) { orderBtn.disabled = true; orderBtn.textContent = 'Processing…'; }

    try {
        const res = await fetch('/api/order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}` },
            body: JSON.stringify({ serviceId: selSvc.id, link, quantity: qty }),
        });
        const data = await res.json();
        
        if (data.success) {
            currentUser.balance = data.newBalance;
            if (typeof data.newBalanceGhs === 'number' && Number.isFinite(data.newBalanceGhs)) {
                setBalanceLabel(data.newBalanceGhs);
            }
            void refreshBalanceFromFirestore(currentUser);
            toast('Order successfully placed using Wallet!', 'succ');
            closeModal();
            document.getElementById('order-form').reset();
        } else {
            toast('Order issue: ' + data.message, 'err');
        }
    } catch (err) {
        toast('Server error processing order. Please try again.', 'err');
    } finally {
        if (orderBtn) { orderBtn.disabled = false; orderBtn.textContent = 'Place Order'; }
    }
});

function toast(msg, type) {
    const icons = {
        succ: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
        err:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
        info: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>',
        warn: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
    };
    const titles = { succ: 'Success', err: 'Error', info: 'Info', warn: 'Warning' };
    const cls = type || 'info';

    const t = document.createElement('div');
    t.className = `toast ${cls}`;
    t.innerHTML = `
        <span class="toast-icon">${icons[cls] || icons.info}</span>
        <div class="toast-body">
            <div class="toast-title">${titles[cls] || 'Notice'}</div>
            <div class="toast-msg">${msg}</div>
        </div>
        <button class="toast-close" aria-label="Close">&times;</button>
        <span class="toast-progress"></span>
    `;
    t.querySelector('.toast-close').onclick = () => dismiss(t);
    document.getElementById('toasts').appendChild(t);
    requestAnimationFrame(() => t.classList.add('show'));

    const timer = setTimeout(() => dismiss(t), 4200);
    function dismiss(el) {
        clearTimeout(timer);
        el.classList.remove('show');
        setTimeout(() => el.remove(), 400);
    }
}

function consumeWalletTopupQuery() {
    const url = new URL(window.location.href);
    const st = url.searchParams.get('wallet_topup');
    if (!st) return;
    const msg = url.searchParams.get('msg');
    url.searchParams.delete('wallet_topup');
    url.searchParams.delete('msg');
    const q = url.searchParams.toString();
    window.history.replaceState({}, '', url.pathname + (q ? `?${q}` : ''));
    if (st === 'success') {
        toast('Funds successfully added to your wallet!', 'succ');
    } else if (st === 'fail') {
        toast(msg ? decodeURIComponent(msg) : 'Payment could not be completed.', 'err');
    }
}

// ----- VIEW SWITCHING (logged-in nav) -----
function updateActiveTab(viewId) {
    document.querySelectorAll('#nav-user .nav-tab').forEach(t => t.classList.remove('active'));
    const t = document.querySelector(`#nav-user .nav-tab[data-view="${viewId}"]`);
    if (t) t.classList.add('active');
}

function showDashboardView() {
    if (!currentUser) return;
    const dash = document.getElementById('dashboard');
    const how  = document.getElementById('how');
    if (dash) dash.style.display = 'block';
    if (how)  how.style.display  = 'none';
    updateActiveTab('dashboard');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function showServicesView() {
    showDashboardView();
    updateActiveTab('services');
    const svc = document.getElementById('services');
    if (svc) svc.scrollIntoView({ behavior: 'smooth' });
}

function showHowItWorksView() {
    if (!currentUser) return;
    const dash = document.getElementById('dashboard');
    const how  = document.getElementById('how');
    if (dash) dash.style.display = 'none';
    if (how)  how.style.display  = 'block';
    updateActiveTab('how');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function forgotPassword() {
    const email = prompt('Enter your email address to reset your password:');
    if (!email) return;
    if (!isValidEmailClient(email)) {
        return toast('Enter a valid email address.', 'err');
    }
    try {
        await window.fbResetPassword(email);
        toast('Password reset email sent! Check your inbox.', 'succ');
        closeAuthModals();
    } catch (err) {
        const code = err?.code || '';
        if (code === 'auth/user-not-found') {
            toast('No account found with that email.', 'err');
        } else {
            toast('Could not send reset email. Try again later.', 'err');
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    consumeWalletTopupQuery();
    
    // Setup global scroll observer for animations
    window.appScrollObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-visible');
                window.appScrollObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: "0px 0px -20px 0px" });

    // Initial setup of elements
    const animSelectors = ['.sec-title', '.sec-subtitle', '.feature-card', '.how-info-card', '.stat', '.pay-card', '.trust-bar span', '.how-timeline-item'];
    animSelectors.forEach(sel => {
        document.querySelectorAll(sel).forEach((el, index) => {
            el.classList.add('animate-hidden');
            if (el.closest('.features-grid') || el.closest('.how-info-grid') || el.closest('.pay-methods') || el.closest('.stats-bar') || el.closest('.trust-bar')) {
                const i = Array.from(el.parentNode.children).indexOf(el);
                el.style.transitionDelay = `${(i % 10) * 0.1}s`;
            }
            window.appScrollObserver.observe(el);
        });
    });

    renderTabs();
    if (typeof window.fbCheckPendingAuth === 'function') {
        window.fbCheckPendingAuth();
    }

    // Guest scroll tracking for tabs
    window.addEventListener('scroll', () => {
        if (currentUser) return;
        const scrollY = window.scrollY;
        const how = document.getElementById('how');
        const tabs = document.querySelectorAll('#nav-guest .nav-tab');
        if (!tabs.length) return;
        
        tabs.forEach(t => t.classList.remove('active'));
        if (how && scrollY > how.offsetTop - 300) {
            if(tabs[1]) tabs[1].classList.add('active');
        } else {
            if(tabs[0]) tabs[0].classList.add('active');
        }
    });
    
    window.addEventListener('currencyChanged', () => {
        // Sync selectors
        document.querySelectorAll('select[onchange*="setDisplayCurrency"]').forEach(s => s.value = currentDisplayCurrency);
        // Sync labels
        const amtLabel = document.getElementById('currency-input-label');
        if (amtLabel) amtLabel.textContent = currentDisplayCurrency;
        
        if (currentUser) {
            setBalanceLabel(currentUser.balance);
        }
        updateSum();
        
        // Retrigger Add Funds math to update preview
        const input = document.getElementById('f-amount-input');
        if(input) input.dispatchEvent(new Event('input'));
    });
});
