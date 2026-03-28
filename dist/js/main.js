const tabsEl = document.getElementById('tabs');
const gridEl = document.getElementById('grid');
const modal = document.getElementById('modal');
const qtyInp = document.getElementById('f-qty');
let selSvc = null;
let currentUser = null;

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
            if(document.getElementById('dash-balance')) document.getElementById('dash-balance').textContent = user.balance.toFixed(2);
            if(document.getElementById('dashboard')) document.getElementById('dashboard').style.display = 'block';
            
            if(document.getElementById('nav-guest')) document.getElementById('nav-guest').style.display = 'none';
            if(document.getElementById('nav-user')) document.getElementById('nav-user').style.display = 'flex';
            
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
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
});

// ----- WALLET FUNDS -----
function openAddFundsModal() { document.getElementById('funds-modal').classList.add('open'); }

document.getElementById('f-amount-ghs')?.addEventListener('input', (e) => {
    const usd = (e.target.value * GHS_TO_USD).toFixed(2);
    document.getElementById('f-amount-usd').textContent = usd;
});

document.getElementById('funds-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const amountGHS = parseInt(document.getElementById('f-amount-ghs').value);
    const pesewas = Math.round(amountGHS * 100);

    if (typeof PaystackPop === 'undefined') return toast('Paystack is not loaded', 'err');

    let handler = PaystackPop.setup({
        key: PAYSTACK_PUBLIC_KEY,
        email: currentUser.email,
        amount: pesewas,
        currency: 'GHS',
        ref: 'TOPUP_'+Math.floor((Math.random() * 1000000000) + 1),
        callback: async function(response) {
            toast('Payment verified! Adding funds...', 'succ');
            const res = await fetch('/api/add-funds', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token: currentUser.token, reference: response.reference, amountGHS })
            });
            const data = await res.json();
            if(data.success) {
                currentUser.balance = data.newBalance;
                document.getElementById('dash-balance').textContent = currentUser.balance.toFixed(2);
                document.getElementById('funds-modal').classList.remove('open');
                toast('Funds successfully added to your wallet!', 'succ');
            } else { toast('Wallet update failed.', 'err'); }
        },
        onClose: function() { toast('Payment cancelled.', 'err'); }
    });
    handler.openIframe();
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
        gridEl.innerHTML += `
            <div class="card">
                <h3>${s.name}</h3>
                <ul class="card-details">
                    <li><span class="label">Start Time:</span><span>${s.start}</span></li>
                    <li><span class="label">Speed:</span><span>${s.speed}</span></li>
                    <li><span class="label">Max:</span><span>${s.max}</span></li>
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

    try {
        const res = await fetch('/api/order', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token: currentUser.token, serviceId: selSvc.id, link, quantity: qty, costUsd })
        });
        const data = await res.json();
        
        if (data.success) {
            currentUser.balance = data.newBalance;
            document.getElementById('dash-balance').textContent = currentUser.balance.toFixed(2);
            toast('Order successfully placed using Wallet!', 'succ');
            closeModal();
            document.getElementById('order-form').reset();
        } else {
            toast('Order issue: ' + data.message, 'err');
        }
    } catch (err) {
        toast('Server error processing order.', 'err');
    }
});

function toast(msg, type) {
    const t = document.createElement('div');
    t.className = `toast show ${type}`;
    t.textContent = msg;
    document.getElementById('toasts').appendChild(t);
    setTimeout(() => { t.classList.remove('show'); setTimeout(()=>t.remove(),300); }, 4000);
}

// Initialize System
document.addEventListener('DOMContentLoaded', () => {
    checkSession();
    renderTabs();
});
