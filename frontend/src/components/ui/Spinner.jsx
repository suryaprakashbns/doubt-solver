// A reusable loading spinner.
// size prop: 'sm' | 'md' | 'lg'
// color prop: any Tailwind border color class

const Spinner = ({ size = 'md', color = 'border-purple-600' }) => {
  const sizes = {
    sm: 'w-4 h-4 border-2',
    md: 'w-6 h-6 border-2',
    lg: 'w-10 h-10 border-[3px]',
  }

  return (
    <div
      className={`
        ${sizes[size]}
        ${color}
        border-t-transparent
        rounded-full
        animate-spin
      `}
      role="status"
      aria-label="Loading"
    />
  )
}

export default Spinner