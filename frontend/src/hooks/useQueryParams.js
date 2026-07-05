// ─────────────────────────────────────────────
// hooks/useQueryParams.js
//
// Syncs filter state with the URL query string.
//
// WHY URL-BASED STATE?
// 1. Shareable — /questions?search=react&sort=votes
//    sends someone directly to filtered results
// 2. Back button works — browser history stores
//    each filter change as a navigation entry
// 3. Refresh safe — filters persist on page reload
// 4. Bookmarkable — users can save filtered views
//
// HOW IT WORKS:
// useSearchParams from React Router gives us
// the current URL query params and a setter.
// We read from params and write back to params
// instead of using local useState.
//
// Usage:
//   const [params, setParam] = useQueryParams()
//   const search = params.get('search') || ''
//   setParam('search', 'react')
// ─────────────────────────────────────────────

import { useSearchParams, useNavigate } from 'react-router-dom'
import { useCallback } from 'react'

const useQueryParams = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()

  // Read a single param value
  const getParam = useCallback((key, defaultValue = '') => {
    return searchParams.get(key) || defaultValue
  }, [searchParams])

  // Set a single param — merges with existing params
  // so changing sort doesn't wipe out search
  const setParam = useCallback((key, value) => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev)
      if (value) {
        next.set(key, value)
      } else {
        // Remove the param entirely if value is empty
        next.delete(key)
      }
      // Always reset page to 1 when any filter changes
      if (key !== 'page') next.delete('page')
      return next
    })
  }, [setSearchParams])

  // Set multiple params at once
  const setParams = useCallback((updates) => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev)
      Object.entries(updates).forEach(([key, value]) => {
        if (value) {
          next.set(key, value)
        } else {
          next.delete(key)
        }
      })
      return next
    })
  }, [setSearchParams])

  // Clear all params — reset to default state
  const clearParams = useCallback(() => {
    setSearchParams({})
  }, [setSearchParams])

  return {
    getParam,
    setParam,
    setParams,
    clearParams,
    searchParams,
  }
}

export default useQueryParams