// ─────────────────────────────────────────────
// hooks/useDebounce.js
//
// Delays updating a value until the user has
// stopped changing it for `delay` milliseconds.
//
// Usage:
//   const debouncedSearch = useDebounce(searchText, 400)
//   useEffect(() => { fetchResults(debouncedSearch) }, [debouncedSearch])
//
// HOW IT WORKS:
// Every time `value` changes, we set a timer.
// If value changes again before the timer fires,
// we clear the old timer and start a new one.
// Only when the user stops typing for `delay` ms
// does the timer fire and update debouncedValue.
// ─────────────────────────────────────────────

import { useState, useEffect } from 'react'

const useDebounce = (value, delay = 400) => {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    // Start a timer to update the debounced value
    const timer = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    // Cleanup: if value changes before timer fires,
    // cancel the previous timer. This is the core
    // of debouncing — we only keep the LATEST timer.
    return () => clearTimeout(timer)

    // Re-run this effect whenever value or delay changes
  }, [value, delay])

  return debouncedValue
}

export default useDebounce