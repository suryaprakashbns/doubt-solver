// ─────────────────────────────────────────────
// Shows a banner if the first API call takes
// more than 3 seconds — tells user server
// is starting up instead of just hanging
// ─────────────────────────────────────────────

import { useState, useEffect } from 'react'

const WakeUpBanner = ({ isLoading }) => {
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (!isLoading) {
      setShow(false)
      return
    }

    // Only show banner if loading takes more than 3 seconds
    const timer = setTimeout(() => {
      if (isLoading) setShow(true)
    }, 3000)

    return () => clearTimeout(timer)
  }, [isLoading])

  if (!show) return null

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50
                    bg-amber-50 border border-amber-200 
                    text-amber-700 text-xs px-5 py-3 
                    rounded-xl shadow-sm
                    flex items-center gap-2
                    animate-fade-in">
      <span className="animate-spin inline-block">⟳</span>
      Server is starting up — please wait about 30 seconds...
    </div>
  )
}

export default WakeUpBanner