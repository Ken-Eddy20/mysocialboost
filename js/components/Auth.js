class AuthModals extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
        <!-- Signup Modal -->
        <div class="modal-bg" id="signup-modal">
            <div class="modal">
                <div class="m-header">
                    <h3>Create Account</h3>
                    <button class="m-close" onclick="closeAuthModals()">&times;</button>
                </div>
                <form class="m-body" id="signup-form">
                    <div class="form-group">
                        <label>Username</label>
                        <input type="text" id="su-username" class="form-control" required placeholder="yourusername" minlength="3">
                    </div>
                    <div class="form-group">
                        <label>Email Address</label>
                        <input type="email" id="su-email" class="form-control" required placeholder="you@example.com">
                    </div>
                    <div class="form-group">
                        <label>Password</label>
                        <input type="password" id="su-password" class="form-control" required minlength="6" placeholder="••••••••">
                    </div>
                    <div class="form-group">
                        <label>Confirm Password</label>
                        <input type="password" id="su-confirm-password" class="form-control" required minlength="6" placeholder="••••••••">
                        <div style="margin-top: 8px; display: flex; align-items: center; gap: 5px;">
                            <input type="checkbox" id="su-toggle-pwd" onchange="document.getElementById('su-password').type = this.checked ? 'text' : 'password'; document.getElementById('su-confirm-password').type = this.checked ? 'text' : 'password';" style="width:16px; height:16px; cursor:pointer;">
                            <label for="su-toggle-pwd" style="margin:0; font-size:0.85rem; color:var(--muted); cursor:pointer;">Show Passwords</label>
                        </div>
                    </div>
                    <div class="form-group" style="display:flex; align-items:center; gap:10px;">
                        <input type="checkbox" id="su-terms" required style="width:18px; height:18px; cursor:pointer;" title="Agree to Terms">
                        <label style="margin:0; font-size:0.9rem;">I agree to the <a href="javascript:void(0)" onclick="openTermsModal()" style="color:var(--cyan);">Terms and Conditions</a></label>
                    </div>
                    <button type="submit" class="btn btn-primary" style="width:100%">Sign Up</button>
                    <p style="text-align:center; margin-top:15px; font-size:0.9rem; color:var(--muted);">Already have an account? <a href="javascript:void(0)" onclick="openLoginModal()" style="color:var(--cyan);">Log In</a></p>
                </form>
            </div>
        </div>

        <!-- Login Modal -->
        <div class="modal-bg" id="login-modal">
            <div class="modal">
                <div class="m-header">
                    <h3>Welcome Back</h3>
                    <button class="m-close" onclick="closeAuthModals()">&times;</button>
                </div>
                <form class="m-body" id="login-form">
                    <div class="form-group">
                        <label>Email Address</label>
                        <input type="email" id="li-email" class="form-control" required placeholder="you@example.com">
                    </div>
                    <div class="form-group">
                        <label>Password</label>
                        <input type="password" id="li-password" class="form-control" required placeholder="••••••••">
                        <div style="margin-top: 8px; display: flex; align-items: center; gap: 5px;">
                            <input type="checkbox" id="li-toggle-pwd" onchange="document.getElementById('li-password').type = this.checked ? 'text' : 'password';" style="width:16px; height:16px; cursor:pointer;">
                            <label for="li-toggle-pwd" style="margin:0; font-size:0.85rem; color:var(--muted); cursor:pointer;">Show Password</label>
                        </div>
                    </div>
                    <button type="submit" class="btn btn-primary" style="width:100%">Log In</button>
                    <p style="text-align:center; margin-top:10px; font-size:0.85rem;"><a href="javascript:void(0)" onclick="forgotPassword()" style="color:var(--cyan);">Forgot your password?</a></p>
                    <p style="text-align:center; margin-top:8px; font-size:0.9rem; color:var(--muted);">Don't have an account? <a href="javascript:void(0)" onclick="openSignupModal()" style="color:var(--cyan);">Sign Up</a></p>
                </form>
            </div>
        </div>
        `;
    }
}
customElements.define('app-auth', AuthModals);
