class ServicesSection extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
        <section id="services" class="container">
            <h2 class="sec-title">Our Services</h2>
            <p class="sec-subtitle">Choose from 9+ platforms and dozens of service categories. Real engagement, instant delivery.</p>
            <div class="tabs" id="tabs"></div>
            <div id="category-container" style="text-align: center; margin-bottom: 30px; display:flex; justify-content:center;"></div>
            <div class="grid" id="grid"></div>
        </section>
        `;
    }
}
customElements.define('app-services', ServicesSection);
