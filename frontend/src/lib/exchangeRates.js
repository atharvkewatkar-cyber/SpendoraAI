// Currency conversion service.
// All amounts in the app are stored in USD internally. This module converts
// USD -> target currency for display, using a live exchange rate API with a
// static fallback so the app still works offline or if the API is down.

const LIVE_RATE_URL = 'https://open.er-api.com/v6/latest/USD'

// Fallback rates (approximate, used if the live fetch fails or hasn't run yet)
const FALLBACK_RATES = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  INR: 83.5,
}

// Module-level cache so formatCurrency (a plain sync function) can read
// whatever the latest fetched rates are, without every call site needing
// to be async.
let ratesCache = { ...FALLBACK_RATES }
let lastUpdated = null
let fetchPromise = null

export function getCachedRates() {
  return ratesCache
}

export function getLastUpdated() {
  return lastUpdated
}

export function convertFromUSD(amountUSD, currency) {
  const rate = ratesCache[currency] ?? FALLBACK_RATES[currency] ?? 1
  return amountUSD * rate
}

export function convertToUSD(amount, currency) {
  const rate = ratesCache[currency] ?? FALLBACK_RATES[currency] ?? 1
  return amount / rate
}

// Fetches live rates once and caches them. Safe to call multiple times —
// concurrent calls share the same in-flight request.
export async function fetchLiveRates() {
  if (fetchPromise) return fetchPromise

  fetchPromise = fetch(LIVE_RATE_URL)
    .then(res => {
      if (!res.ok) throw new Error('Rate fetch failed')
      return res.json()
    })
    .then(data => {
      if (data.rates) {
        ratesCache = {
          USD: 1,
          EUR: data.rates.EUR ?? FALLBACK_RATES.EUR,
          GBP: data.rates.GBP ?? FALLBACK_RATES.GBP,
          INR: data.rates.INR ?? FALLBACK_RATES.INR,
        }
        lastUpdated = new Date().toISOString()
      }
      return ratesCache
    })
    .catch(() => {
      // Keep fallback rates; don't throw — caller can check getLastUpdated()
      // to see whether a live fetch ever succeeded.
      return ratesCache
    })
    .finally(() => {
      fetchPromise = null
    })

  return fetchPromise
}
