class Dashboard extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
        <section id="dashboard" class="container" style="display:none; padding-top:120px; min-height:80vh;">
            <div style="background:var(--card); padding:30px; border-radius:12px; border:1px solid var(--border); margin-bottom:40px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:20px;">
                <div>
                    <h2>Welcome, <span id="dash-email" style="color:var(--cyan)">User</span></h2>
                    <p style="color:var(--muted)">Manage your social growth and wallet here.</p>
                </div>
                <div style="text-align:right;">
                    <p style="color:var(--muted); font-size:0.9rem; margin-bottom:5px;">Wallet Balance</p>
                    <h2 style="color:var(--cyan); font-size:2.5rem; line-height:1;"><span id="balance">GHS 0</span></h2>
                    <button class="btn btn-primary" style="margin-top:15px; padding:8px 20px;" onclick="openAddFundsModal()">Add Funds</button>
                </div>
            </div>
            
            <h2 class="sec-title" style="margin-bottom:20px; text-align:left; font-size:1.8rem;">Place New Order</h2>
            <!-- The services block gets injected securely here from main API -->
            <div id="dash-services-container"></div>
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
                        <p style="margin-top:8px; font-size:0.9rem; color:var(--cyan);">≈ $<span id="f-amount-usd">6.70</span> USD</p>
                    </div>
                    <button type="submit" class="btn btn-primary" style="width:100%">PAY</button>
                </form>
            </div>
        </div>

        <!-- Full-screen payment method chooser (after PAY) -->
        <div id="checkout-pay-fullpage" class="checkout-pay-fullpage" aria-hidden="true">
            <div class="checkout-pay-inner container">
                <button type="button" class="checkout-pay-back btn btn-secondary" id="checkout-nav-back" onclick="checkoutNavBack()">&larr; Back</button>

                <div id="checkout-step-pick" class="checkout-step is-active">
                    <h2 class="checkout-pay-title">Choose how to pay</h2>
                    <p class="checkout-pay-sub">Amount to add: <strong id="checkout-pay-amount-summary">GHS 0.00</strong></p>
                    <p class="checkout-pay-hint">Select how you want to pay. Next, you will review the details before opening the secure checkout.</p>
                    <div class="checkout-method-grid">
                        <button type="button" class="checkout-method-card" onclick="selectCheckoutPaymentMethod('momo')">
                            <span class="checkout-method-icon" aria-hidden="true">📱</span>
                            <h3>Mobile Money</h3>
                            <p>MTN MoMo, Vodafone Cash, AirtelTigo Money</p>
                            <span class="checkout-method-cta">Continue</span>
                        </button>
                        <button type="button" class="checkout-method-card" onclick="selectCheckoutPaymentMethod('card')">
                            <span class="checkout-method-icon" aria-hidden="true">💳</span>
                            <h3>Cards</h3>
                            <p>Visa, MasterCard, Verve and other bank cards</p>
                            <span class="checkout-method-cta">Continue</span>
                        </button>
                        <button type="button" class="checkout-method-card" onclick="selectCheckoutPaymentMethod('bank')">
                            <span class="checkout-method-icon" aria-hidden="true">🏦</span>
                            <h3>Bank</h3>
                            <p>Bank transfer and account-based payment options</p>
                            <span class="checkout-method-cta">Continue</span>
                        </button>
                    </div>
                </div>

                <div id="checkout-step-review" class="checkout-step">
                    <h2 class="checkout-pay-title">Review &amp; continue</h2>
                    <p class="checkout-pay-sub">Amount: <strong id="checkout-review-amount">GHS 0.00</strong></p>
                    <p class="checkout-review-method"><span class="checkout-review-label">Payment method</span><span id="checkout-review-method-name">—</span></p>
                    <p class="checkout-review-email"><span class="checkout-review-label">Paying as</span><span id="checkout-review-email">—</span></p>
                    <div class="checkout-review-detail" id="checkout-review-detail"></div>
                    <ul class="checkout-review-checklist">
                        <li>You will be taken to Paystack’s secure payment page to complete checkout.</li>
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
