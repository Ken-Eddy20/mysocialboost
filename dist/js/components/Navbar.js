class Navbar extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
        <nav>
            <div class="container nav-inner">
                <div class="logo">MySocialBoost</div>
                <div class="nav-links">
                    <a href="#services">Services</a>
                    <a href="#how">How It Works</a>
                    <a href="#payment">Payment</a>
                    
                    <!-- Guest Links -->
                    <div id="nav-guest" style="display:flex; gap:15px; align-items:center;">
                        <a href="javascript:void(0)" onclick="openLoginModal()">Login</a>
                        <a href="javascript:void(0)" class="btn btn-primary" style="padding: 5px 15px;" onclick="openSignupModal()">Sign Up</a>
                    </div>
                    
                    <!-- Authenticated Links -->
                    <div id="nav-user" style="display:none; gap:15px; align-items:center;">
                        <a href="#dashboard" style="color:var(--cyan); font-weight:600;">Dashboard</a>
                        <a href="javascript:void(0)" class="btn btn-secondary" style="padding: 5px 15px;" onclick="logout()">Logout</a>
                    </div>
                </div>
            </div>
        </nav>
        `;
    }
}
customElements.define('app-navbar', Navbar);
