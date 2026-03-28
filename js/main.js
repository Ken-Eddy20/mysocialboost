const tabsEl = document.getElementById('tabs');
const gridEl = document.getElementById('grid');
const modal = document.getElementById('modal');
const qtyInp = document.getElementById('f-qty');
let selSvc = null;
let currentUser = null;
let walletListenUnsub = null;

function setBalanceLabel(balance) {
    const el = document.getElementById('balance');
    if (el) el.innerText = `GHS ${Number(balance).toFixed(2)}`;
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

async function checkSession() {
    const token = localStorage.getItem('token');
    if (!token) return setAuthState(null);
    
    try {
        const res = await fetch('/api/me', { headers: { 'Authorization': `Bearer ${token}` } });
        const data = await res.json();
        if (data.success) {
            setAuthState({ token, ...data.user });
        } else {
            localStorage.removeItem('token');
            setAuthState(null);
        }
    } catch(e) { console.error(e); }
}

function setAuthState(user) {
    walletListenUnsub?.();
    walletListenUnsub = null;
    currentUser = user;
    try {
        if (user) {
            if(document.getElementById('hero')) document.getElementById('hero').style.display = 'none';
            if(document.getElementById('how')) document.getElementById('how').style.display = 'none';
            if(document.getElementById('payment')) document.getElementById('payment').style.display = 'none';
            
            // Move services grid into dashboard exclusively
            if(document.getElementById('dash-services-container') && document.getElementById('services')) {
                document.getElementById('dash-services-container').appendChild(document.getElementById('services'));
            }
            
            if(document.getElementById('dash-email')) document.getElementById('dash-email').textContent = user.username || user.email;
            if (typeof user.balanceGhs === 'number' && Number.isFinite(user.balanceGhs)) {
                setBalanceLabel(user.balanceGhs);
            }
            if (typeof window.listenToWallet === 'function') {
                walletListenUnsub = window.listenToWallet(user.id, (balance) => setBalanceLabel(balance));
            }
            void refreshBalanceFromFirestore(user);
            if(document.getElementById('dashboard')) document.getElementById('dashboard').style.display = 'block';
            
            if(document.getElementById('nav-guest')) document.getElementById('nav-guest').style.display = 'none';
            if(document.getElementById('nav-user')) document.getElementById('nav-user').style.display = 'flex';
            
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            closeCheckoutPayPage(true);
            if(document.getElementById('hero')) document.getElementById('hero').style.display = 'block';
            if(document.getElementById('how')) document.getElementById('how').style.display = 'block';
            if(document.getElementById('payment')) document.getElementById('payment').style.display = 'block';
            
            // Return services back to physical flow
            const appServices = document.querySelector('app-services');
            if(appServices && document.getElementById('services')) {
                appServices.appendChild(document.getElementById('services'));
            }
            
            if(document.getElementById('dashboard')) document.getElementById('dashboard').style.display = 'none';
            
            if(document.getElementById('nav-guest')) document.getElementById('nav-guest').style.display = 'flex';
            if(document.getElementById('nav-user')) document.getElementById('nav-user').style.display = 'none';
        }
    } catch(e) {
        console.error('State UI Error:', e);
    }
}

function logout() {
    localStorage.removeItem('token');
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

document.getElementById('signup-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('su-username').value;
    const email = document.getElementById('su-email').value;
    const password = document.getElementById('su-password').value;
    const confirmPassword = document.getElementById('su-confirm-password').value;
    
    if (password !== confirmPassword) {
        return toast('Passwords do not match.', 'err');
    }
    if (!document.getElementById('su-terms').checked) {
        return toast('You must agree to the Terms and Conditions.', 'err');
    }

    try {
        const res = await fetch('/api/signup', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password })
        });
        const data = await res.json();
        if(data.success) {
            localStorage.setItem('token', data.token);
            setAuthState({ token: data.token, ...data.user });
            closeAuthModals();
            toast('Account created successfully!', 'succ');
        } else { toast(data.message, 'err'); }
    } catch(e) {
        console.error(e);
        toast('Critical error encountered signing up. Please check the console.', 'err');
    }
});

