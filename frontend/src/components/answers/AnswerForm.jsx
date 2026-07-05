// ─────────────────────────────────────────────
// components/answers/AnswerForm.jsx
//
// The form for posting a new answer.
// Shows a login prompt if the user isn't logged in.
// ─────────────────────────────────────────────

import { useState } from 'react'
import { Link } from 'react-router-dom'
import answerService from '../../services/answerService.js'
import useAuth from '../../hooks/useAuth.js'
import { useToast } from '../ui/Toast.jsx'
import Spinner from '../ui/Spinner.jsx'

const AnswerForm = ({ questionId, onAnswerPosted }) => {
  const { isAuth }    = useAuth()
  const { showToast } = useToast()

  const [body,    setBody]    = useState('')
  const [loading, setLoading] = useState(false)

  const isValid = body.trim().length >= 20

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!isValid) {
      showToast('Answer must be at least 20 characters', 'error')
      return
    }

    setLoading(true)
    try {
      const newAnswer = await answerService.create({
        body: body.trim(),
        questionId,
      })
      showToast('Answer posted!', 'success')
      setBody('')
      onAnswerPosted(newAnswer)
    } catch (error) {
      showToast(
        error?.response?.data?.message || 'Failed to post answer',
        'error'
      )
    } finally {
      setLoading(false)
    }
  }

  // ── Not logged in state ───────────────────────
  if (!isAuth) {
    return (
      <div className="bg-white border border-gray-100 rounded-2xl p-8 text-center">
        <div className="text-3xl mb-3">💬</div>
        <h3 className="text-sm font-medium text-gray-900 mb-2">
          Know the answer?
        </h3>
        <p className="text-xs text-gray-400 mb-5 leading-relaxed">
          Log in or create an account to post your answer
          and help fellow students.
        </p>
        <div className="flex justify-center gap-3">
          <Link
            to="/login"
            className="text-sm border border-gray-200 text-gray-600 px-5 py-2 rounded-xl hover:bg-gray-50 transition-colors"
          >
            Log in
          </Link>
          <Link
            to="/register"
            className="text-sm bg-purple-600 text-white px-5 py-2 rounded-xl hover:bg-purple-700 transition-colors"
          >
            Sign up
          </Link>
        </div>
      </div>
    )
  }

  // ── Logged in: show the form ──────────────────
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-6">
      <h3 className="text-sm font-medium text-gray-900 mb-4">
        Your answer
      </h3>
      <form onSubmit={handleSubmit}>
        <textarea
          value={body}
          onChange={e => setBody(e.target.value)}
          placeholder={
            'Write a detailed answer...\n\n' +
            'Explain your reasoning, include examples or code, ' +
            'and be as specific as possible.'
          }
          rows={7}
          className="
            w-full px-4 py-3 text-sm border border-gray-200
            rounded-xl outline-none focus:border-purple-400
            resize-none leading-relaxed placeholder:text-gray-300
            transition-colors duration-150 mb-3
          "
        />

        {/* Character count */}
        <div className="flex items-center justify-between mb-4">
          <span className={`text-xs ${
            body.length > 0 && body.length < 20
              ? 'text-red-400'
              : 'text-gray-300'
          }`}>
            {body.length < 20 && body.length > 0
              ? `${20 - body.length} more characters needed`
              : `${body.length} characters`
            }
          </span>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading || !isValid}
            className={`
              flex items-center gap-2 px-6 py-2.5
              rounded-xl text-sm font-medium
              transition-all duration-150
              ${(loading || !isValid)
                ? 'bg-purple-200 cursor-not-allowed text-white'
                : 'bg-purple-600 hover:bg-purple-700 active:scale-[0.98] text-white'
              }
            `}
          >
            {loading && <Spinner size="sm" color="border-white" />}
            Post answer
          </button>
        </div>
      </form>
    </div>
  )
}

export default AnswerForm