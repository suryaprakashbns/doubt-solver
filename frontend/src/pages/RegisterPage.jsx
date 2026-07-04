// ─────────────────────────────────────────────
// pages/RegisterPage.jsx
//
// Registration form with:
// - Name, email, password fields
// - Role selection (junior/senior) via cards
// - Real-time validation
// - Password strength indicator
// - Loading and error states
// ─────────────────────────────────────────────

import { useState } from 'react'
import { Link } from 'react-router-dom'
import useAuth from '../hooks/useAuth.js'
import { useToast } from '../components/ui/Toast.jsx'
import Spinner from '../components/ui/Spinner.jsx'
import { Navigate } from 'react-router-dom'

// Add this inside the component, before the return:

// ── Password strength calculator ─────────────
// Returns { score: 0-4, label, color }
// Used to show the strength bar under password field
const getPasswordStrength = (password) => {
  if (!password) return { score: 0, label: '', color: '' }

  let score = 0
  if (password.length >= 8)              score++
  if (/[A-Z]/.test(password))            score++
  if (/[0-9]/.test(password))            score++
  if (/[^A-Za-z0-9]/.test(password))     score++

  const levels = [
    { label: '',          color: '' },
    { label: 'Weak',      color: 'bg-red-400' },
    { label: 'Fair',      color: 'bg-amber-400' },
    { label: 'Good',      color: 'bg-blue-400' },
    { label: 'Strong',    color: 'bg-green-500' },
  ]

  return { score, ...levels[score] }
}

