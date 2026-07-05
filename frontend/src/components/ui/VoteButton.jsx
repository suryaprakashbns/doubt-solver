// ─────────────────────────────────────────────
// components/ui/VoteButton.jsx
//
// The upvote button used on both questions
// and answers. Handles:
// - Active state (user has voted)
// - Disabled state (own content, not logged in)
// - Loading state (vote in progress)
// - Animated count change
// ─────────────────────────────────────────────

import { useState } from 'react'
import Spinner from './Spinner.jsx'

const VoteButton = ({
  count      = 0,
  hasVoted   = false,
  onVote,               // async function to call on click
  disabled   = false,
  disabledReason = '',  // tooltip text when disabled
}) => {
  const [loading, setLoading] = useState(false)

  const handleClick = async () => {
    if (disabled || loading || !onVote) return
    setLoading(true)
    try {
      await onVote()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center gap-1.5">

      {/* Up arrow button */}
      <button
        onClick={handleClick}
        disabled={disabled || loading}
        title={disabledReason}
        className={`
          w-9 h-9 rounded-full border flex items-center justify-center
          transition-all duration-150
          ${hasVoted
            ? 'bg-purple-50 border-purple-300 text-purple-600'
            : 'bg-white border-gray-200 text-gray-400 hover:border-purple-300 hover:text-purple-500'
          }
          ${(disabled || loading)
            ? 'opacity-50 cursor-not-allowed'
            : 'cursor-pointer active:scale-95'
          }
        `}
        aria-label={hasVoted ? 'Remove vote' : 'Upvote'}
      >
        {loading ? (
          <Spinner size="sm" color={hasVoted ? 'border-purple-400' : 'border-gray-400'} />
        ) : (
          <span className="text-base leading-none select-none">▲</span>
        )}
      </button>

      {/* Vote count */}
      <span className={`
        text-base font-medium leading-none
        ${hasVoted ? 'text-purple-600' : 'text-gray-500'}
        ${count > 0 && !hasVoted ? 'text-gray-700' : ''}
      `}>
        {count}
      </span>

      {/* Down spacer — keeps layout symmetric */}
      <div className="w-9 h-9" />

    </div>
  )
}

export default VoteButton