class Hero extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
        <section id="hero">
            <div class="hero-accent-circle hero-accent-1"></div>
            <div class="hero-accent-circle hero-accent-2"></div>
            <div class="hero-vectors" aria-hidden="true">
                <svg class="hv hv-1" width="120" height="120" viewBox="0 0 120 120" fill="none"><circle cx="60" cy="60" r="55" stroke="rgba(255,255,255,0.08)" stroke-width="2"/><circle cx="60" cy="60" r="35" stroke="rgba(255,255,255,0.06)" stroke-width="2"/></svg>
                <svg class="hv hv-2" width="80" height="80" viewBox="0 0 80 80" fill="none"><rect x="4" y="4" width="72" height="72" rx="16" stroke="rgba(255,255,255,0.07)" stroke-width="2"/></svg>
                <svg class="hv hv-3" width="60" height="60" viewBox="0 0 60 60" fill="none"><polygon points="30,4 56,52 4,52" stroke="rgba(255,255,255,0.06)" stroke-width="2" fill="none"/></svg>
                <svg class="hv hv-4" width="100" height="100" viewBox="0 0 100 100" fill="none"><circle cx="50" cy="50" r="45" stroke="rgba(255,255,255,0.05)" stroke-width="2"/></svg>
                <svg class="hv hv-5" width="70" height="70" viewBox="0 0 70 70" fill="none"><rect x="4" y="4" width="62" height="62" rx="14" stroke="rgba(255,255,255,0.06)" stroke-width="2" transform="rotate(15 35 35)"/></svg>
                <svg class="hv hv-6" width="50" height="50" viewBox="0 0 50 50" fill="none"><circle cx="25" cy="25" r="20" stroke="rgba(255,255,255,0.07)" stroke-width="2"/><circle cx="25" cy="25" r="10" stroke="rgba(255,255,255,0.05)" stroke-width="2"/></svg>
            </div>

            <div class="container hero-split">
                <div class="hero-text">
                    <span class="hero-badge">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                        #1 Social Growth Platform in Africa
                    </span>
                    <h1>Grow Fast.<br><span class="hero-highlight">Get Noticed.</span></h1>
                    <p>Real followers, likes, and views — delivered in minutes across TikTok, Instagram, YouTube, and 6 more platforms. No passwords needed. Ever.</p>
                    <div class="hero-btns">
                        <a href="javascript:void(0)" class="btn btn-primary" onclick="openSignupModal()">Get Started Free</a>
                        <a href="#how" class="btn btn-secondary">See How It Works &rarr;</a>
                    </div>
                </div>

                <div class="hero-visual">
                    <div class="hero-phone-wrapper">
                        <div class="float-icon fi-tt" title="TikTok">
                            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1 0-5.78c.27 0 .54.04.79.1v-3.5a6.37 6.37 0 0 0-.79-.05A6.34 6.34 0 0 0 3.15 15.3 6.34 6.34 0 0 0 9.49 21.6a6.34 6.34 0 0 0 6.34-6.34V8.7a8.16 8.16 0 0 0 3.76.92V6.69z"/></svg>
                        </div>
                        <div class="float-icon fi-ig" title="Instagram">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="5"/><circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none"/></svg>
                        </div>
                        <div class="float-icon fi-yt" title="YouTube">
                            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2 31.9 31.9 0 0 0 0 12a31.9 31.9 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1c.5-1.9.5-5.8.5-5.8s0-3.9-.5-5.8zM9.6 15.6V8.4l6.3 3.6-6.3 3.6z"/></svg>
                        </div>
                        <div class="float-icon fi-fb" title="Facebook">
                            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M24 12a12 12 0 1 0-13.9 11.9v-8.4H7.1V12h3v-2.6c0-3 1.8-4.7 4.5-4.7 1.3 0 2.7.2 2.7.2v3h-1.5c-1.5 0-2 .9-2 1.9V12h3.3l-.5 3.5h-2.8v8.4A12 12 0 0 0 24 12z"/></svg>
                        </div>
                        <div class="float-icon fi-tw" title="Twitter / X">
                            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                        </div>
                        <div class="float-icon fi-sc" title="Snapchat">
                            <svg viewBox="0 0 24 24" fill="#000"><path d="M12.2 2C8.2 2 6.4 4.7 6.4 7.5v2c-.6 0-1.3.3-1.3.8 0 .6.5.9 1.2 1.1-.4 2.3-1.7 4-3.2 4.5-.3.1-.4.3-.4.5 0 .5.8 1 2 1.2.1.3.2.7.4.9.2.2.5.3.9.3.5 0 1-.2 1.8-.5.7-.2 1.6-.5 2.7-.5.9 0 1.6.2 2.3.5.8.3 1.5.5 2.1.5.3 0 .6-.1.8-.3.2-.2.3-.5.4-.8 1.2-.2 2-.7 2-1.2 0-.3-.2-.5-.4-.6-1.5-.5-2.8-2.2-3.2-4.4.7-.1 1.2-.5 1.2-1 0-.5-.6-.9-1.3-.9v-2C17.6 4.7 16 2 12.2 2z"/></svg>
                        </div>

                        <div class="hero-notif notif-top">
                            <div class="hero-notif-icon notif-green">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
                            </div>
                            <div><strong>+2,400</strong><br><span class="notif-sub">New followers today</span></div>
                        </div>
                        <div class="hero-notif notif-bottom">
                            <div class="hero-notif-icon notif-orange">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
                            </div>
                            <div><strong>Trending</strong><br><span class="notif-sub">Your post went viral!</span></div>
                        </div>

                        <div class="hero-phone">
                            <div class="phone-notch"></div>
                            <div class="phone-screen">
                                <div class="ps-header">@yourbrand</div>
                                <div class="ps-avatar">
                                    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                                </div>
                                <div class="ps-name">Your Brand</div>
                                <div class="ps-stats">
                                    <div><strong>25.4K</strong><span>Followers</span></div>
                                    <div><strong>1.2M</strong><span>Likes</span></div>
                                    <div><strong>850</strong><span>Posts</span></div>
                                </div>
                                <div class="ps-growth">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/></svg>
                                    +2,400 this week
                                </div>
                                <div class="ps-posts">
                                    <div class="ps-post-thumb"></div>
                                    <div class="ps-post-thumb"></div>
                                    <div class="ps-post-thumb"></div>
                                    <div class="ps-post-thumb"></div>
                                    <div class="ps-post-thumb"></div>
                                    <div class="ps-post-thumb"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="container">
                <div class="stats-bar">
                    <div class="stat"><h3>1M+</h3><p>Orders Completed</p></div>
                    <div class="stat"><h3>9</h3><p>Platforms Supported</p></div>
                    <div class="stat"><h3>24/7</h3><p>Instant Delivery</p></div>
                    <div class="stat"><h3>99%</h3><p>Satisfaction Rate</p></div>
                </div>
            </div>
        </section>

        <!-- Trust / Features -->
        <section id="landing-features" class="features-section">
            <div class="container">
                <div class="trust-bar">
                    <span>
                        <span class="trust-icon ti-blue"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg></span>
                        Secure Payments
                    </span>
                    <span>
                        <span class="trust-icon ti-amber"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg></span>
                        Instant Delivery
                    </span>
                    <span>
                        <span class="trust-icon ti-green"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg></span>
                        Refill Guarantee
                    </span>
                    <span>
                        <span class="trust-icon ti-purple"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg></span>
                        Works Across Africa
                    </span>
                </div>

                <h2 class="sec-title" style="margin-top: 40px;">Why Choose MySocialBoost?</h2>
                <p class="sec-subtitle">Everything you need to grow your social media presence, all in one platform.</p>

                <div class="features-grid">
                    <div class="feature-card fc-amber">
                        <div class="feature-icon fi-amber"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg></div>
                        <h3>Lightning Fast Delivery</h3>
                        <p>Most orders start delivering within minutes. Watch your numbers grow in real time.</p>
                    </div>
                    <div class="feature-card fc-green">
                        <div class="feature-icon fi-green"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg></div>
                        <h3>100% Safe &amp; Secure</h3>
                        <p>We never ask for your passwords. All payments processed by Paystack with bank-level encryption.</p>
                    </div>
                    <div class="feature-card fc-purple">
                        <div class="feature-icon fi-purple"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg></div>
                        <h3>Affordable Pricing</h3>
                        <p>Pay in GHS with Mobile Money, cards, or bank transfer. Prices start from just a few pesewas.</p>
                    </div>
                    <div class="feature-card fc-blue">
                        <div class="feature-icon fi-blue"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg></div>
                        <h3>Refill Guarantee</h3>
                        <p>Premium packages include automatic refills. If your count drops, we top it back up for free.</p>
                    </div>
                </div>
            </div>
        </section>
        `;
    }
}
customElements.define('app-hero', Hero);
