class HowItWorks extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
        <section id="how" class="container">
            <h2 class="sec-title">How It Works</h2>
            <div class="steps">
                <div class="step"><div class="step-num">1</div><h4>Choose Service</h4><p>Select the platform and the type of metric you need.</p></div>
                <div class="step"><div class="step-num">2</div><h4>Enter Link</h4><p>Provide your public profile or post URL.</p></div>
                <div class="step"><div class="step-num">3</div><h4>Secure Payment</h4><p>Pay easily via Paystack with Card or Mobile Money.</p></div>
                <div class="step"><div class="step-num">4</div><h4>Watch It Grow</h4><p>Sit back and watch your stats skyrocket instantly!</p></div>
            </div>
        </section>
        `;
    }
}
customElements.define('app-how-it-works', HowItWorks);
