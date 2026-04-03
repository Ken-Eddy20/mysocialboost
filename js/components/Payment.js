class Payment extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
        <section id="payment" class="container">
            <h2 class="sec-title">Secure Payments</h2>
            <p class="sec-subtitle">All payments are securely processed by Paystack — we never see your card details or MoMo PIN.</p>
            <div class="pay-methods">
                <div class="pay-card">
                    <div class="pay-card-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg></div>
                    <h4>Mobile Money</h4>
                    <p>MTN MoMo, Vodafone Cash, AirtelTigo</p>
                </div>
                <div class="pay-card">
                    <div class="pay-card-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg></div>
                    <h4>Bank Cards</h4>
                    <p>Visa, MasterCard, Verve</p>
                </div>
                <div class="pay-card">
                    <div class="pay-card-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="22" x2="21" y2="22"/><line x1="6" y1="18" x2="6" y2="11"/><line x1="10" y1="18" x2="10" y2="11"/><line x1="14" y1="18" x2="14" y2="11"/><line x1="18" y1="18" x2="18" y2="11"/><polygon points="12 2 2 8 22 8"/></svg></div>
                    <h4>Bank Transfer</h4>
                    <p>Direct Bank Transfer available</p>
                </div>
            </div>
            <div style="text-align:center; margin-top:28px; margin-bottom:60px;">
                <button type="button" class="btn btn-primary" onclick="pay()">Fund Wallet</button>
            </div>
        </section>
        `;
    }
}
customElements.define('app-payment', Payment);
