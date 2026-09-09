import axios from 'axios'

export const api = axios.create({
  baseURL: '/api',
  timeout: 6000,
})

// Wraps a call: tries the real backend first, falls back to a local function
// so the app is 100% functional even without the FastAPI server running.
export async function withFallback(apiCall, fallbackFn) {
  try {
    const res = await apiCall()
    return res.data
  } catch (err) {
    return fallbackFn()
  }
}
