class Footer extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
        <footer>
            <div class="container">
                <div class="footer-brand">MySocialBoost</div>
                <p>Your trusted social media growth partner across Africa.</p>
                <p style="margin-top: 8px; font-size: 0.85rem;">Secure Payments by Paystack · Available 24/7 · TikTok · Instagram · YouTube · Facebook · Twitter/X</p>
                <p style="margin-top: 16px; font-size: 0.8rem; opacity: 0.6;">© ${new Date().getFullYear()} MySocialBoost. All rights reserved.</p>
            </div>
        </footer>
        `;
    }
}
customElements.define('app-footer', Footer);
