// ─────────────────────────────────────────────
// components/ui/TagInput.jsx
//
// A tag input field where:
// - User types a tag name
// - Press Enter or comma to add it
// - Click × on a tag to remove it
// - Max 5 tags enforced
// - Duplicate tags prevented
//
// This is a CONTROLLED component — the parent
// owns the tags array via props and onChange.
// This component only manages the text input
// state (what's currently being typed).
// ─────────────────────────────────────────────

import { useState, useRef } from 'react'

const TagInput = ({ tags = [], onChange, maxTags = 5 }) => {
  // The text currently being typed in the input
  const [inputValue, setInputValue] = useState('')
  const inputRef = useRef(null)

  const addTag = (rawTag) => {
    // Clean the tag: lowercase, trim, no spaces
    const tag = rawTag.toLowerCase().trim().replace(/\s+/g, '-')

    if (!tag) return
    if (tags.length >= maxTags) return
    if (tags.includes(tag)) return   // no duplicates

    // Call parent's onChange with the new tags array
    onChange([...tags, tag])
    setInputValue('')
  }

  const removeTag = (tagToRemove) => {
    onChange(tags.filter(t => t !== tagToRemove))
  }

  const handleKeyDown = (e) => {
    // Add tag on Enter or comma
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()   // prevent form submission on Enter
      addTag(inputValue)
    }

    // Remove last tag on Backspace if input is empty
    if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
      removeTag(tags[tags.length - 1])
    }
  }

  const handleBlur = () => {
    // Add whatever is typed when user clicks away
    if (inputValue.trim()) {
      addTag(inputValue)
    }
  }

  return (
    <div
      onClick={() => inputRef.current?.focus()}
      className={`
        min-h-[42px] flex flex-wrap items-center gap-1.5
        px-3 py-2 border rounded-xl cursor-text
        transition-colors duration-150
        border-gray-200 focus-within:border-purple-400
        bg-white
      `}
    >
      {/* Render existing tags */}
      {tags.map(tag => (
        <span
          key={tag}
          className="inline-flex items-center gap-1 bg-purple-50 text-purple-600 border border-purple-200 text-xs px-2 py-0.5 rounded-md font-medium"
        >
          {tag}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              removeTag(tag)
            }}
            className="text-purple-400 hover:text-purple-700 leading-none ml-0.5"
            aria-label={`Remove tag ${tag}`}
          >
            ×
          </button>
        </span>
      ))}

      {/* Text input — only show if under max tags */}
      {tags.length < maxTags && (
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          placeholder={tags.length === 0 ? 'Add up to 5 tags...' : ''}
          className="
            flex-1 min-w-[120px] outline-none text-sm
            bg-transparent placeholder:text-gray-300
          "
        />
      )}

      {/* Tag count indicator */}
      {tags.length > 0 && (
        <span className="ml-auto text-xs text-gray-300 flex-shrink-0">
          {tags.length}/{maxTags}
        </span>
      )}
    </div>
  )
}

export default TagInput