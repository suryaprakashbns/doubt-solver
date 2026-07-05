import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import questionService from '../services/questionService.js'
import useAuth from '../hooks/useAuth.js'
import useDebounce from '../hooks/useDebounce.js'
import QuestionCard from '../components/questions/QuestionCard.jsx'
import SearchBar from '../components/common/SearchBar.jsx'
import TagBadge from '../components/ui/TagBadge.jsx'
import { QuestionCardSkeleton } from '../components/ui/Skeleton.jsx'
import useQueryParams from '../hooks/useQueryParams.js'

// ── These constants are fine outside the component ──
// They are plain data, not hooks
const HOT_TAGS = [
  { name: 'javascript', count: 312 },
  { name: 'react',      count: 241 },
  { name: 'node.js',    count: 189 },
  { name: 'mongodb',    count: 143 },
  { name: 'dsa',        count: 112 },
  { name: 'express',    count:  98 },
]

const SORT_TABS = [
  { key: 'newest',     label: 'Newest'     },
  { key: 'votes',      label: 'Most voted' },
  { key: 'unanswered', label: 'Unanswered' },
]

// ─────────────────────────────────────────────
// HomePage Component
// ─────────────────────────────────────────────
const HomePage = () => {
  const { isAuth, user } = useAuth()

  // ✅ Hook called INSIDE the component — correct
  const { getParam, setParam } = useQueryParams()

  // ✅ These use the hook result — also inside component
  const searchInput = getParam('search', '')
  const activeSort  = getParam('sort', 'newest')
  const activeTag   = getParam('tag', '')
  const page        = parseInt(getParam('page', '1'))

  // ── Data state ───────────────────────────────
  const [questions,  setQuestions]  = useState([])
  const [pagination, setPagination] = useState(null)
  const [loading,    setLoading]    = useState(true)
  const [error,      setError]      = useState(null)

  // ── Debounce search input ─────────────────────
  const debouncedSearch = useDebounce(searchInput, 400)

  // ── Fetch questions ───────────────────────────
  const fetchQuestions = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const data = await questionService.getAll({
        search: debouncedSearch,
        sort:   activeSort,
        tag:    activeTag,
        page,
        limit:  10,
      })

      setQuestions(data.questions)
      setPagination(data.pagination)

    } catch (err) {
      setError(
        err?.response?.data?.message ||
        'Failed to load questions. Please try again.'
      )
    } finally {
      setLoading(false)
    }
  }, [debouncedSearch, activeSort, activeTag, page])

  // Re-fetch whenever filters change
  useEffect(() => {
    fetchQuestions()
  }, [fetchQuestions])

  // ── Handlers ─────────────────────────────────
  const handleSearch = (value) => {
    setParam('search', value)
  }

  const handleTagClick = (tag) => {
    setParam('tag', activeTag === tag ? '' : tag)
  }

  const handleSortChange = (sort) => {
    setParam('sort', sort)
  }

  const handleClearTag = () => {
    setParam('tag', '')
  }

  // ─────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── HERO SECTION ────────────────────── */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 py-10 text-center">

          <div className="inline-flex items-center gap-1.5 bg-purple-50 text-purple-600 text-xs font-medium px-3 py-1 rounded-full mb-4 border border-purple-100">
            <span>⚡</span> For college students
          </div>

          <h1 className="text-3xl font-medium text-gray-900 leading-tight mb-3">
            Ask doubts. Get answers.
            <br />
            <span className="text-purple-600">Grow together.</span>
          </h1>
          <p className="text-sm text-gray-500 max-w-md mx-auto mb-7 leading-relaxed">
            Juniors post questions, seniors answer them.
            A knowledge-sharing platform built for your college community.
          </p>

          <SearchBar
            onSearch={handleSearch}
            initialValue={searchInput}
          />

          <div className="flex justify-center gap-8 mt-8">
            {[
              { value: pagination?.totalQuestions ?? '—', label: 'Questions' },
              { value: '—', label: 'Answers'  },
              { value: '—', label: 'Students' },
            ].map(stat => (
              <div key={stat.label} className="text-center">
                <div className="text-xl font-medium text-gray-900">
                  {stat.value}
                </div>
                <div className="text-xs text-gray-400 mt-0.5">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>

      {/* ── MAIN CONTENT ────────────────────── */}
      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="flex gap-6">

          {/* ── LEFT: Question feed ─────────── */}
          <div className="flex-1 min-w-0">

            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-medium text-gray-900">
                {activeTag
                  ? `Questions tagged "${activeTag}"`
                  : debouncedSearch
                  ? `Results for "${debouncedSearch}"`
                  : 'Latest questions'
                }
              </h2>

              {activeTag && (
                <button
                  onClick={handleClearTag}
                  className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1"
                >
                  ✕ Clear filter
                </button>
              )}
            </div>

            {/* Filter tabs */}
            <div className="flex gap-1 mb-4">
              {SORT_TABS.map(tab => (
                <button
                  key={tab.key}
                  onClick={() => handleSortChange(tab.key)}
                  className={`
                    text-xs px-3 py-1.5 rounded-lg border
                    transition-colors duration-150 font-medium
                    ${activeSort === tab.key
                      ? 'bg-purple-50 text-purple-600 border-purple-200'
                      : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
                    }
                  `}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Question list */}
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <QuestionCardSkeleton key={i} />
              ))
            ) : error ? (
              <div className="bg-red-50 border border-red-100 rounded-2xl p-8 text-center">
                <div className="text-3xl mb-3">⚠</div>
                <p className="text-sm text-red-600 mb-4">{error}</p>
                <button
                  onClick={fetchQuestions}
                  className="text-sm text-red-600 border border-red-200 px-4 py-2 rounded-lg hover:bg-red-50 transition-colors"
                >
                  Try again
                </button>
              </div>
            ) : questions.length === 0 ? (
              <div className="bg-white border border-gray-100 rounded-2xl p-12 text-center">
                <div className="text-5xl mb-4">🤔</div>
                <h3 className="text-base font-medium text-gray-900 mb-2">
                  No questions found
                </h3>
                <p className="text-sm text-gray-400 mb-6">
                  {debouncedSearch
                    ? `No results for "${debouncedSearch}". Try different keywords.`
                    : activeTag
                    ? `No questions tagged "${activeTag}" yet.`
                    : 'Be the first to ask a question!'
                  }
                </p>
                {isAuth && (
                  <Link
                    to="/ask"
                    className="inline-flex items-center gap-2 bg-purple-600 text-white text-sm px-5 py-2.5 rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    + Ask the first question
                  </Link>
                )}
              </div>
            ) : (
              <>
                {questions.map(question => (
                  <QuestionCard
                    key={question._id}
                    question={question}
                    onTagClick={handleTagClick}
                  />
                ))}

                {/* Pagination */}
                {pagination && pagination.totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-6">
                    <button
                      onClick={() => setParam('page', String(Math.max(1, page - 1)))}
                      disabled={!pagination.hasPrevPage}
                      className="text-xs px-3 py-1.5 border border-gray-200 rounded-lg text-gray-500 hover:border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      ← Previous
                    </button>

                    {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                      .filter(p =>
                        p === 1 ||
                        p === pagination.totalPages ||
                        Math.abs(p - page) <= 1
                      )
                      .reduce((acc, p, idx, arr) => {
                        if (idx > 0 && p - arr[idx - 1] > 1) acc.push('...')
                        acc.push(p)
                        return acc
                      }, [])
                      .map((p, idx) =>
                        p === '...' ? (
                          <span key={`ellipsis-${idx}`} className="text-xs text-gray-300 px-1">
                            ...
                          </span>
                        ) : (
                          <button
                            key={p}
                            onClick={() => setParam('page', String(p))}
                            className={`
                              text-xs w-8 h-8 rounded-lg border transition-colors
                              ${page === p
                                ? 'bg-purple-600 text-white border-purple-600'
                                : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
                              }
                            `}
                          >
                            {p}
                          </button>
                        )
                      )
                    }

                    <button
                      onClick={() => setParam('page', String(page + 1))}
                      disabled={!pagination.hasNextPage}
                      className="text-xs px-3 py-1.5 border border-gray-200 rounded-lg text-gray-500 hover:border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      Next →
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* ── RIGHT: Sidebar ──────────────── */}
          <div className="hidden lg:block w-56 flex-shrink-0">

            {isAuth ? (
              <Link
                to="/ask"
                className="block w-full bg-purple-600 text-white text-sm text-center py-2.5 rounded-xl font-medium hover:bg-purple-700 transition-colors mb-4"
              >
                + Ask a question
              </Link>
            ) : (
              <div className="bg-purple-50 border border-purple-100 rounded-xl p-4 mb-4 text-center">
                <p className="text-xs text-purple-700 mb-3 leading-relaxed">
                  Join the community to ask and answer questions
                </p>
                <Link
                  to="/register"
                  className="block bg-purple-600 text-white text-xs py-2 rounded-lg hover:bg-purple-700 transition-colors mb-2"
                >
                  Sign up free
                </Link>
                <Link
                  to="/login"
                  className="block border border-purple-200 text-purple-600 text-xs py-2 rounded-lg hover:bg-purple-50 transition-colors"
                >
                  Log in
                </Link>
              </div>
            )}

            {/* Hot tags */}
            <div className="bg-white border border-gray-100 rounded-xl p-4 mb-4">
              <h3 className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-3">
                Hot tags
              </h3>
              <div className="space-y-2">
                {HOT_TAGS.map(({ name, count }) => (
                  <div key={name} className="flex items-center justify-between">
                    <TagBadge
                      tag={name}
                      onClick={handleTagClick}
                      active={activeTag === name}
                    />
                    <span className="text-xs text-gray-300">{count}q</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Tips card */}
            <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
              <h3 className="text-xs font-medium text-amber-700 mb-2">
                💡 Asking good questions
              </h3>
              <ul className="text-xs text-amber-600 space-y-1.5 leading-relaxed">
                <li>• Be specific and clear</li>
                <li>• Include error messages</li>
                <li>• Share what you tried</li>
                <li>• Add relevant code</li>
              </ul>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}

export default HomePage