// Displays a user avatar — either an image
// or a colored circle with initials as fallback.
import { getInitials, getAvatarColor } from '../../utils/formatters.js'

const Avatar = ({ name = '', src, size = 'md', className = '' }) => {
  const sizes = {
    xs:  'w-5 h-5 text-[10px]',
    sm:  'w-7 h-7 text-xs',
    md:  'w-9 h-9 text-sm',
    lg:  'w-12 h-12 text-base',
    xl:  'w-16 h-16 text-xl',
  }

  const colorClass = getAvatarColor(name)

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={`${sizes[size]} rounded-full object-cover ${className}`}
      />
    )
  }

  return (
    <div
      className={`
        ${sizes[size]}
        ${colorClass}
        rounded-full flex items-center justify-center
        font-medium flex-shrink-0 ${className}
      `}
    >
      {getInitials(name)}
    </div>
  )
}

export default Avatar