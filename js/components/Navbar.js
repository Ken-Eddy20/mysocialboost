class Navbar extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
        <nav>
            <div class="container nav-inner">
                <div class="logo">MySocialBoost</div>

                <!-- Guest nav -->
                <div class="nav-links" id="nav-guest">
                    <a href="#services">Services</a>
                    <a href="#how">How It Works</a>
                    <a href="javascript:void(0)" onclick="openLoginModal()">Login</a>
                    <a href="javascript:void(0)" class="btn btn-primary btn-nav" onclick="openSignupModal()">Sign Up</a>
                </div>

                <!-- Logged-in nav -->
                <div class="nav-links" id="nav-user" style="display:none;">
                    <a href="javascript:void(0)" onclick="showDashboardView()">Dashboard</a>
                    <a href="javascript:void(0)" onclick="showServicesView()">Services</a>
                    <a href="javascript:void(0)" onclick="showHowItWorksView()">How It Works</a>
                    <a href="javascript:void(0)" class="btn btn-secondary btn-nav" onclick="logout()">Logout</a>
                </div>
            </div>
        </nav>
        `;
    }
}
customElements.define('app-navbar', Navbar);
