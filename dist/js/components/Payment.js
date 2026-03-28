class Payment extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
        <section id="payment" class="container">
            <h2 class="sec-title">Secure Payments</h2>
            <p style="text-align:center; color: var(--muted); margin-bottom: 30px;">All payments are securely processed by Paystack.</p>
            <div class="pay-methods">
                <div class="pay-card"><h4>Mobile Money</h4><p>MTN MoMo, Vodafone Cash, AirtelTigo</p></div>
                <div class="pay-card"><h4>Bank Cards</h4><p>Visa, MasterCard, Verve</p></div>
                <div class="pay-card"><h4>Bank Transfer</h4><p>Direct Bank Transfer available</p></div>
            </div>
        </section>
        `;
    }
}
customElements.define('app-payment', Payment);
