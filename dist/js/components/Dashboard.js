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
                    <h2 style="color:var(--cyan); font-size:2.5rem; line-height:1;">$<span id="dash-balance">0.00</span></h2>
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
                    <button type="submit" class="btn btn-primary" style="width:100%">Pay via Paystack</button>
                </form>
            </div>
        </div>
        `;
    }
}
customElements.define('app-dashboard', Dashboard);
