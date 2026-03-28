class TermsModals extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
        <div class="modal-bg" id="terms-modal" style="z-index: 10000;">
            <div class="modal">
                <div class="m-header">
                    <h3>Terms and Conditions</h3>
                    <button class="m-close" onclick="document.getElementById('terms-modal').classList.remove('open')">&times;</button>
                </div>
                <div class="m-body" style="max-height: 50vh; overflow-y: auto; color: var(--muted); font-size: 0.9rem;">
                    <h4 style="color:var(--cyan); margin-bottom:10px;">1. Service Description</h4>
                    <p style="margin-bottom:15px;">MySocialBoost acts as a reseller. We do not guarantee interaction from targeted followers. Our services are strictly for increasing numerical appearance.</p>
                    
                    <h4 style="color:var(--cyan); margin-bottom:10px;">2. Payment and Refunds</h4>
                    <p style="margin-bottom:15px;">All payments are final. Refunds to payment methods are not provided. If an order cannot be fulfilled, the funds will be credited back to your Wallet Balance natively.</p>

                    <h4 style="color:var(--cyan); margin-bottom:10px;">3. Account Security</h4>
                    <p style="margin-bottom:15px;">You are responsible for maintaining the security of your username, password, and active API authorization tokens. We heavily advise against sharing your credentials.</p>

                    <h4 style="color:var(--cyan); margin-bottom:10px;">4. Refills and Metrics</h4>
                    <p style="margin-bottom:15px;">Social media platforms may periodically update their algorithms which may drop numerical data. We offer a 30-day refill guarantee strictly on services that specifically state 'Refill' in their initial description title.</p>
                </div>
                <div style="padding: 20px; border-top: 1px solid var(--border);">
                    <button type="button" class="btn btn-primary" style="width:100%" onclick="document.getElementById('terms-modal').classList.remove('open')">I Understand</button>
                </div>
            </div>
        </div>
        `;
    }
}
customElements.define('app-terms', TermsModals);

window.openTermsModal = function() {
    document.getElementById('terms-modal').classList.add('open');
};
