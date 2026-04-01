const MAX_RETRIES = 3;
const BASE_DELAY_MS = 1000;

async function fetchWithRetry(url, options, retries = MAX_RETRIES) {
    for (let attempt = 0; attempt <= retries; attempt++) {
        try {
            const ac = new AbortController();
            const tid = setTimeout(() => ac.abort(), 15000);
            const res = await fetch(url, { ...options, signal: ac.signal });
            clearTimeout(tid);

            if (res.status >= 500 && attempt < retries) {
                const delay = BASE_DELAY_MS * Math.pow(2, attempt);
                console.warn(`[Paystack] HTTP ${res.status} — retry ${attempt + 1}/${retries} in ${delay}ms`);
                await new Promise(r => setTimeout(r, delay));
                continue;
            }
            return res;
        } catch (e) {
            if (attempt < retries) {
                const delay = BASE_DELAY_MS * Math.pow(2, attempt);
                console.warn(`[Paystack] ${e.name === 'AbortError' ? 'Timeout' : e.message} — retry ${attempt + 1}/${retries} in ${delay}ms`);
                await new Promise(r => setTimeout(r, delay));
                continue;
            }
            throw e;
        }
    }
}

/**
 * Server-side verification — REQUIRED before crediting any wallet.
 *
 * @param {string} reference - Paystack transaction reference (untrusted until verified)
 * @param {number|undefined} expectedAmountGHS - if set, paid amount in pesewas must match
 */
export async function verifyPaystackTransaction(reference, expectedAmountGHS) {
    const secret = process.env.PAYSTACK_SECRET_KEY;
    if (!secret || secret.includes('YOUR_')) {
        return { ok: false, reason: 'Paystack secret key is not configured' };
    }
    const url = `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`;

    let res, body;
    try {
        res = await fetchWithRetry(url, { headers: { Authorization: `Bearer ${secret}` } });
        body = await res.json().catch(() => ({}));
    } catch (e) {
        console.error('[Paystack verify] All retries exhausted:', e.message);
        return { ok: false, reason: 'Could not reach Paystack. Please try again shortly.' };
    }

    if (!res.ok) {
        return { ok: false, reason: body.message || `Paystack verify HTTP ${res.status}` };
    }
    if (body.status !== true || !body.data) {
        return { ok: false, reason: body.message || 'Could not verify payment' };
    }

    const d = body.data;
    if (d.status !== 'success') {
        return { ok: false, reason: `Transaction status is "${d.status}", not success` };
    }
    const paidPesewas = Number(d.amount);
    const paidGHS = paidPesewas / 100;
    if (
        expectedAmountGHS != null &&
        expectedAmountGHS !== '' &&
        !Number.isNaN(Number(expectedAmountGHS))
    ) {
        const expectedPesewas = Math.round(Number(expectedAmountGHS) * 100);
        if (paidPesewas !== expectedPesewas) {
            return { ok: false, reason: 'Paid amount does not match requested top-up' };
        }
    }
    if (String(d.currency || '').toUpperCase() !== 'GHS') {
        return { ok: false, reason: 'Unexpected currency' };
    }
    return { ok: true, data: d, amountGHS: paidGHS };
}

/**
 * Start hosted Paystack checkout (full browser redirect to Paystack's payment page).
 */
export async function initializePaystackTransaction({ email, amountGHS, reference, callbackUrl, metadata, channels }) {
    const secret = process.env.PAYSTACK_SECRET_KEY;
    if (!secret || secret.includes('YOUR_')) {
        return { ok: false, reason: 'Paystack secret key is not configured' };
    }
    const payload = {
        email,
        amount: Math.round(Number(amountGHS) * 100),
        currency: 'GHS',
        reference,
        callback_url: callbackUrl,
    };
    const subaccount = process.env.PAYSTACK_SUBACCOUNT_CODE;
    if (subaccount) {
        payload.subaccount = subaccount;
    }
    if (metadata && typeof metadata === 'object') {
        payload.metadata = metadata;
    }
    if (channels && Array.isArray(channels)) {
        payload.channels = channels;
    }

    let res, body;
    try {
        res = await fetchWithRetry('https://api.paystack.co/transaction/initialize', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${secret}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });
        body = await res.json().catch(() => ({}));
    } catch (e) {
        console.error('[Paystack initialize] All retries exhausted:', e.message);
        return { ok: false, reason: 'Could not reach Paystack. Please try again shortly.' };
    }

    if (!res.ok) {
        const msg = body.message || `Paystack returned HTTP ${res.status}`;
        console.error('[Paystack initialize] HTTP error:', res.status, body);
        return { ok: false, reason: msg };
    }
    if (!body.status || !body.data?.authorization_url) {
        const msg = body.message || 'Paystack did not return a checkout URL';
        console.error('[Paystack initialize] rejected:', body);
        return { ok: false, reason: msg };
    }
    return {
        ok: true,
        authorizationUrl: body.data.authorization_url,
        reference: body.data.reference || reference,
    };
}
