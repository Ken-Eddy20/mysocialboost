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
                console.warn(`[JAP] HTTP ${res.status} — retry ${attempt + 1}/${retries} in ${delay}ms`);
                await new Promise(r => setTimeout(r, delay));
                continue;
            }
            return res;
        } catch (e) {
            if (attempt < retries) {
                const delay = BASE_DELAY_MS * Math.pow(2, attempt);
                console.warn(`[JAP] ${e.name === 'AbortError' ? 'Timeout' : e.message} — retry ${attempt + 1}/${retries} in ${delay}ms`);
                await new Promise(r => setTimeout(r, delay));
                continue;
            }
            throw e;
        }
    }
}

/**
 * JustAnotherPanel (or your reseller) API with retry logic.
 */
export async function forwardOrderToProvider({ serviceId, link, quantity, costUsd }) {
    const key = process.env.JAP_API_KEY;
    if (!key || key.includes('YOUR_')) {
        console.warn(
            `[JAP] Order not forwarded (no API key). service=${serviceId} qty=${quantity} costUsd=${costUsd}`
        );
        return { ok: true, simulated: true };
    }
    const base = process.env.JAP_API_URL || 'https://justanotherpanel.com/api/v2';
    try {
        const res = await fetchWithRetry(base, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                key,
                action: 'add',
                service: serviceId,
                link,
                quantity,
            }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
            console.error('[JAP] HTTP error', res.status, data);
            return { ok: false, error: data?.error || res.statusText };
        }
        if (data.error) {
            console.error('[JAP] API error', data.error);
            return { ok: false, error: data.error };
        }
        return { ok: true, data };
    } catch (e) {
        console.error('[JAP] All retries exhausted:', e.message);
        return { ok: false, error: 'Provider is temporarily unavailable. Please try again shortly.' };
    }
}
