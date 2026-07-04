// ─────────────────────────────────────────────
// pages/LoginPage.jsx
//
// The login page. Matches the mockup exactly.
//
// WHAT THIS COMPONENT DOES:
// 1. Renders a centered login form
// 2. Manages local form state with useState
// 3. Validates inputs before submitting
// 4. Calls useAuth().login() on submit
// 5. Shows loading state during API call
// 6. Shows error toast if login fails
// 7. On success, AuthContext navigates to home
//
// RENDERING FLOW:
// User types → onChange updates state →
// Submit → validate → call login() →
// API call (loading=true) →
// Success: navigate('/') | Failure: show error
// ────────────────────────────────────────────

import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import useAuth from '../hooks/useAuth.js'
import { useToast } from '../components/ui/Toast.jsx'
import Spinner from '../components/ui/Spinner.jsx'
import { Navigate } from 'react-router-dom'

// Add this inside the component, before the return:

const LoginPage = () => {
  // ── Local form state ────────────────────────
  // Each input field has its own state value.
  // This is "controlled components" — React owns
  // the form state, not the DOM.
  const { isAuth } = useAuth()

if (isAuth) {
  return <Navigate to="/" replace />
}
  const [formData, setFormData] = useState({
    email:    '',
    password: '',
  })

  // Track which fields have been touched (user
  // has focused and left). We only show validation
  // errors on touched fields — not on first render.
  const [touched, setTouched] = useState({
    email:    false,
    password: false,
  })

  // Loading state — true while the API call is running
  const [loading, setLoading] = useState(false)

  // Show/hide password toggle
  const [showPassword, setShowPassword] = useState(false)

  // ── Hooks ───────────────────────────────────
  const { login } = useAuth()
  const { showToast } = useToast()
  const location = useLocation()

  // ── Destructure for easier access ───────────
  const { email, password } = formData

  // ── Validation ──────────────────────────────
  // Pure functions that return error strings
  // or empty string (no error).
  // Called on every render for instant feedback.
  const errors = {
    email: !email
      ? 'Email is required'
      : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
      ? 'Enter a valid email address'
      : '',
    password: !password
      ? 'Password is required'
      : password.length < 6
      ? 'Password must be at least 6 characters'
      : '',
  }

  // Form is valid when no error strings exist
  const isFormValid = !errors.email && !errors.password

  // ── Handlers ────────────────────────────────
  // Single onChange handler for all inputs.
  // Uses computed property name [e.target.name]
  // to update the right field regardless of which
  // input fired the event.
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  // Mark a field as touched when user leaves it
  const handleBlur = (e) => {
    setTouched(prev => ({ ...prev, [e.target.name]: true }))
  }

  // ── Form submission ─────────────────────────
  const handleSubmit = async (e) => {
    // Prevent default HTML form submission
    // (which would reload the page)
    e.preventDefault()

    // Mark all fields as touched so errors show
    setTouched({ email: true, password: true })

    if (!isFormValid) return

    setLoading(true)

    try {
      // login() is from AuthContext.
      // It calls the API, stores the token,
      // updates user state, and navigates to '/'.
      await login({ email, password })

      showToast('Welcome back!', 'success')

    } catch (error) {
      // error.response.data.message is our backend's
      // error message from the errorHandler middleware.
      // Fallback to a generic message if unavailable.
      const message =
        error?.response?.data?.message ||
        'Login failed. Please try again.'

      showToast(message, 'error')
    } finally {
      setLoading(false)
    }
  }

  // ── Helper: should we show this field's error? ──
  // Only show when the field has been touched
  const showError = (field) => touched[field] && errors[field]

  // ── The location.state.from value ───────────
  // If the user was redirected here from a
  // protected page (/ask), this holds that path.
  // After login, AuthContext navigates to '/' but
  // ideally we'd send them back to /ask.
  // We'll handle this refinement in Step 16.
  const from = location.state?.from?.pathname || '/'

  // ─────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────
  return (
    // Full-screen centered layout
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        {/* ── Card ─────────────────────────── */}
        <div className="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm">

          {/* ── Logo ─────────────────────── */}
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center text-white text-sm font-medium">
              D
            </div>
            <span className="font-medium text-gray-900">DoubtSolver</span>
          </div>

          {/* ── Heading ──────────────────── */}
          <h1 className="text-xl font-medium text-gray-900 mb-1">
            Welcome back
          </h1>
          <p className="text-sm text-gray-500 mb-6">
            Sign in to your account to continue
          </p>

          {/* ── Form ─────────────────────── */}
          <form onSubmit={handleSubmit} noValidate>

            {/* Email field */}
            <div className="mb-4">
              <label
                htmlFor="email"
                className="block text-xs font-medium text-gray-600 mb-1.5"
              >
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="you@example.com"
                className={`
                  w-full h-10 px-3 text-sm rounded-lg border outline-none
                  transition-colors duration-150
                  placeholder:text-gray-300
                  ${showError('email')
                    ? 'border-red-300 bg-red-50 focus:border-red-400'
                    : 'border-gray-200 bg-white focus:border-purple-400'
                  }
                `}
              />
              {/* Inline error message */}
              {showError('email') && (
                <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                  <span>⚠</span> {errors.email}
                </p>
              )}
            </div>

            {/* Password field */}
            <div className="mb-2">
              <label
                htmlFor="password"
                className="block text-xs font-medium text-gray-600 mb-1.5"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="••••••••"
                  className={`
                    w-full h-10 px-3 pr-10 text-sm rounded-lg border outline-none
                    transition-colors duration-150
                    placeholder:text-gray-300
                    ${showError('password')
                      ? 'border-red-300 bg-red-50 focus:border-red-400'
                      : 'border-gray-200 bg-white focus:border-purple-400'
                    }
                  `}
                />
                {/* Show/hide password toggle */}
                <button
                  type="button"
                  onClick={() => setShowPassword(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              {showError('password') && (
                <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                  <span>⚠</span> {errors.password}
                </p>
              )}
            </div>

            {/* Forgot password link */}
            <div className="flex justify-end mb-5">
              <span className="text-xs text-purple-600 cursor-pointer hover:underline">
                Forgot password?
              </span>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className={`
                w-full h-10 rounded-lg text-sm font-medium
                transition-all duration-150
                flex items-center justify-center gap-2
                ${loading
                  ? 'bg-purple-400 cursor-not-allowed text-white'
                  : 'bg-purple-600 hover:bg-purple-700 active:scale-[0.98] text-white'
                }
              `}
            >
              {loading ? (
                <>
                  <Spinner size="sm" color="border-white" />
                  <span>Signing in...</span>
                </>
              ) : (
                'Sign in'
              )}
            </button>

          </form>

          {/* ── Divider ──────────────────── */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-gray-100" />
            <span className="text-xs text-gray-400">or continue with</span>
            <div className="flex-1 h-px bg-gray-100" />
          </div>

          {/* ── Google button (placeholder) ── */}
          <button className="w-full h-10 border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          {/* ── Footer link ──────────────── */}
          <p className="text-center text-xs text-gray-500 mt-5">
            Don't have an account?{' '}
            <Link
              to="/register"
              className="text-purple-600 font-medium hover:underline"
            >
              Sign up
            </Link>
          </p>

        </div>
      </div>
    </div>
  )
}

export default LoginPage