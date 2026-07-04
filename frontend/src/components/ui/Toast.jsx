// ─────────────────────────────────────────────
// components/ui/Toast.jsx
//
// A lightweight toast notification system.
// Toasts are temporary messages that appear
// at the top-right of the screen and auto-dismiss.
//
// HOW IT WORKS:
// 1. We export a ToastContainer that renders
//    active toasts on screen.
// 2. We export a useToast hook that gives
//    any component showToast() and hideToast()
// 3. Toast state lives in a separate context
//    so any component can trigger a toast
//    without prop drilling.
// ─────────────────────────────────────────────
import { createContext, useContext, useState, useCallback } from 'react'

// Each toast has: id, message, type (success/error/info)
const ToastContext = createContext(null)

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([])

  const showToast = useCallback((message, type = 'info', duration = 4000) => {
    // Generate a unique ID using timestamp + random
    const id = `${Date.now()}-${Math.random()}`

    setToasts(prev => [...prev, { id, message, type }])

    // Auto-remove after duration milliseconds
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, duration)
  }, [])

  const hideToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ showToast, hideToast }}>
      {children}

      {/* Toast container — fixed position, top right */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`
              flex items-start gap-3 p-4 rounded-xl border shadow-sm
              animate-fade-in
              ${toast.type === 'success'
                ? 'bg-green-50 border-green-200 text-green-800'
                : toast.type === 'error'
                ? 'bg-red-50 border-red-200 text-red-800'
                : 'bg-purple-50 border-purple-200 text-purple-800'
              }
            `}
          >
            {/* Icon based on type */}
            <span className="text-lg flex-shrink-0">
              {toast.type === 'success' ? '✓' : toast.type === 'error' ? '✕' : 'ℹ'}
            </span>

            <p className="text-sm flex-1 leading-relaxed">{toast.message}</p>

            {/* Manual dismiss button */}
            <button
              onClick={() => hideToast(toast.id)}
              className="text-current opacity-50 hover:opacity-100 flex-shrink-0 text-lg leading-none"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

// Custom hook to use toasts anywhere
export const useToast = () => {
  const context = useContext(ToastContext)
  if (!context) throw new Error('useToast must be inside ToastProvider')
  return context
}