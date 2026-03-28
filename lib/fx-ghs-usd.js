/**
 * Live GHS→USD rate (USD per 1 GHS), same basis as https://open.er-api.com/v6/latest/GHS → rates.USD.
 * Cached to limit API calls; refresh on interval and via ensureFreshGhsUsdRate() before wallet operations.
 */

const API_URL = 'https://open.er-api.com/v6/latest/GHS';
const DEFAULT_CACHE_MS = 15 * 60 * 1000;
const MAX_RETRIES = 3;
const BASE_DELAY_MS = 1000;

function envFallbackRate() {
    const n = Number(process.env.GHS_TO_USD);
    return Number.isFinite(n) && n > 0 ? n : 0.067;
}

function cacheTtlMs() {
    const n = Number(process.env.FX_RATE_CACHE_MS);
    return Number.isFinite(n) && n >= 60_000 ? n : DEFAULT_CACHE_MS;
}

let cache = { rate: null, fetchedAt: 0 };

export function ghsToUsdRate() {
    if (cache.rate != null && cache.rate > 0) return cache.rate;
    return envFallbackRate();
}

async function fetchFxWithRetry() {
    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
        try {
            const ac = new AbortController();
            const tid = setTimeout(() => ac.abort(), 8000);
            const res = await fetch(API_URL, { signal: ac.signal });
            clearTimeout(tid);

            if (!res.ok) {
                if (res.status >= 500 && attempt < MAX_RETRIES) {
                    const delay = BASE_DELAY_MS * Math.pow(2, attempt);
                    console.warn(`[fx] HTTP ${res.status} — retry ${attempt + 1}/${MAX_RETRIES} in ${delay}ms`);
                    await new Promise(r => setTimeout(r, delay));
                    continue;
                }
                throw new Error(`HTTP ${res.status}`);
            }
            return res;
        } catch (e) {
            if (attempt < MAX_RETRIES) {
                const delay = BASE_DELAY_MS * Math.pow(2, attempt);
                console.warn(`[fx] ${e.name === 'AbortError' ? 'Timeout' : e.message} — retry ${attempt + 1}/${MAX_RETRIES} in ${delay}ms`);
                await new Promise(r => setTimeout(r, delay));
                continue;
            }
            throw e;
        }
    }
}

export async function ensureFreshGhsUsdRate() {
    const now = Date.now();
    if (cache.rate != null && now - cache.fetchedAt < cacheTtlMs()) {
        return cache.rate;
    }
    try {
        const res = await fetchFxWithRetry();
        const data = await res.json();
        const r = Number(data?.rates?.USD);
        if (Number.isFinite(r) && r > 0) {
            cache = { rate: r, fetchedAt: Date.now() };
            return r;
        }
    } catch (e) {
        console.warn('[fx] GHS/USD live rate fetch failed after retries:', e.message);
    }
    if (cache.rate != null && cache.rate > 0) return cache.rate;
    const fallback = envFallbackRate();
    cache = { rate: fallback, fetchedAt: Date.now() };
    return fallback;
}

export function startGhsUsdRateRefreshLoop() {
    const ms = cacheTtlMs();
    ensureFreshGhsUsdRate().catch(() => {});
    setInterval(() => {
        ensureFreshGhsUsdRate().catch(() => {});
    }, ms);
}
