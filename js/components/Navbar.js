class Navbar extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
        <nav>
            <div class="container nav-inner">
                <div class="logo">MySocialBoost</div>

                <!-- Guest nav -->
                <div class="nav-links" id="nav-guest">
                    <a href="#services" class="nav-tab active">
                        <svg viewBox="0 0 24 24"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg> 
                        Services
                    </a>
                    <a href="#how" class="nav-tab">
                        <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><polyline points="12 16 12 12 12 8"></polyline><line x1="12" y1="20" x2="12.01" y2="20"></line></svg>
                        How It Works
                    </a>
                </div>
                <div class="nav-links-right" id="nav-guest-btns">
                    <select class="form-control" onchange="setDisplayCurrency(this.value)" style="width: auto; padding: 6px 10px; font-size: 0.85rem; border-radius: 8px; font-weight: 600; cursor: pointer; background: var(--card); color: var(--text); border: 1px solid var(--border);">
                        <option value="GHS">GHS</option>
                        <option value="NGN">NGN</option>
                        <option value="KES">KES</option>
                        <option value="ZAR">ZAR</option>
                        <option value="USD">USD</option>
                    </select>
                    <a href="javascript:void(0)" class="btn btn-login" onclick="openLoginModal()">Log In</a>
                    <a href="javascript:void(0)" class="btn btn-get-started" onclick="openSignupModal()">Sign Up</a>
                </div>

                <!-- Logged-in nav -->
                <div class="nav-links" id="nav-user" style="display:none;">
                    <a href="javascript:void(0)" class="nav-tab active" onclick="showDashboardView()" data-view="dashboard">
                        <svg viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
                        Dashboard
                    </a>
                    <a href="javascript:void(0)" class="nav-tab" onclick="showServicesView()" data-view="services">
                        <svg viewBox="0 0 24 24"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
                        Services
                    </a>
                    <a href="javascript:void(0)" class="nav-tab" onclick="showHowItWorksView()" data-view="how">
                        <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><polyline points="12 16 12 12 12 8"></polyline><line x1="12" y1="20" x2="12.01" y2="20"></line></svg>
                        How It Works
                    </a>
                </div>
                <div class="nav-links-right" id="nav-user-btns" style="display:none;">
                    <select class="form-control" onchange="setDisplayCurrency(this.value)" style="width: auto; padding: 6px 10px; font-size: 0.85rem; border-radius: 8px; font-weight: 600; cursor: pointer; background: var(--card); color: var(--text); border: 1px solid var(--border);">
                        <option value="GHS">GHS</option>
                        <option value="NGN">NGN</option>
                        <option value="KES">KES</option>
                        <option value="ZAR">ZAR</option>
                        <option value="USD">USD</option>
                    </select>
                    <a href="javascript:void(0)" class="btn btn-secondary btn-nav" onclick="logout()">Logout</a>
                </div>
            </div>
        </nav>
        `;
    }
}
customElements.define('app-navbar', Navbar);
