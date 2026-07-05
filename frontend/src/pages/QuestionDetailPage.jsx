// ─────────────────────────────────────────────
// pages/QuestionDetailPage.jsx
//
// The full question detail view. Shows:
// - Question title, body, tags, author
// - Vote button for the question
// - Edit/delete for question owner
// - All answers sorted by votes
// - Answer form at the bottom
// ─────────────────────────────────────────────

import { useState, useEffect, useCallback } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import questionService from '../services/questionService.js'
import useAuth from '../hooks/useAuth.js'
import { useToast } from '../components/ui/Toast.jsx'
import VoteButton from '../components/ui/VoteButton.jsx'
import TagBadge from '../components/ui/TagBadge.jsx'
import Avatar from '../components/ui/Avatar.jsx'
import AnswerCard from '../components/answers/AnswerCard.jsx'
import AnswerForm from '../components/answers/AnswerForm.jsx'
import { QuestionCardSkeleton } from '../components/ui/Skeleton.jsx'
import { formatTimeAgo } from '../utils/formatters.js'

const QuestionDetailPage = () => {
  const { id }        = useParams()
  const navigate      = useNavigate()
  const { user, isAuth } = useAuth()
  const { showToast } = useToast()

  const [question,      setQuestion]      = useState(null)
  const [answers,       setAnswers]        = useState([])
  const [loading,       setLoading]        = useState(true)
  const [error,         setError]          = useState(null)
  const [isEditing,     setIsEditing]      = useState(false)
  const [editData,      setEditData]       = useState({ title: '', body: '' })
  const [editLoading,   setEditLoading]    = useState(false)
  const [deleteLoading, setDeleteLoading]  = useState(false)
  const [voteLoading,   setVoteLoading]    = useState(false)

  // ── Derived state ─────────────────────────────
  const isOwner  = isAuth && user?._id === question?.author?._id
  const hasVoted = isAuth && question?.votes?.some(
    id => id === user?._id || id?._id === user?._id
  )

  // ── Fetch question data ───────────────────────
  const fetchQuestion = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await questionService.getById(id)
      setQuestion(data)
      // Separate answers from the question object
      // and sort them: accepted first, then by votes
      const sortedAnswers = [...(data.answers || [])].sort((a, b) => {
        if (a.isAccepted && !b.isAccepted) return -1
        if (!a.isAccepted && b.isAccepted) return 1
        return (b.votes?.length || 0) - (a.votes?.length || 0)
      })
      setAnswers(sortedAnswers)
    } catch (err) {
      setError(
        err?.response?.data?.message ||
        'Failed to load question.'
      )
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchQuestion()
  }, [fetchQuestion])

  // ── Vote on question ──────────────────────────
  const handleVote = async () => {
    if (!isAuth) {
      showToast('Please log in to vote', 'error')
      return
    }
    setVoteLoading(true)
    try {
      const data = await questionService.vote(id)
      setQuestion(prev => ({
        ...prev,
        votes: data.question.votes,
      }))
    } catch (error) {
      showToast(
        error?.response?.data?.message || 'Could not vote',
        'error'
      )
    } finally {
      setVoteLoading(false)
    }
  }

  // ── Edit question ─────────────────────────────
  const startEditing = () => {
    setEditData({ title: question.title, body: question.body })
    setIsEditing(true)
  }

  const handleEditSubmit = async (e) => {
    e.preventDefault()
    if (!editData.title.trim() || !editData.body.trim()) {
      showToast('Title and body are required', 'error')
      return
    }
    setEditLoading(true)
    try {
      const updated = await questionService.update(id, {
        title: editData.title.trim(),
        body:  editData.body.trim(),
      })
      setQuestion(prev => ({ ...prev, ...updated }))
      setIsEditing(false)
      showToast('Question updated', 'success')
    } catch (error) {
      showToast(
        error?.response?.data?.message || 'Could not update question',
        'error'
      )
    } finally {
      setEditLoading(false)
    }
  }

  // ── Delete question ───────────────────────────
  const handleDelete = async () => {
    if (!window.confirm(
      'Delete this question? All answers will also be deleted. This cannot be undone.'
    )) return

    setDeleteLoading(true)
    try {
      await questionService.delete(id)
      showToast('Question deleted', 'info')
      navigate('/')
    } catch (error) {
      showToast(
        error?.response?.data?.message || 'Could not delete question',
        'error'
      )
      setDeleteLoading(false)
    }
  }

  // ── Answer callbacks ──────────────────────────
  // Called by AnswerCard when an answer is updated
  const handleAnswerUpdated = (updatedAnswer) => {
    setAnswers(prev =>
      prev.map(a => a._id === updatedAnswer._id ? updatedAnswer : a)
    )
    // If an answer was accepted/unaccepted, update
    // the question's isResolved state too
    if (updatedAnswer.isAccepted !== undefined) {
      setQuestion(prev => ({
        ...prev,
        isResolved: updatedAnswer.isAccepted,
        acceptedAnswer: updatedAnswer.isAccepted
          ? updatedAnswer._id
          : null,
      }))
    }
  }

  // Called by AnswerCard when an answer is deleted
  const handleAnswerDeleted = (deletedId) => {
    setAnswers(prev => prev.filter(a => a._id !== deletedId))
    setQuestion(prev => ({
      ...prev,
      answers: prev.answers.filter(a =>
        (a._id || a) !== deletedId
      ),
    }))
  }

  // Called by AnswerForm when a new answer is posted
  const handleAnswerPosted = (newAnswer) => {
    setAnswers(prev => [...prev, newAnswer])
    setQuestion(prev => ({
      ...prev,
      answers: [...(prev.answers || []), newAnswer._id],
    }))
  }

  // ─────────────────────────────────────────────
  // RENDER: Loading
  // ─────────────────────────────────────────────
  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <QuestionCardSkeleton />
        <QuestionCardSkeleton />
      </div>
    )
  }

  // ─────────────────────────────────────────────
  // RENDER: Error
  // ─────────────────────────────────────────────
  if (error) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 text-center">
        <div className="text-4xl mb-4">⚠</div>
        <p className="text-sm text-red-500 mb-4">{error}</p>
        <button
          onClick={fetchQuestion}
          className="text-sm text-purple-600 border border-purple-200 px-4 py-2 rounded-lg hover:bg-purple-50"
        >
          Try again
        </button>
      </div>
    )
  }

  if (!question) return null

  // ─────────────────────────────────────────────
  // RENDER: Question detail
  // ─────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-8">

        {/* ── Breadcrumb ──────────────────── */}
        <div className="text-xs text-gray-400 mb-4 flex items-center gap-1">
          <Link to="/" className="hover:text-gray-600">Questions</Link>
          <span>›</span>
          <span className="text-gray-600 truncate max-w-xs">
            {question.title}
          </span>
        </div>

        {/* ── Question card ────────────────── */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 mb-5">

          {/* Title */}
          {isEditing ? (
            <input
              type="text"
              value={editData.title}
              onChange={e => setEditData(p => ({ ...p, title: e.target.value }))}
              className="w-full text-lg font-medium border-b-2 border-purple-400 outline-none pb-1 mb-4 bg-transparent"
              autoFocus
            />
          ) : (
            <h1 className="text-lg font-medium text-gray-900 leading-snug mb-3">
              {question.title}
            </h1>
          )}

          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400 mb-5 pb-4 border-b border-gray-100">
            <span>Asked {formatTimeAgo(question.createdAt)}</span>
            <span>·</span>
            <span>{question.views} views</span>
            <span>·</span>
            <span>{answers.length} answers</span>
            {question.isResolved && (
              <>
                <span>·</span>
                <span className="text-green-600 font-medium">✓ Resolved</span>
              </>
            )}
          </div>

          {/* Body + vote layout */}
          <div className="flex gap-5">

            {/* Vote column */}
            <div className="flex-shrink-0">
              <VoteButton
                count={question.votes?.length || 0}
                hasVoted={hasVoted}
                onVote={handleVote}
                disabled={!isAuth || isOwner || voteLoading}
                disabledReason={
                  !isAuth  ? 'Log in to vote' :
                  isOwner  ? 'Cannot vote on your own question' :
                  ''
                }
              />
            </div>

            {/* Content column */}
            <div className="flex-1 min-w-0">

              {/* Body */}
              {isEditing ? (
                <textarea
                  value={editData.body}
                  onChange={e => setEditData(p => ({ ...p, body: e.target.value }))}
                  rows={8}
                  className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl outline-none focus:border-purple-400 resize-none leading-relaxed mb-4"
                />
              ) : (
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap mb-4">
                  {question.body}
                </p>
              )}

              {/* Tags */}
              {!isEditing && (
                <div className="flex flex-wrap gap-1.5 mb-5">
                  {question.tags?.map(tag => (
                    <TagBadge
                      key={tag}
                      tag={tag}
                      onClick={(t) => navigate(`/?tag=${t}`)}
                    />
                  ))}
                </div>
              )}

              {/* Footer: actions + author */}
              <div className="flex items-center justify-between flex-wrap gap-3">

                {/* Actions */}
                <div className="flex items-center gap-2">
                  {isEditing ? (
                    <>
                      <button
                        onClick={handleEditSubmit}
                        disabled={editLoading}
                        className="text-xs bg-purple-600 text-white px-4 py-1.5 rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors flex items-center gap-1"
                      >
                        {editLoading && '...'}
                        Save changes
                      </button>
                      <button
                        onClick={() => setIsEditing(false)}
                        className="text-xs text-gray-400 hover:text-gray-600 px-3 py-1.5"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    isOwner && (
                      <>
                        <button
                          onClick={startEditing}
                          className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          Edit
                        </button>
                        <span className="text-gray-200">·</span>
                        <button
                          onClick={handleDelete}
                          disabled={deleteLoading}
                          className="text-xs text-red-400 hover:text-red-600 transition-colors disabled:opacity-50"
                        >
                          {deleteLoading ? 'Deleting...' : 'Delete'}
                        </button>
                      </>
                    )
                  )}
                </div>

                {/* Author card */}
                <div className="flex items-center gap-2 bg-purple-50 rounded-xl px-3 py-2">
                  <Avatar name={question.author?.name || ''} size="sm" />
                  <div>
                    <Link
                      to={`/profile/${question.author?._id}`}
                      className="text-xs font-medium text-purple-700 hover:underline"
                    >
                      {question.author?.name}
                    </Link>
                    <div className="text-[10px] text-gray-400">
                      {question.author?.role} · {question.author?.reputationPoints} rep
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>

        {/* ── Answers section ──────────────── */}
        <div className="mb-5">
          <h2 className="text-sm font-medium text-gray-900 mb-4 flex items-center gap-2">
            {answers.length} {answers.length === 1 ? 'Answer' : 'Answers'}
            {question.isResolved && (
              <span className="text-xs bg-green-50 text-green-600 border border-green-200 px-2 py-0.5 rounded-md">
                ✓ Resolved
              </span>
            )}
          </h2>

          {answers.length === 0 ? (
            <div className="bg-white border border-gray-100 rounded-2xl p-10 text-center">
              <div className="text-4xl mb-3">💭</div>
              <p className="text-sm text-gray-400">
                No answers yet. Be the first to help!
              </p>
            </div>
          ) : (
            <div className="bg-white border border-gray-100 rounded-2xl px-6">
              {answers.map(answer => (
                <AnswerCard
                  key={answer._id}
                  answer={answer}
                  questionAuthorId={question.author?._id}
                  onAnswerUpdated={handleAnswerUpdated}
                  onAnswerDeleted={handleAnswerDeleted}
                />
              ))}
            </div>
          )}
        </div>

        {/* ── Answer form ──────────────────── */}
        <AnswerForm
          questionId={id}
          onAnswerPosted={handleAnswerPosted}
        />

      </div>
    </div>
  )
}

export default QuestionDetailPage