document.getElementById('login-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('li-email').value;
    const password = document.getElementById('li-password').value;
    try {
        const res = await fetch('/api/login', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        if(data.success) {
            localStorage.setItem('token', data.token);
            setAuthState({ token: data.token, ...data.user });
            closeAuthModals();
            toast('Logged in successfully!', 'succ');
        } else { toast(data.message, 'err'); }
    } catch (err) {
        console.error(err);
        toast('Network error logging in. Please try again.', 'err');
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
    const pg = document.getElementById('checkout-pay-fullpage');
    const sum = document.getElementById('checkout-pay-amount-summary');
    if (sum) sum.textContent = `GHS ${pendingTopUpGHS.toFixed(2)}`;
    if (pg) {
        pg.classList.add('open');
        pg.setAttribute('aria-hidden', 'false');
    }
    checkoutShowStep('pick');
    window.scrollTo(0, 0);
}

/** @param {boolean} [afterSuccess] if true, do not reopen the amount modal */
function closeCheckoutPayPage(afterSuccess) {
    const pg = document.getElementById('checkout-pay-fullpage');
    if (pg) {
        pg.classList.remove('open');
        pg.setAttribute('aria-hidden', 'true');
    }
    const reopen = checkoutFromFundsModal && !afterSuccess;
    checkoutFromFundsModal = false;
    pendingTopUpGHS = 0;
    if (reopen) openAddFundsModal();
}

function selectCheckoutPaymentMethod(methodId) {
    if (!pendingTopUpGHS || pendingTopUpGHS < 10) {
        toast('Invalid amount. Go back and enter at least GHS 10.', 'err');
        return;
    }
    const info = CHECKOUT_METHOD_INFO[methodId];
    if (!info) return;
    selectedCheckoutMethod = methodId;
    const amt = `GHS ${pendingTopUpGHS.toFixed(2)}`;
    const ra = document.getElementById('checkout-review-amount');
    if (ra) ra.textContent = amt;
    const mn = document.getElementById('checkout-review-method-name');
    if (mn) mn.textContent = info.title;
    const em = document.getElementById('checkout-review-email');
    if (em) em.textContent = currentUser?.email || '—';
    const det = document.getElementById('checkout-review-detail');
    if (det) det.innerHTML = `<p>${info.detail}</p>`;
    checkoutShowStep('review');
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
    if (!currentUser?.token) {
        toast('Please log in to fund your wallet.', 'err');
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
        toast('Redirecting to Paystack…', 'succ');
        // Same-origin only: Express must serve this page and /api (no Live Server on another port).
        const res = await fetch('/api/paystack/initialize', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
            body: JSON.stringify({
                token: currentUser.token,
                amountGHS: pendingTopUpGHS,
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

document.getElementById('f-amount-ghs')?.addEventListener('input', (e) => {
    const usd = (e.target.value * GHS_TO_USD).toFixed(2);
    document.getElementById('f-amount-usd').textContent = usd;
});

document.getElementById('funds-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const amountGHS = parseInt(document.getElementById('f-amount-ghs').value, 10);
    if (!Number.isFinite(amountGHS) || amountGHS < 10) {
        return toast('Enter a valid amount (minimum GHS 10).', 'err');
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
    const ghs = usd / GHS_TO_USD;
    document.getElementById('s-usd').textContent = `$${usd.toFixed(2)}`;
    document.getElementById('s-ghs').textContent = `(GHS ${ghs.toFixed(2)})`;
    if(document.getElementById('btn-cost')) document.getElementById('btn-cost').textContent = usd.toFixed(2);
}

qtyInp.addEventListener('input', updateSum);

document.getElementById('order-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    const link = document.getElementById('f-link').value;
    const qty = parseInt(qtyInp.value);
    const costUsd = parseFloat(((qty / 1000) * selSvc.price).toFixed(2));

    if (!currentUser || !currentUser.token) {
        toast('Please log in to place an order.', 'err');
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
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token: currentUser.token, serviceId: selSvc.id, link, quantity: qty, costUsd })
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
    const t = document.createElement('div');
    t.className = `toast show ${type}`;
    t.textContent = msg;
    document.getElementById('toasts').appendChild(t);
    setTimeout(() => { t.classList.remove('show'); setTimeout(()=>t.remove(),300); }, 4000);
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
function showDashboardView() {
    if (!currentUser) return;
    const dash = document.getElementById('dashboard');
    const how  = document.getElementById('how');
    if (dash) dash.style.display = 'block';
    if (how)  how.style.display  = 'none';
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function showServicesView() {
    showDashboardView();
    const svc = document.getElementById('services');
    if (svc) svc.scrollIntoView({ behavior: 'smooth' });
}

function showHowItWorksView() {
    if (!currentUser) return;
    const dash = document.getElementById('dashboard');
    const how  = document.getElementById('how');
    if (dash) dash.style.display = 'none';
    if (how)  how.style.display  = 'block';
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Initialize System
document.addEventListener('DOMContentLoaded', () => {
    consumeWalletTopupQuery();
    checkSession();
    renderTabs();
});
