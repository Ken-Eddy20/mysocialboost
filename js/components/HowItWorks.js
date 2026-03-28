class HowItWorks extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
        <section id="how" class="container">
            <h2 class="sec-title">How It Works</h2>
            <p class="how-lead">
                Grow your social media presence in minutes. MySocialBoost handles
                everything from secure payments to instant delivery across
                TikTok, Instagram, YouTube, Facebook, Twitter/X, Snapchat,
                LinkedIn, Spotify, and WhatsApp.
            </p>

            <!-- ── Timeline steps ─────────────────────────────────── -->
            <div class="how-timeline">
                <div class="how-timeline-item">
                    <div class="how-tl-icon">
                        <span class="step-num">1</span>
                    </div>
                    <div class="how-tl-content">
                        <h4>Create a free account</h4>
                        <p>Sign up with your email and a secure password &mdash; it takes under 30 seconds. Once logged in you&rsquo;ll land on your personal dashboard where you can manage orders, view your wallet, and track spending.</p>
                    </div>
                </div>

                <div class="how-timeline-item">
                    <div class="how-tl-icon">
                        <span class="step-num">2</span>
                    </div>
                    <div class="how-tl-content">
                        <h4>Fund your wallet</h4>
                        <p>Click <strong>Add Funds</strong>, enter any amount from GHS&nbsp;10 upward, and choose how to pay &mdash; Mobile Money (MTN MoMo, Vodafone Cash, AirtelTigo), debit/credit card, or bank transfer. Paystack handles the checkout; we never see your card number or MoMo PIN.</p>
                        <p>Your payment is verified on our server in real time. Once confirmed, the GHS amount is converted to USD at the live market rate and credited to your wallet instantly.</p>
                    </div>
                </div>

                <div class="how-timeline-item">
                    <div class="how-tl-icon">
                        <span class="step-num">3</span>
                    </div>
                    <div class="how-tl-content">
                        <h4>Pick a service &amp; package</h4>
                        <p>Browse platforms from the tabs &mdash; TikTok, Instagram, YouTube, and more. Select a category (Followers, Likes, Views, Comments, etc.) to see available packages.</p>
                        <p>Every package card shows the price per 1,000 units, estimated start time, delivery speed, and maximum order size. Choose between <strong>Normal</strong> (budget-friendly, no refill) and <strong>Premium</strong> (higher quality with refill guarantee).</p>
                    </div>
                </div>

                <div class="how-timeline-item">
                    <div class="how-tl-icon">
                        <span class="step-num">4</span>
                    </div>
                    <div class="how-tl-content">
                        <h4>Place your order</h4>
                        <p>Tap <strong>Order Now</strong>, paste the public link to your profile or post, and set the quantity. The total cost in USD and GHS updates live so there are no surprises.</p>
                        <p>Hit <strong>Place Order</strong> &mdash; the cost is deducted from your wallet and the order is routed to our provider network immediately. Delivery begins within the start time shown on the card.</p>
                    </div>
                </div>

                <div class="how-timeline-item">
                    <div class="how-tl-icon">
                        <span class="step-num">5</span>
                    </div>
                    <div class="how-tl-content">
                        <h4>Watch your numbers grow</h4>
                        <p>Check your profile or post analytics to see engagement climb. Premium packages include automatic refills if the count drops, so your growth sticks.</p>
                    </div>
                </div>
            </div>

            <!-- ── Info cards ─────────────────────────────────────── -->
            <h3 class="how-sub-heading">Good to know</h3>

            <div class="how-info-grid">
                <div class="how-info-card">
                    <div class="how-info-icon-wrap"><span class="how-info-icon">&#128176;</span></div>
                    <h4>Wallet &amp; pricing</h4>
                    <ul>
                        <li>Prices are in <strong>USD per 1,000</strong> units (followers, views, likes, etc.).</li>
                        <li>Top-ups are in GHS &mdash; converted at a live exchange rate that refreshes automatically.</li>
                        <li>Your dashboard shows your balance in GHS so you always know what you have.</li>
                        <li>Minimum top-up is <strong>GHS&nbsp;10</strong>; no maximum.</li>
                    </ul>
                </div>

                <div class="how-info-card">
                    <div class="how-info-icon-wrap"><span class="how-info-icon">&#128279;</span></div>
                    <h4>Links &amp; delivery</h4>
                    <ul>
                        <li>Always use a <strong>full, public URL</strong> &mdash; private or broken links will delay or fail the order.</li>
                        <li><strong>Start Time</strong> is when delivery begins after you place the order.</li>
                        <li><strong>Speed</strong> shows the approximate daily delivery rate.</li>
                        <li><strong>Max</strong> is the largest single order allowed for that package.</li>
                    </ul>
                </div>

                <div class="how-info-card">
                    <div class="how-info-icon-wrap"><span class="how-info-icon">&#128170;</span></div>
                    <h4>Normal vs Premium</h4>
                    <ul>
                        <li><strong>Normal</strong> &mdash; lower cost, solid delivery, no refill. Great for one-time boosts or testing a platform.</li>
                        <li><strong>Premium</strong> &mdash; higher quality with a refill guarantee. If the count drops within the refill window the lost amount is automatically restored.</li>
                        <li>Both tiers work on the same platforms and categories; pick the one that fits your budget and goals.</li>
                    </ul>
                </div>

                <div class="how-info-card">
                    <div class="how-info-icon-wrap"><span class="how-info-icon">&#128274;</span></div>
                    <h4>Security &amp; payments</h4>
                    <ul>
                        <li>Payments are processed entirely by <strong>Paystack</strong> &mdash; we never store card numbers or mobile money PINs.</li>
                        <li>Every top-up is <strong>verified server-side</strong> before your wallet is credited.</li>
                        <li>Your password is encrypted with industry-standard hashing; we cannot read it.</li>
                        <li>Use a strong, unique password and don&rsquo;t share your login.</li>
                    </ul>
                </div>

                <div class="how-info-card">
                    <div class="how-info-icon-wrap"><span class="how-info-icon">&#127760;</span></div>
                    <h4>Supported platforms</h4>
                    <ul>
                        <li><strong>TikTok</strong> &mdash; Followers, Views, Likes, Comments, Live Views, Shares, Saves</li>
                        <li><strong>Instagram</strong> &mdash; Followers, Post Likes, Reel/Story/IGTV Views, Comments, Saves, Reach</li>
                        <li><strong>YouTube</strong> &mdash; Subscribers, Views, Likes, Comments, Watch Time, Shorts, Live Views</li>
                        <li><strong>Facebook</strong> &mdash; Followers, Page Likes, Post Likes, Video Views, Shares, Live Views</li>
                        <li><strong>Twitter/X</strong> &mdash; Followers, Likes, Retweets, Impressions, Space Listeners</li>
                        <li><strong>Snapchat, LinkedIn, Spotify, WhatsApp</strong> &mdash; and more</li>
                    </ul>
                </div>

                <div class="how-info-card">
                    <div class="how-info-icon-wrap"><span class="how-info-icon">&#128172;</span></div>
                    <h4>FAQs</h4>
                    <ul>
                        <li><strong>How fast is delivery?</strong> Each package card shows its own start time and speed &mdash; some begin instantly, others within a few hours.</li>
                        <li><strong>Is my account safe?</strong> We only need a public link. We never ask for your social media password.</li>
                        <li><strong>What if an order fails?</strong> If the provider cannot fulfill the order, the cost is automatically refunded to your wallet.</li>
                        <li><strong>Can I get a refund?</strong> Refund policy is outlined in our <a href="#" onclick="document.getElementById('terms-modal').classList.add('open');return false;">Terms &amp; Conditions</a>.</li>
                    </ul>
                </div>
            </div>

            <!-- ── CTA strip ──────────────────────────────────────── -->
            <div class="how-cta-strip">
                <h3>Ready to grow?</h3>
                <p>Create your free account, fund your wallet, and place your first order in under two minutes.</p>
                <div class="how-cta-buttons">
                    <a href="#services" class="btn btn-primary">Browse Services</a>
                    <button class="btn btn-secondary" onclick="openSignupModal()">Sign Up Free</button>
                </div>
            </div>
        </section>
        `;
    }
}
customElements.define('app-how-it-works', HowItWorks);
