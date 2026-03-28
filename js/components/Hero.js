class Hero extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
        <section id="hero">
            <div class="container">
                <h1>Supercharge Your Social Growth</h1>
                <p>Premium social media marketing services safely delivered directly to your account. Buy real followers, likes, and views instantly.</p>
                <div style="display:flex; justify-content:center; gap:15px;">
                    <a href="#services" class="btn btn-primary">Browse Services</a>
                    <a href="#how" class="btn btn-secondary">How It Works</a>
                </div>
                <div class="stats-bar">
                    <div class="stat"><h3>1M+</h3><p>Orders Completed</p></div>
                    <div class="stat"><h3>5</h3><p>Platforms Supported</p></div>
                    <div class="stat"><h3>24/7</h3><p>Live Support</p></div>
                    <div class="stat"><h3>99%</h3><p>Satisfaction Rate</p></div>
                </div>
            </div>
        </section>
        `;
    }
}
customElements.define('app-hero', Hero);
