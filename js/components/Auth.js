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
                    <div style="display:flex; flex-direction:column; gap:10px; margin-bottom:15px;">
                        <button type="button" class="btn" style="background:#fff; color:#000; display:flex; align-items:center; justify-content:center; gap:10px; font-weight:600; border:1px solid #ddd;" onclick="ssoLogin('google')">
                            <svg width="20" height="20" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                            Continue with Google
                        </button>
                        <button type="button" class="btn" style="background:#1877F2; color:#fff; display:flex; align-items:center; justify-content:center; gap:10px; font-weight:600; border:none;" onclick="ssoLogin('facebook')">
                            <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                            Continue with Facebook
                        </button>
                    </div>
                    <div style="display:flex; align-items:center; text-align:center; color:var(--muted); font-size:0.85rem; margin: 0 0 20px 0;">
                        <div style="flex:1; border-bottom:1px solid var(--border);"></div>
                        <span style="padding:0 10px;">or</span>
                        <div style="flex:1; border-bottom:1px solid var(--border);"></div>
                    </div>
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
                    <div style="display:flex; flex-direction:column; gap:10px; margin-bottom:15px;">
                        <button type="button" class="btn" style="background:#fff; color:#000; display:flex; align-items:center; justify-content:center; gap:10px; font-weight:600; border:1px solid #ddd;" onclick="ssoLogin('google')">
                            <svg width="20" height="20" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                            Continue with Google
                        </button>
                        <button type="button" class="btn" style="background:#1877F2; color:#fff; display:flex; align-items:center; justify-content:center; gap:10px; font-weight:600; border:none;" onclick="ssoLogin('facebook')">
                            <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                            Continue with Facebook
                        </button>
                    </div>
                    <div style="display:flex; align-items:center; text-align:center; color:var(--muted); font-size:0.85rem; margin: 0 0 20px 0;">
                        <div style="flex:1; border-bottom:1px solid var(--border);"></div>
                        <span style="padding:0 10px;">or</span>
                        <div style="flex:1; border-bottom:1px solid var(--border);"></div>
                    </div>
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
