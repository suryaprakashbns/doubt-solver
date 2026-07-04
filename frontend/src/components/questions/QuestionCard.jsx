// ─────────────────────────────────────────────
// components/questions/QuestionCard.jsx
//
// Displays a single question in the feed.
// Used on the homepage and search results.
//
// Props:
//   question — the full question object from API
//   onTagClick — callback when a tag is clicked
//                (updates the active tag filter)
// ─────────────────────────────────────────────

import { Link } from 'react-router-dom'
import Avatar from '../ui/Avatar.jsx'
import TagBadge from '../ui/TagBadge.jsx'
import { formatTimeAgo, truncateText } from '../../utils/formatters.js'

const QuestionCard = ({ question, onTagClick }) => {
  const {
    _id,
    title,
    body,
    author,
    tags        = [],
    votes       = [],
    answers     = [],
    views       = 0,
    isResolved,
    createdAt,
  } = question

  const voteCount   = votes.length
  const answerCount = answers.length

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5 mb-3 hover:border-gray-200 transition-colors duration-150 group">
      <div className="flex gap-4">

        {/* ── Stats column ────────────────── */}
        <div className="flex flex-col items-center gap-2 min-w-[48px]">

          {/* Vote count */}
          <div className="text-center">
            <div className={`
              text-base font-medium leading-none
              ${voteCount > 0 ? 'text-purple-600' : 'text-gray-400'}
            `}>
              {voteCount}
            </div>
            <div className="text-[10px] text-gray-400 mt-0.5">votes</div>
          </div>

          {/* Answer count */}
          <div className={`
            text-center px-2 py-1 rounded-lg
            ${isResolved
              ? 'bg-green-50 border border-green-200'
              : answerCount > 0
              ? 'bg-gray-50 border border-gray-200'
              : 'bg-white'
            }
          `}>
            <div className={`
              text-base font-medium leading-none
              ${isResolved
                ? 'text-green-600'
                : answerCount > 0
                ? 'text-gray-600'
                : 'text-gray-300'
              }
            `}>
              {answerCount}
            </div>
            <div className={`
              text-[10px] mt-0.5
              ${isResolved ? 'text-green-500' : 'text-gray-400'}
            `}>
              {isResolved ? '✓ ans' : 'ans'}
            </div>
          </div>

          {/* View count */}
          <div className="text-center">
            <div className="text-sm font-medium text-gray-300 leading-none">
              {views}
            </div>
            <div className="text-[10px] text-gray-300 mt-0.5">views</div>
          </div>

        </div>

        {/* ── Main content ────────────────── */}
        <div className="flex-1 min-w-0">

          {/* Title — links to question detail */}
          <Link
            to={`/questions/${_id}`}
            className="block text-sm font-medium text-gray-900 hover:text-purple-600 transition-colors leading-snug mb-2 group-hover:text-purple-600"
          >
            {title}
          </Link>

          {/* Body preview */}
          <p className="text-xs text-gray-400 leading-relaxed mb-3">
            {truncateText(body, 120)}
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            {tags.map(tag => (
              <TagBadge
                key={tag}
                tag={tag}
                onClick={onTagClick}
              />
            ))}
          </div>

          {/* Footer: author + time */}
          <div className="flex items-center gap-2">
            <Avatar
              name={author?.name || 'Unknown'}
              size="xs"
            />
            <span className="text-xs text-gray-400">
              <Link
                to={`/profile/${author?._id}`}
                className="text-purple-600 hover:underline font-medium"
              >
                {author?.name || 'Unknown'}
              </Link>
              {' '}
              <span className="capitalize text-gray-300">
                · {author?.role}
              </span>
              {' · '}
              {formatTimeAgo(createdAt)}
            </span>

            {/* Resolved badge */}
            {isResolved && (
              <span className="ml-auto text-xs bg-green-50 text-green-600 border border-green-200 px-2 py-0.5 rounded-md font-medium">
                ✓ answered
              </span>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}

export default QuestionCard