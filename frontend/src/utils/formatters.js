// ─────────────────────────────────────────────
// utils/formatters.js
//
// Pure helper functions for formatting data.
// Pure means: same input always gives same output,
// no side effects, no API calls, no state.
// These are completely framework-agnostic —
// they'd work in React, Vue, or plain JS.
// ─────────────────────────────────────────────

// ── formatTimeAgo ─────────────────────────────
// Converts a date to a human-readable relative
// time string: "2 hours ago", "3 days ago"
//
// Why not use a library like moment.js?
// For a simple use case like this, a custom
// function is 50 lines vs adding a 300KB library.
// Always evaluate if a dependency is worth its weight.
export const formatTimeAgo = (dateString) => {
  const date    = new Date(dateString)
  const now     = new Date()
  const seconds = Math.floor((now - date) / 1000)

  const intervals = [
    { label: 'year',   seconds: 31536000 },
    { label: 'month',  seconds: 2592000  },
    { label: 'week',   seconds: 604800   },
    { label: 'day',    seconds: 86400    },
    { label: 'hour',   seconds: 3600     },
    { label: 'minute', seconds: 60       },
  ]

  for (const interval of intervals) {
    const count = Math.floor(seconds / interval.seconds)
    if (count >= 1) {
      // Pluralize: "1 hour ago" vs "2 hours ago"
      return `${count} ${interval.label}${count !== 1 ? 's' : ''} ago`
    }
  }

  return 'just now'
}

// ── formatNumber ──────────────────────────────
// Formats large numbers compactly:
// 1200 → "1.2k", 1000000 → "1M"
export const formatNumber = (num) => {
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`
  if (num >= 1_000)     return `${(num / 1_000).toFixed(1)}k`
  return String(num)
}

// ── truncateText ──────────────────────────────
// Cuts text at maxLength and adds "..."
// Used for question body previews on cards.
export const truncateText = (text, maxLength = 120) => {
  if (!text || text.length <= maxLength) return text
  return text.slice(0, maxLength).trimEnd() + '...'
}

// ── getInitials ───────────────────────────────
// Gets the first letter of each word in a name,
// up to 2 letters. "Surya Prakash" → "SP"
export const getInitials = (name = '') => {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

// ── getAvatarColor ────────────────────────────
// Returns a consistent color class for a user
// based on their name. Same name always gets
// same color — not random on every render.
export const getAvatarColor = (name = '') => {
  const colors = [
    'bg-purple-100 text-purple-700',
    'bg-teal-100 text-teal-700',
    'bg-amber-100 text-amber-700',
    'bg-pink-100 text-pink-700',
    'bg-blue-100 text-blue-700',
    'bg-green-100 text-green-700',
  ]

  // Sum the char codes of the name to get a
  // consistent index — same name, same color.
  const index = name
    .split('')
    .reduce((sum, char) => sum + char.charCodeAt(0), 0)

  return colors[index % colors.length]
}