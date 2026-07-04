// ─────────────────────────────────────────────
// components/common/SearchBar.jsx
//
// The search input in the hero section.
// Calls onSearch with the current value as user types.
// Debouncing is handled in the parent (HomePage)
// using useDebounce on the search state value.
// ─────────────────────────────────────────────

import { useState } from 'react'

const SearchBar = ({ onSearch, initialValue = '' }) => {
  const [value, setValue] = useState(initialValue)

  const handleChange = (e) => {
    setValue(e.target.value)
    onSearch(e.target.value)
  }

  const handleClear = () => {
    setValue('')
    onSearch('')
  }

  return (
    <div className="relative flex items-center max-w-xl w-full mx-auto">

      {/* Search icon */}
      <span className="absolute left-4 text-gray-300 text-base pointer-events-none select-none">
        ⌕
      </span>

      <input
        type="text"
        value={value}
        onChange={handleChange}
        placeholder="Search questions, topics, tags..."
        className="
          w-full h-11 pl-10 pr-10 text-sm
          bg-white border border-gray-200
          rounded-xl outline-none
          focus:border-purple-400 transition-colors duration-150
          placeholder:text-gray-300
        "
      />

      {/* Clear button — only shows when there's text */}
      {value && (
        <button
          onClick={handleClear}
          className="absolute right-3 text-gray-300 hover:text-gray-500 text-lg leading-none transition-colors"
          aria-label="Clear search"
        >
          ×
        </button>
      )}
    </div>
  )
}

export default SearchBar