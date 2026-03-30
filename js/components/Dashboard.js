class Dashboard extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
        <section id="dashboard" style="display:none;">
            <!-- Dashboard banner -->
            <div class="dash-banner">
                <div class="dash-banner-bg" aria-hidden="true">
                    <svg class="db-shape db-s1" width="80" height="80" viewBox="0 0 80 80" fill="none"><circle cx="40" cy="40" r="36" stroke="rgba(255,255,255,0.08)" stroke-width="2"/></svg>
                    <svg class="db-shape db-s2" width="60" height="60" viewBox="0 0 60 60" fill="none"><rect x="4" y="4" width="52" height="52" rx="12" stroke="rgba(255,255,255,0.06)" stroke-width="2"/></svg>
                    <svg class="db-shape db-s3" width="50" height="50" viewBox="0 0 50 50" fill="none"><circle cx="25" cy="25" r="20" stroke="rgba(255,255,255,0.07)" stroke-width="2"/></svg>
                </div>
                <div class="container dash-banner-inner">
                    <div class="dash-banner-left">
                        <span class="dash-label">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
                            Dashboard
                        </span>
                        <h1 class="dash-welcome">Welcome back, <span id="dash-email">User</span></h1>
                        <p class="dash-sub">Manage your orders and grow your social presence.</p>
                    </div>
                    <div class="dash-banner-right">
                        <div class="dash-wallet-card">
                            <p class="dash-wallet-label">Wallet Balance</p>
                            <h2 class="dash-wallet-amount"><span id="balance">GHS 0</span></h2>
                            <button class="btn btn-wallet" onclick="openAddFundsModal()">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                                Add Funds
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Services -->
            <div class="container" style="padding-top:48px; padding-bottom:0;">
                <h2 class="sec-title" style="text-align:left; font-size:1.8rem; margin-bottom:20px;">Place New Order</h2>
                <div id="dash-services-container"></div>
            </div>

            <!-- Why Choose MySocialBoost — below services -->
            <div class="container" style="padding-top:60px; padding-bottom:60px;">
                <h2 class="sec-title">Why Choose MySocialBoost?</h2>
                <p class="sec-subtitle">Everything you need to grow your social media presence, all in one platform.</p>
                <div class="features-grid">
                    <div class="feature-card">
                        <div class="feature-icon fi-blue"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg></div>
                        <h3>Lightning Fast Delivery</h3>
                        <p>Most orders start delivering within minutes. Watch your numbers grow in real time.</p>
                    </div>
                    <div class="feature-card">
                        <div class="feature-icon fi-blue"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg></div>
                        <h3>100% Safe &amp; Secure</h3>
                        <p>We never ask for your passwords. All payments processed by Paystack with bank-level encryption.</p>
                    </div>
                    <div class="feature-card">
                        <div class="feature-icon fi-blue"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg></div>
                        <h3>Affordable Pricing</h3>
                        <p>Pay in GHS with Mobile Money, cards, or bank transfer. Prices start from just a few pesewas.</p>
                    </div>
                    <div class="feature-card">
                        <div class="feature-icon fi-blue"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg></div>
                        <h3>Refill Guarantee</h3>
                        <p>Premium packages include automatic refills. If your count drops, we top it back up for free.</p>
                    </div>
                </div>
            </div>
        </section>

        <!-- Add Funds Modal -->
        <div class="modal-bg" id="funds-modal">
            <div class="modal">
                <div class="m-header">
                    <h3>Add Funds to Wallet</h3>
                    <button class="m-close" onclick="document.getElementById('funds-modal').classList.remove('open')">&times;</button>
                </div>
                <form class="m-body" id="funds-form">
                    <p style="color:var(--muted); font-size:0.9rem; margin-bottom:15px;">Funds are securely processed via Paystack and instantly converted to USD balance.</p>
                    <div class="form-group">
                        <label>Amount (in GHS)</label>
                        <input type="number" id="f-amount-ghs" class="form-control" required min="10" value="100">
                        <p style="margin-top:8px; font-size:0.9rem; color:var(--cyan);">&asymp; $<span id="f-amount-usd">6.70</span> USD</p>
                    </div>
                    <button type="submit" class="btn btn-primary" style="width:100%">PAY</button>
                </form>
            </div>
        </div>

        <!-- Full-screen payment method chooser -->
        <div id="checkout-pay-fullpage" class="checkout-pay-fullpage" aria-hidden="true">
            <div class="checkout-pay-inner container">
                <button type="button" class="checkout-pay-back btn btn-secondary" id="checkout-nav-back" onclick="checkoutNavBack()">&larr; Back</button>

                <div id="checkout-step-pick" class="checkout-step is-active">
                    <h2 class="checkout-pay-title">Choose how to pay</h2>
                    <p class="checkout-pay-sub">Amount to add: <strong id="checkout-pay-amount-summary">GHS 0.00</strong></p>
                    <p class="checkout-pay-hint">Select how you want to pay. Next, you will review the details before opening the secure checkout.</p>
                    <div class="checkout-method-grid">
                        <button type="button" class="checkout-method-card" onclick="selectCheckoutPaymentMethod('momo')">
                            <span class="checkout-method-icon" aria-hidden="true"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg></span>
                            <h3>Mobile Money</h3>
                            <p>MTN MoMo, Vodafone Cash, AirtelTigo Money</p>
                            <span class="checkout-method-cta">Continue</span>
                        </button>
                        <button type="button" class="checkout-method-card" onclick="selectCheckoutPaymentMethod('card')">
                            <span class="checkout-method-icon" aria-hidden="true"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg></span>
                            <h3>Cards</h3>
                            <p>Visa, MasterCard, Verve and other bank cards</p>
                            <span class="checkout-method-cta">Continue</span>
                        </button>
                        <button type="button" class="checkout-method-card" onclick="selectCheckoutPaymentMethod('bank')">
                            <span class="checkout-method-icon" aria-hidden="true"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="22" x2="21" y2="22"/><line x1="6" y1="18" x2="6" y2="11"/><line x1="10" y1="18" x2="10" y2="11"/><line x1="14" y1="18" x2="14" y2="11"/><line x1="18" y1="18" x2="18" y2="11"/><polygon points="12 2 2 8 22 8"/></svg></span>
                            <h3>Bank</h3>
                            <p>Bank transfer and account-based payment options</p>
                            <span class="checkout-method-cta">Continue</span>
                        </button>
                    </div>
                </div>

                <div id="checkout-step-review" class="checkout-step">
                    <h2 class="checkout-pay-title">Review &amp; continue</h2>
                    <p class="checkout-pay-sub">Amount: <strong id="checkout-review-amount">GHS 0.00</strong></p>
                    <p class="checkout-review-method"><span class="checkout-review-label">Payment method</span><span id="checkout-review-method-name">&mdash;</span></p>
                    <p class="checkout-review-email"><span class="checkout-review-label">Paying as</span><span id="checkout-review-email">&mdash;</span></p>
                    <div class="checkout-review-detail" id="checkout-review-detail"></div>
                    <ul class="checkout-review-checklist">
                        <li>You will be taken to Paystack's secure payment page to complete checkout.</li>
                        <li>After paying, you will return here and your wallet balance will update automatically.</li>
                        <li>Do not refresh while Paystack is confirming your payment.</li>
                    </ul>
                    <div class="checkout-review-actions">
                        <button type="button" class="btn btn-primary checkout-review-pay" onclick="confirmCheckoutAndOpenPaystack()">Proceed to secure payment</button>
                        <button type="button" class="btn btn-secondary" onclick="checkoutGoBackToMethods()">Change payment method</button>
                    </div>
                </div>
            </div>
        </div>
        `;
    }
}
customElements.define('app-dashboard', Dashboard);
