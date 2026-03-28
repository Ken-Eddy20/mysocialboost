class ApiInfo extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `
        <section id="api" class="container">
            <h2 class="sec-title">API Integration (JAP)</h2>
            <p style="text-align:center; color:var(--muted); margin-bottom: 20px;">We use JustAnotherPanel (JAP) to fulfill orders automatically.</p>
            <div class="api-box">
                <span style="color:#ff7b72;">POST</span> <span style="color:#a5d6ff;">https://justanotherpanel.com/api/v2</span><br><br>
                <span style="color:#8b949e;">// Example Payload</span><br>
                {<br>
                &nbsp;&nbsp;<span style="color:#79c0ff;">"key"</span>: <span style="color:#a5d6ff;">"YOUR_JAP_API_KEY"</span>,<br>
                &nbsp;&nbsp;<span style="color:#79c0ff;">"action"</span>: <span style="color:#a5d6ff;">"add"</span>,<br>
                &nbsp;&nbsp;<span style="color:#79c0ff;">"service"</span>: <span style="color:#a5d6ff;">101</span>,<br>
                &nbsp;&nbsp;<span style="color:#79c0ff;">"link"</span>: <span style="color:#a5d6ff;">"https://tiktok.com/@user"</span>,<br>
                &nbsp;&nbsp;<span style="color:#79c0ff;">"quantity"</span>: <span style="color:#a5d6ff;">1000</span><br>
                }
            </div>
        </section>
        `;
    }
}
customElements.define('app-api-info', ApiInfo);
