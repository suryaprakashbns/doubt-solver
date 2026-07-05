// ─────────────────────────────────────────────
// components/answers/AnswerCard.jsx
//
// Displays a single answer with:
// - Vote button
// - Accept button (question owner only)
// - Author info and timestamp
// - Edit/delete actions (answer owner only)
// - Inline edit form
// ─────────────────────────────────────────────

import { useState } from 'react'
import Avatar from '../ui/Avatar.jsx'
import VoteButton from '../ui/VoteButton.jsx'
import Spinner from '../ui/Spinner.jsx'
import { formatTimeAgo } from '../../utils/formatters.js'
import answerService from '../../services/answerService.js'
import useAuth from '../../hooks/useAuth.js'
import { useToast } from '../ui/Toast.jsx'

const AnswerCard = ({
  answer,
  questionAuthorId,   // to check if current user can accept
  onAnswerUpdated,    // callback to refresh answers list
  onAnswerDeleted,    // callback to remove this card
}) => {
  const { user, isAuth } = useAuth()
  const { showToast }    = useToast()

  const [isEditing,      setIsEditing]      = useState(false)
  const [editBody,       setEditBody]        = useState(answer.body)
  const [editLoading,    setEditLoading]     = useState(false)
  const [deleteLoading,  setDeleteLoading]   = useState(false)
  const [acceptLoading,  setAcceptLoading]   = useState(false)

  // ── Derived state ─────────────────────────────
  const isOwner   = isAuth && user?._id === answer.author?._id
  const canAccept = isAuth && user?._id === questionAuthorId
  const hasVoted  = isAuth && answer.votes?.some(
    id => id === user?._id || id?._id === user?._id
  )
  const voteCount = answer.votes?.length || 0

  // ── Vote handler ─────────────────────────────
  const handleVote = async () => {
    try {
      const data = await answerService.vote(answer._id)
      onAnswerUpdated(data.answer)
    } catch (error) {
      showToast(
        error?.response?.data?.message || 'Could not vote',
        'error'
      )
    }
  }

  // ── Accept handler ────────────────────────────
  const handleAccept = async () => {
    setAcceptLoading(true)
    try {
      const data = await answerService.accept(answer._id)
      showToast(
        answer.isAccepted ? 'Answer un-accepted' : 'Answer accepted!',
        'success'
      )
      onAnswerUpdated(data.answer)
    } catch (error) {
      showToast(
        error?.response?.data?.message || 'Could not accept answer',
        'error'
      )
    } finally {
      setAcceptLoading(false)
    }
  }

  // ── Edit handler ──────────────────────────────
  const handleEditSubmit = async (e) => {
    e.preventDefault()
    if (editBody.trim().length < 20) {
      showToast('Answer must be at least 20 characters', 'error')
      return
    }
    setEditLoading(true)
    try {
      const updated = await answerService.update(answer._id, {
        body: editBody.trim(),
      })
      showToast('Answer updated', 'success')
      onAnswerUpdated(updated)
      setIsEditing(false)
    } catch (error) {
      showToast(
        error?.response?.data?.message || 'Could not update answer',
        'error'
      )
    } finally {
      setEditLoading(false)
    }
  }

  // ── Delete handler ────────────────────────────
  const handleDelete = async () => {
    if (!window.confirm('Delete this answer? This cannot be undone.')) return
    setDeleteLoading(true)
    try {
      await answerService.delete(answer._id)
      showToast('Answer deleted', 'info')
      onAnswerDeleted(answer._id)
    } catch (error) {
      showToast(
        error?.response?.data?.message || 'Could not delete answer',
        'error'
      )
    } finally {
      setDeleteLoading(false)
    }
  }

  // ─────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────
  return (
    <div className={`
      flex gap-4 py-6 border-b border-gray-100 last:border-0
      ${answer.isAccepted ? 'bg-green-50/30 rounded-xl px-4 -mx-4' : ''}
    `}>

      {/* ── Vote + Accept column ─────────── */}
      <div className="flex flex-col items-center gap-2 flex-shrink-0">

        <VoteButton
          count={voteCount}
          hasVoted={hasVoted}
          onVote={handleVote}
          disabled={!isAuth || isOwner}
          disabledReason={
            !isAuth     ? 'Log in to vote'  :
            isOwner     ? 'Cannot vote on your own answer' :
            ''
          }
        />

        {/* Accept button — only for question owner */}
        {canAccept && (
          <button
            onClick={handleAccept}
            disabled={acceptLoading}
            title={answer.isAccepted ? 'Un-accept answer' : 'Accept as best answer'}
            className={`
              w-9 h-9 rounded-full border flex items-center justify-center
              transition-all duration-150
              ${answer.isAccepted
                ? 'bg-green-50 border-green-400 text-green-600'
                : 'border-gray-200 text-gray-300 hover:border-green-400 hover:text-green-500'
              }
              ${acceptLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
            aria-label={answer.isAccepted ? 'Un-accept answer' : 'Accept answer'}
          >
            {acceptLoading
              ? <Spinner size="sm" color="border-green-400" />
              : <span className="text-base leading-none">✓</span>
            }
          </button>
        )}

      </div>

      {/* ── Answer content ───────────────── */}
      <div className="flex-1 min-w-0">

        {/* Accepted badge */}
        {answer.isAccepted && (
          <div className="inline-flex items-center gap-1.5 bg-green-50 text-green-700 border border-green-200 text-xs font-medium px-2.5 py-1 rounded-md mb-3">
            <span>✓</span> Accepted answer
          </div>
        )}

        {/* Body or edit form */}
        {isEditing ? (
          <form onSubmit={handleEditSubmit}>
            <textarea
              value={editBody}
              onChange={e => setEditBody(e.target.value)}
              rows={6}
              className="
                w-full px-4 py-3 text-sm border border-gray-200
                rounded-xl outline-none focus:border-purple-400
                resize-none leading-relaxed mb-3
              "
              autoFocus
            />
            <div className="flex items-center gap-2">
              <button
                type="submit"
                disabled={editLoading}
                className="flex items-center gap-1.5 bg-purple-600 text-white text-xs px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
              >
                {editLoading && <Spinner size="sm" color="border-white" />}
                Save changes
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false)
                  setEditBody(answer.body)
                }}
                className="text-xs text-gray-400 hover:text-gray-600 px-3 py-2"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap mb-4">
            {answer.body}
          </p>
        )}

        {/* Footer: author + actions */}
        {!isEditing && (
          <div className="flex items-center justify-between">

            {/* Author info */}
            <div className="flex items-center gap-2">
              <Avatar name={answer.author?.name || ''} size="xs" />
              <span className="text-xs text-gray-400">
                <span className="text-gray-700 font-medium">
                  {answer.author?.name}
                </span>
                {' '}
                <span className={`
                  text-xs capitalize px-1.5 py-0.5 rounded-md
                  ${answer.author?.role === 'senior'
                    ? 'bg-purple-50 text-purple-500'
                    : 'bg-gray-50 text-gray-400'
                  }
                `}>
                  {answer.author?.role}
                </span>
                {' · '}
                {formatTimeAgo(answer.createdAt)}
              </span>
            </div>

            {/* Edit/delete — only for owner */}
            {isOwner && (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-xs text-gray-400 hover:text-gray-600 px-2 py-1 rounded hover:bg-gray-50 transition-colors"
                >
                  Edit
                </button>
                <span className="text-gray-200">·</span>
                <button
                  onClick={handleDelete}
                  disabled={deleteLoading}
                  className="text-xs text-red-400 hover:text-red-600 px-2 py-1 rounded hover:bg-red-50 transition-colors disabled:opacity-50"
                >
                  {deleteLoading ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  )
}

export default AnswerCard