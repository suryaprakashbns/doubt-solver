// ─────────────────────────────────────────────
// utils/keepAlive.js
//
// Pings the backend every 10 minutes to prevent
// Render free tier from sleeping.
//
// Render sleeps after 15 minutes of inactivity.
// We ping every 10 minutes to stay under that limit.
// ─────────────────────────────────────────────

const BACKEND_URL = import.meta.env.VITE_API_BASE_URL?.replace('/api', '')

export const pingBackend = async () => {
  try {
    await fetch(`${BACKEND_URL}/`)
    console.log('Backend is awake')
  } catch {
    // Silent fail — don't show errors to user
  }
}

export const startKeepAlive = () => {
  // Ping immediately when app loads
  pingBackend()

  // Then ping every 10 minutes
  // 10 minutes = 600,000 milliseconds
  setInterval(pingBackend, 10 * 60 * 1000)
}