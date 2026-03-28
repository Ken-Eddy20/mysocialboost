class Modal extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
        <div class="modal-bg" id="modal">
            <div class="modal">
                <div class="m-header">
                    <h3>New Order</h3>
                    <button class="m-close" onclick="closeModal()">&times;</button>
                </div>
                <form class="m-body" id="order-form">
                    <div class="form-group">
                        <label>Profile/Post Link</label>
                        <input type="url" id="f-link" class="form-control" required placeholder="https://...">
                    </div>
                    <div class="form-group">
                        <label>Quantity</label>
                        <input type="number" id="f-qty" class="form-control" required min="100" value="1000">
                        <div class="presets">
                            <button type="button" class="btn-preset" onclick="setQty(1000)">1K</button>
                            <button type="button" class="btn-preset" onclick="setQty(5000)">5K</button>
                            <button type="button" class="btn-preset" onclick="setQty(10000)">10K</button>
                            <button type="button" class="btn-preset" onclick="setQty(50000)">50K</button>
                        </div>
                    </div>
                    <div class="summary">
                        <p><span>Service:</span><span id="s-name">--</span></p>
                        <p><span>Price per 1K:</span><span id="s-rate">--</span></p>
                        <div class="total">
                            <div>Total:</div>
                            <div><span id="s-usd">$0.00</span> <span class="ghs" id="s-ghs">(GHS 0.00)</span></div>
                        </div>
                    </div>
                    <button type="submit" class="btn btn-primary" style="width:100%">Pay with Wallet ($<span id="btn-cost">0.00</span>)</button>
                </form>
            </div>
        </div>
        `;
    }
}
customElements.define('app-modal', Modal);
