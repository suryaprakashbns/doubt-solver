// ─────────────────────────────────────────────
// pages/AskQuestionPage.jsx
//
// The form for posting a new question.
//
// FEATURES:
// - Title and body fields with live character count
// - TagInput component for adding tags
// - Live preview panel showing formatted output
// - Client-side validation before submission
// - Loading state during API call
// - Toast on success, redirects to new question
// ─────────────────────────────────────────────

import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import questionService from '../services/questionService.js'
import useAuth from '../hooks/useAuth.js'
import { useToast } from '../components/ui/Toast.jsx'
import TagInput from '../components/ui/TagInput.jsx'
import Spinner from '../components/ui/Spinner.jsx'

// ── Validation rules ─────────────────────────
const RULES = {
  title: { min: 10,  max: 150 },
  body:  { min: 20,  max: 5000 },
}

const AskQuestionPage = () => {
  const navigate  = useNavigate()
  const { user }  = useAuth()
  const { showToast } = useToast()

  // ── Form state ───────────────────────────────
  const [formData, setFormData] = useState({
    title: '',
    body:  '',
    tags:  [],
  })

  const [touched, setTouched]   = useState({ title: false, body: false })
  const [loading, setLoading]   = useState(false)
  const [showPreview, setShowPreview] = useState(false)

  const { title, body, tags } = formData

  // ── Validation ───────────────────────────────
  const errors = {
    title: !title
      ? 'Title is required'
      : title.length < RULES.title.min
      ? `Title must be at least ${RULES.title.min} characters`
      : title.length > RULES.title.max
      ? `Title cannot exceed ${RULES.title.max} characters`
      : '',
    body: !body
      ? 'Question details are required'
      : body.length < RULES.body.min
      ? `Details must be at least ${RULES.body.min} characters`
      : '',
    tags: tags.length === 0
      ? 'At least one tag is required'
      : '',
  }

  const isValid = !errors.title && !errors.body && !errors.tags

  // ── Handlers ─────────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleBlur = (e) => {
    setTouched(prev => ({ ...prev, [e.target.name]: true }))
  }

  const handleTagsChange = (newTags) => {
    setFormData(prev => ({ ...prev, tags: newTags }))
  }

