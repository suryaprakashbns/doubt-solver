// ─────────────────────────────────────────────
// hooks/useAuth.js
//
// A custom hook that gives any component access
// to authentication state and functions.
//
// Usage in any component:
//   const { user, login, logout, isAuth } = useAuth()
//
// WHY A CUSTOM HOOK INSTEAD OF useContext DIRECTLY?
// 1. Cleaner syntax — useAuth() vs useContext(AuthContext)
// 2. We can throw a helpful error if someone uses
//    it outside AuthProvider (catches setup mistakes)
// 3. If we ever change the auth implementation,
//    we change this one file — not every component
// ─────────────────────────────────────────────

import { useContext } from 'react'
import { AuthContext } from '../context/AuthContext.jsx'

const useAuth = () => {
  const context = useContext(AuthContext)

  // If context is null, useAuth was called outside
  // of AuthProvider. This is a developer mistake —
  // throw a clear error instead of a confusing
  // "cannot read property of null" error.
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider')
  }

  return context
}

export default useAuth