const RegisterPage = () => {
   const { isAuth } = useAuth()

    if (isAuth) {
    return <Navigate to="/" replace />
}
 
    const [formData, setFormData] = useState({
    name:     '',
    email:    '',
    password: '',
    role:     'junior',   // default role
  })

  const [touched, setTouched] = useState({
    name:     false,
    email:    false,
    password: false,
  })

  const [loading, setLoading]           = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [agreed, setAgreed]             = useState(false)

  const { register } = useAuth()
  const { showToast } = useToast()

  const { name, email, password, role } = formData

  // ── Validation ──────────────────────────────
  const errors = {
    name: !name
      ? 'Name is required'
      : name.trim().length < 2
      ? 'Name must be at least 2 characters'
      : '',
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

  const isFormValid =
    !errors.name &&
    !errors.email &&
    !errors.password &&
    agreed

  const passwordStrength = getPasswordStrength(password)

  // ── Handlers ────────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleBlur = (e) => {
    setTouched(prev => ({ ...prev, [e.target.name]: true }))
  }

  const handleRoleSelect = (selectedRole) => {
    setFormData(prev => ({ ...prev, role: selectedRole }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setTouched({ name: true, email: true, password: true })

    if (!isFormValid) {
      if (!agreed) showToast('Please agree to the terms of service', 'error')
      return
    }

    setLoading(true)

    try {
      await register({
        name:     name.trim(),
        email:    email.toLowerCase(),
        password,
        role,
      })

      showToast(`Welcome to DoubtSolver, ${name.split(' ')[0]}!`, 'success')

    } catch (error) {
      const message =
        error?.response?.data?.message ||
        'Registration failed. Please try again.'
      showToast(message, 'error')
    } finally {
      setLoading(false)
    }
  }

  const showError = (field) => touched[field] && errors[field]

  // ─────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 py-8">
      <div className="w-full max-w-md">
        <div className="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm">

          {/* Logo */}
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center text-white text-sm font-medium">
              D
            </div>
            <span className="font-medium text-gray-900">DoubtSolver</span>
          </div>

          {/* Heading */}
          <h1 className="text-xl font-medium text-gray-900 mb-1">
            Create your account
          </h1>
          <p className="text-sm text-gray-500 mb-6">
            Join thousands of students helping each other
          </p>

          <form onSubmit={handleSubmit} noValidate>

            {/* Name field */}
            <div className="mb-4">
              <label
                htmlFor="name"
                className="block text-xs font-medium text-gray-600 mb-1.5"
              >
                Full name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                value={name}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Surya Prakash"
                className={`
                  w-full h-10 px-3 text-sm rounded-lg border outline-none
                  transition-colors duration-150 placeholder:text-gray-300
                  ${showError('name')
                    ? 'border-red-300 bg-red-50 focus:border-red-400'
                    : 'border-gray-200 bg-white focus:border-purple-400'
                  }
                `}
              />
              {showError('name') && (
                <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                  <span>⚠</span> {errors.name}
                </p>
              )}
            </div>

            {/* Email field */}
            <div className="mb-4">
              <label
                htmlFor="reg-email"
                className="block text-xs font-medium text-gray-600 mb-1.5"
              >
                Email address
              </label>
              <input
                id="reg-email"
                name="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="you@college.edu"
                className={`
                  w-full h-10 px-3 text-sm rounded-lg border outline-none
                  transition-colors duration-150 placeholder:text-gray-300
                  ${showError('email')
                    ? 'border-red-300 bg-red-50 focus:border-red-400'
                    : 'border-gray-200 bg-white focus:border-purple-400'
                  }
                `}
              />
              {showError('email') && (
                <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                  <span>⚠</span> {errors.email}
                </p>
              )}
            </div>

            {/* Password field with strength indicator */}
            <div className="mb-4">
              <label
                htmlFor="reg-password"
                className="block text-xs font-medium text-gray-600 mb-1.5"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="reg-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Min. 6 characters"
                  className={`
                    w-full h-10 px-3 pr-14 text-sm rounded-lg border outline-none
                    transition-colors duration-150 placeholder:text-gray-300
                    ${showError('password')
                      ? 'border-red-300 bg-red-50 focus:border-red-400'
                      : 'border-gray-200 bg-white focus:border-purple-400'
                    }
                  `}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>

              {/* Password strength bar */}
              {password && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[1, 2, 3, 4].map(level => (
                      <div
                        key={level}
                        className={`
                          h-1 flex-1 rounded-full transition-all duration-300
                          ${level <= passwordStrength.score
                            ? passwordStrength.color
                            : 'bg-gray-100'
                          }
                        `}
                      />
                    ))}
                  </div>
                  {passwordStrength.label && (
                    <p className="text-xs text-gray-400">
                      Strength:{' '}
                      <span className="font-medium text-gray-600">
                        {passwordStrength.label}
                      </span>
                    </p>
                  )}
                </div>
              )}

              {showError('password') && (
                <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
                  <span>⚠</span> {errors.password}
                </p>
              )}
            </div>

            {/* Role selection cards */}
            <div className="mb-5">
              <label className="block text-xs font-medium text-gray-600 mb-2">
                I am a...
              </label>
              <div className="grid grid-cols-2 gap-3">

                {/* Junior card */}
                <button
                  type="button"
                  onClick={() => handleRoleSelect('junior')}
                  className={`
                    p-4 rounded-xl border text-left transition-all duration-150
                    ${role === 'junior'
                      ? 'border-purple-400 bg-purple-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                    }
                  `}
                >
                  <div className="text-2xl mb-2">📚</div>
                  <div className="text-sm font-medium text-gray-900">Junior</div>
                  <div className="text-xs text-gray-400 mt-0.5">
                    I have doubts to ask
                  </div>
                  {role === 'junior' && (
                    <div className="mt-2 w-4 h-4 bg-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">✓</span>
                    </div>
                  )}
                </button>

                {/* Senior card */}
                <button
                  type="button"
                  onClick={() => handleRoleSelect('senior')}
                  className={`
                    p-4 rounded-xl border text-left transition-all duration-150
                    ${role === 'senior'
                      ? 'border-purple-400 bg-purple-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                    }
                  `}
                >
                  <div className="text-2xl mb-2">💡</div>
                  <div className="text-sm font-medium text-gray-900">Senior</div>
                  <div className="text-xs text-gray-400 mt-0.5">
                    I share my knowledge
                  </div>
                  {role === 'senior' && (
                    <div className="mt-2 w-4 h-4 bg-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">✓</span>
                    </div>
                  )}
                </button>

              </div>
            </div>

            {/* Terms checkbox */}
            <label className="flex items-start gap-2.5 mb-5 cursor-pointer">
              <input
                type="checkbox"
                checked={agreed}
                onChange={e => setAgreed(e.target.checked)}
                className="mt-0.5 accent-purple-600"
              />
              <span className="text-xs text-gray-500 leading-relaxed">
                I agree to the{' '}
                <span className="text-purple-600 hover:underline cursor-pointer">
                  terms of service
                </span>{' '}
                and{' '}
                <span className="text-purple-600 hover:underline cursor-pointer">
                  privacy policy
                </span>
              </span>
            </label>

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
                  <span>Creating account...</span>
                </>
              ) : (
                'Create account'
              )}
            </button>

          </form>

          {/* Footer */}
          <p className="text-center text-xs text-gray-500 mt-5">
            Already have an account?{' '}
            <Link
              to="/login"
              className="text-purple-600 font-medium hover:underline"
            >
              Sign in
            </Link>
          </p>

        </div>
      </div>
    </div>
  )
}

export default RegisterPage