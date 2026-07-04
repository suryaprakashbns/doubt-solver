// A clickable tag pill used on question cards
// and in the tag filter sidebar.
const TagBadge = ({ tag, onClick, active = false, size = 'sm' }) => {
  const sizes = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
  }

  return (
    <button
      onClick={() => onClick?.(tag)}
      className={`
        ${sizes[size]}
        rounded-md border font-medium
        transition-colors duration-150
        ${active
          ? 'bg-purple-100 text-purple-700 border-purple-300'
          : 'bg-purple-50 text-purple-600 border-purple-200 hover:bg-purple-100'
        }
      `}
    >
      {tag}
    </button>
  )
}

export default TagBadge