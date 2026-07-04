// ─────────────────────────────────────────────
// context/AuthContext.jsx
//
// Provides authentication state to the entire app.
//
// What it manages:
// - user: the logged-in user object (or null)
// - token: the JWT string (or null)
// - loading: true while we're checking if the
//   stored token is still valid on app load
// - login(): stores token + user, updates state
// - logout(): clears everything, redirects
// - register(): creates account + logs in
//
// HOW CONTEXT WORKS:
// 1. We create a Context object with createContext()
// 2. We create a Provider component that wraps
//    the whole app and provides values
// 3. Any component can call useContext(AuthContext)
//    to access those values — no prop drilling
// ─────────────────────────────────────────────

import { createContext, useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import authService from '../services/authServices'

// ── Create the Context object ─────────────────
// createContext(null) creates a Context with
// null as the default value (used when no
// Provider is above the component in the tree).
// We export it so useAuth hook can import it.
export const AuthContext = createContext(null)

// ── AuthProvider component ────────────────────
// This wraps the entire app in main.jsx.
// Everything inside it can access auth state.
//
// props.children is whatever is rendered inside
// <AuthProvider>...</AuthProvider> — i.e. the
// whole rest of the app.
export const AuthProvider = ({ children }) => {
  // ── State ─────────────────────────────────────
  // user: the logged-in user object.
  // Initialize from localStorage so the user
  // stays logged in after a page refresh.
  const [user, setUser] = useState(() => {
    // This is a lazy initializer — it runs once
    // when the component first mounts, not on
    // every re-render. More efficient than
    // useState(JSON.parse(localStorage...))
    try {
      const stored = localStorage.getItem('userData')
      return stored ? JSON.parse(stored) : null
    } catch {
      // JSON.parse fails if localStorage has
      // corrupted data. Fail gracefully.
      return null
    }
  })

  // loading: true while we verify the stored token
  // is still valid on app startup.
  // Prevents showing protected content for a moment
  // before realizing the token is expired.
  const [loading, setLoading] = useState(true)

  // useNavigate is a React Router hook that lets
  // us programmatically navigate to a different route.
  // Like clicking a link, but from JavaScript code.
  const navigate = useNavigate()

  // ─────────────────────────────────────────────
  // VERIFY TOKEN ON APP LOAD
  //
  // When the app first loads (or page refresh),
  // we check if the stored token is still valid
  // by calling GET /api/auth/me.
  //
  // WHY?
  // The token in localStorage might be expired
  // (30 days old) or the user might have been
  // deleted from the DB. We verify before
  // showing any protected content.
  //
  // useEffect with [] runs ONCE after the first render.
  // ─────────────────────────────────────────────
  useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem('userToken')

      if (!token) {
        // No token stored — user is not logged in.
        // Stop loading, show the app normally.
        setLoading(false)
        return
      }

      try {
        // Call /api/auth/me with the stored token.
        // The Axios interceptor attaches the token automatically.
        const freshUser = await authService.getMe()

        // Token is valid — update user state with
        // fresh data from the database (role might
        // have changed, reputation updated, etc.)
        setUser(freshUser)
        localStorage.setItem('userData', JSON.stringify(freshUser))
      } catch (error) {
        // Token is expired or invalid.
        // Clear everything — force re-login.
        // The Axios response interceptor also handles
        // this for 401s, but we add it here too for safety.
        localStorage.removeItem('userToken')
        localStorage.removeItem('userData')
        setUser(null)
      } finally {
        // Whether success or failure, we're done loading.
        // finally runs in both cases.
        setLoading(false)
      }
    }

    verifyToken()
  }, [])
  // Empty dependency array [] means: run this
  // effect only once, when the component mounts.

  // ─────────────────────────────────────────────
  // LOGIN function
  //
  // Called by the LoginPage when the form submits.
  // Stores the token and user in localStorage,
  // updates state, navigates to home.
  //
  // useCallback memoizes this function — it keeps
  // the same function reference between renders
  // unless dependencies change. Important for
  // performance when passed to child components.
  // ─────────────────────────────────────────────
  const login = useCallback(async (credentials) => {
    // authService.login calls POST /api/auth/login
    // Returns: { _id, name, email, role, token, ... }
    const data = await authService.login(credentials)

    // Store the JWT token for the Axios interceptor
    localStorage.setItem('userToken', data.token)

    // Store user info for instant access on refresh
    // We store without the token inside userData —
    // token lives separately in 'userToken'
    const { token, ...userData } = data
    localStorage.setItem('userData', JSON.stringify(userData))

    // Update React state — this triggers a re-render
    // of all components consuming this context
    setUser(userData)

    // Navigate to home page after successful login
    navigate('/')
  }, [navigate])

  // ─────────────────────────────────────────────
  // REGISTER function
  //
  // Same flow as login — backend returns a token
  // on successful registration, so we log them
  // in immediately. No separate verification step.
  // ─────────────────────────────────────────────
  const register = useCallback(async (userData) => {
    const data = await authService.register(userData)

    localStorage.setItem('userToken', data.token)
    const { token, ...userInfo } = data
    localStorage.setItem('userData', JSON.stringify(userInfo))
    setUser(userInfo)

    // New users go to home after registering
    navigate('/')
  }, [navigate])

  // ─────────────────────────────────────────────
  // LOGOUT function
  //
  // Clears all stored auth data and resets state.
  // ─────────────────────────────────────────────
  const logout = useCallback(() => {
    // Remove from localStorage
    localStorage.removeItem('userToken')
    localStorage.removeItem('userData')

    // Reset user state to null
    // This triggers re-renders — Navbar switches
    // from showing username to showing Login button
    setUser(null)

    // Send to login page
    navigate('/login')
  }, [navigate])

  // ─────────────────────────────────────────────
  // updateUser — updates user in state + storage
  // Used by the profile edit page when the user
  // changes their name, bio, or avatar.
  // ─────────────────────────────────────────────
  const updateUser = useCallback((updatedData) => {
    const newUser = { ...user, ...updatedData }
    setUser(newUser)
    localStorage.setItem('userData', JSON.stringify(newUser))
  }, [user])

  // ─────────────────────────────────────────────
  // THE CONTEXT VALUE
  //
  // Everything in this object is available to
  // any component that calls useAuth().
  // ─────────────────────────────────────────────
  const contextValue = {
    user,         // the logged-in user object, or null
    loading,      // true while verifying token on startup
    login,        // function to log in
    logout,       // function to log out
    register,     // function to register
    updateUser,   // function to update user data
    isAuth: !!user,           // boolean — is someone logged in?
    isSenior: user?.role === 'senior',  // boolean — are they a senior?
    isJunior: user?.role === 'junior',  // boolean — are they a junior?
  }

  // ── Render ────────────────────────────────────
  // We provide the context value to all children.
  // While loading (verifying token), we show nothing
  // to prevent a flash of unauthenticated content.
  return (
    <AuthContext.Provider value={contextValue}>
      {!loading && children}
    </AuthContext.Provider>
  )
}