const handleSubmit = async (e) => {
  e.preventDefault();

  setTouched({ title: true, body: true });

  if (!isValid) return;

  try {
    setLoading(true);

    const newQuestion = await questionService.create({
      title: title.trim(),
      body: body.trim(),
      tags,
    });

    showToast("Question posted successfully!", "success");

    // Reset the form
    setFormData({
      title: "",
      body: "",
      tags: [],
    });

    // Navigate to the newly created question
    navigate(`/questions/${newQuestion._id}`);

  } catch (err) {
    console.error(err);

    showToast(
      err.response?.data?.message || "Failed to post question",
      "error"
    );
  } finally {
    setLoading(false);
  }
};

  const showError = (field) => touched[field] && errors[field]

  // ── Character count color ─────────────────────
  const titleProgress = title.length / RULES.title.max
  const bodyProgress  = body.length  / RULES.body.max

  const progressColor = (ratio) =>
    ratio > 0.9 ? 'text-red-500' :
    ratio > 0.7 ? 'text-amber-500' :
    'text-gray-300'

  // ─────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-8">

        {/* ── Page header ─────────────────── */}
        <div className="mb-6">
          <Link
            to="/"
            className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1 mb-4 w-fit"
          >
            ← Back to questions
          </Link>
          <h1 className="text-xl font-medium text-gray-900">
            Ask a question
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Be specific. Include what you tried and what happened.
          </p>
        </div>

        {/* ── Writing tips ────────────────── */}
        <div className="bg-purple-50 border border-purple-100 rounded-xl p-4 mb-6">
          <h3 className="text-xs font-medium text-purple-700 mb-2">
            Tips for a great question
          </h3>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1">
            {[
              'Summarize the problem in the title',
              'Describe what you expected vs what happened',
              'Include relevant code or error messages',
              'Mention what you already tried',
            ].map(tip => (
              <div key={tip} className="text-xs text-purple-600 flex items-start gap-1.5">
                <span className="mt-0.5">•</span>
                <span>{tip}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Form card ───────────────────── */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6">

          {/* Preview toggle */}
          <div className="flex justify-end mb-4">
            <button
              type="button"
              onClick={() => setShowPreview(p => !p)}
              className="text-xs text-purple-600 border border-purple-200 px-3 py-1.5 rounded-lg hover:bg-purple-50 transition-colors"
            >
              {showPreview ? '← Edit' : 'Preview →'}
            </button>
          </div>

          {showPreview ? (
            // ── PREVIEW MODE ──────────────────
            <div className="min-h-[300px]">
              <h2 className="text-base font-medium text-gray-900 mb-3">
                {title || (
                  <span className="text-gray-300">Your title will appear here</span>
                )}
              </h2>
              <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap mb-4">
                {body || (
                  <span className="text-gray-300">Your question details will appear here</span>
                )}
              </p>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {tags.map(tag => (
                    <span
                      key={tag}
                      className="text-xs bg-purple-50 text-purple-600 border border-purple-200 px-2 py-0.5 rounded-md"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

          ) : (
            // ── EDIT MODE ─────────────────────
            <form onSubmit={handleSubmit} noValidate>

              {/* Title */}
              <div className="mb-5">
                <div className="flex items-center justify-between mb-1.5">
                  <label
                    htmlFor="title"
                    className="text-xs font-medium text-gray-600"
                  >
                    Question title
                  </label>
                  <span className={`text-xs ${progressColor(titleProgress)}`}>
                    {title.length}/{RULES.title.max}
                  </span>
                </div>
                <input
                  id="title"
                  name="title"
                  type="text"
                  value={title}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="e.g. How does useEffect cleanup work in React?"
                  maxLength={RULES.title.max}
                  className={`
                    w-full h-11 px-4 text-sm rounded-xl border outline-none
                    transition-colors duration-150 placeholder:text-gray-300
                    ${showError('title')
                      ? 'border-red-300 bg-red-50 focus:border-red-400'
                      : 'border-gray-200 focus:border-purple-400'
                    }
                  `}
                />
                {showError('title') && (
                  <p className="mt-1.5 text-xs text-red-500">
                    ⚠ {errors.title}
                  </p>
                )}
              </div>

              {/* Body */}
              <div className="mb-5">
                <div className="flex items-center justify-between mb-1.5">
                  <label
                    htmlFor="body"
                    className="text-xs font-medium text-gray-600"
                  >
                    Question details
                  </label>
                  <span className={`text-xs ${progressColor(bodyProgress)}`}>
                    {body.length}/{RULES.body.max}
                  </span>
                </div>
                <textarea
                  id="body"
                  name="body"
                  value={body}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder={
                    `Describe your problem in detail...\n\n` +
                    `What did you try?\n` +
                    `What error did you get?\n` +
                    `What result were you expecting?`
                  }
                  maxLength={RULES.body.max}
                  rows={10}
                  className={`
                    w-full px-4 py-3 text-sm rounded-xl border outline-none
                    resize-none transition-colors duration-150
                    placeholder:text-gray-300 leading-relaxed
                    ${showError('body')
                      ? 'border-red-300 bg-red-50 focus:border-red-400'
                      : 'border-gray-200 focus:border-purple-400'
                    }
                  `}
                />
                {showError('body') && (
                  <p className="mt-1.5 text-xs text-red-500">
                    ⚠ {errors.body}
                  </p>
                )}
              </div>

              {/* Tags */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-medium text-gray-600">
                    Tags
                  </label>
                  <span className="text-xs text-gray-300">
                    Press Enter or comma to add
                  </span>
                </div>
                <TagInput
                  tags={tags}
                  onChange={handleTagsChange}
                  maxTags={5}
                />
                {errors.tags && tags.length === 0 && touched.title && (
                  <p className="mt-1.5 text-xs text-red-500">
                    ⚠ {errors.tags}
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <Link
                  to="/"
                  className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={loading}
                  className={`
                    flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-medium
                    transition-all duration-150
                    ${loading
                      ? 'bg-purple-400 cursor-not-allowed text-white'
                      : 'bg-purple-600 hover:bg-purple-700 active:scale-[0.98] text-white'
                    }
                  `}
                >
                  {loading ? (
                    <>
                      <Spinner size="sm" color="border-white" />
                      Posting...
                    </>
                  ) : (
                    'Post question'
                  )}
                </button>
              </div>

            </form>
          )}
        </div>

      </div>
    </div>
  )
}

export default AskQuestionPage