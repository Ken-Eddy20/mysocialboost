class Footer extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
        <footer>
            <div class="container">
                <p>MySocialBoost — Your trusted social media growth partner.</p>
                <p style="margin-top: 10px;">Secure Payments by Paystack &middot; Available 24/7</p>
            </div>
        </footer>
        `;
    }
}
customElements.define('app-footer', Footer);
