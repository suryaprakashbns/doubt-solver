// ─────────────────────────────────────────────
// pages/ProfilePage.jsx
//
// The user profile page.
// Shows different content depending on whether
// you're viewing your own profile or someone else's:
//
// OWN PROFILE:
// - Editable name, bio
// - All stats and activity
// - Edit profile form
//
// OTHER'S PROFILE:
// - Read-only view
// - Their public questions and answers
// ─────────────────────────────────────────────

import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import useAuth from '../hooks/useAuth.js'
import useProfile from '../hooks/useProfile.js'
import { useToast } from '../components/ui/Toast.jsx'
import userService from '../services/userService.js'
import Avatar from '../components/ui/Avatar.jsx'
import StatCard from '../components/ui/StatCard.jsx'
import TagBadge from '../components/ui/TagBadge.jsx'
import Spinner from '../components/ui/Spinner.jsx'
import { SkeletonBlock } from '../components/ui/Skeleton.jsx'
import { formatTimeAgo, getInitials } from '../utils/formatters.js'

// ── TABS CONFIG ──────────────────────────────
const TABS = [
  { key: 'activity',  label: 'Activity'   },
  { key: 'questions', label: 'Questions'  },
  { key: 'answers',   label: 'Answers'    },
]

// ── BADGE DEFINITIONS ────────────────────────
// In a full app these would come from the backend.
// For now we derive them from user stats.
const getBadges = (stats, role) => {
  const badges = []

  if (stats?.answerCount >= 1)
    badges.push({ icon: '💬', name: 'First answer',    desc: 'Posted your first answer'  })
  if (stats?.acceptedCount >= 1)
    badges.push({ icon: '✓',  name: 'Problem solver',  desc: '1+ accepted answers'        })
  if (stats?.acceptedCount >= 10)
    badges.push({ icon: '🏆', name: 'Top contributor', desc: '10+ accepted answers'       })
  if (stats?.questionCount >= 1)
    badges.push({ icon: '❓', name: 'Curious mind',    desc: 'Asked your first question'  })
  if (role === 'senior')
    badges.push({ icon: '⭐', name: 'Senior',          desc: 'Trusted knowledge sharer'   })

  return badges
}

// ─────────────────────────────────────────────
// ProfilePage Component
// ─────────────────────────────────────────────
const ProfilePage = () => {
  const { id }        = useParams()
  const { user: authUser, updateUser, isAuth } = useAuth()
  const { showToast } = useToast()
  const navigate      = useNavigate()

  // Is the viewer looking at their own profile?
  const isOwnProfile = isAuth && authUser?._id === id

  // ── Profile data from custom hook ────────────
  const {
    profile,
    questions,
    answers,
    loading,
    error,
    updateProfileLocally,
  } = useProfile(id)

  // ── UI state ─────────────────────────────────
  const [activeTab,    setActiveTab]    = useState('activity')
  const [isEditing,    setIsEditing]    = useState(false)
  const [editData,     setEditData]     = useState({ name: '', bio: '' })
  const [editLoading,  setEditLoading]  = useState(false)

  // ── Start editing ─────────────────────────────
  const startEditing = () => {
    setEditData({ name: profile.name, bio: profile.bio || '' })
    setIsEditing(true)
  }

  // ── Save profile edits ────────────────────────
  const handleSaveProfile = async () => {
    if (!editData.name.trim() || editData.name.trim().length < 2) {
      showToast('Name must be at least 2 characters', 'error')
      return
    }

    setEditLoading(true)
    try {
      const updated = await userService.updateProfile({
        name: editData.name.trim(),
        bio:  editData.bio.trim(),
      })

      // Update local profile state (no re-fetch needed)
      updateProfileLocally(updated)

      // Also update the global auth context so
      // the Navbar shows the new name immediately
      updateUser({ name: updated.name, bio: updated.bio })

      setIsEditing(false)
      showToast('Profile updated!', 'success')

    } catch (error) {
      showToast(
        error?.response?.data?.message || 'Failed to update profile',
        'error'
      )
    } finally {
      setEditLoading(false)
    }
  }

  // ── Derive top tags from user's questions ─────
  const topTags = questions
    .flatMap(q => q.tags || [])
    .reduce((acc, tag) => {
      acc[tag] = (acc[tag] || 0) + 1
      return acc
    }, {})
  const sortedTags = Object.entries(topTags)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([tag]) => tag)

  // ── Build activity feed ───────────────────────
  // Merge questions and answers into one timeline
  const activityFeed = [
    ...questions.map(q => ({
      type:      'question',
      title:     q.title,
      id:        q._id,
      createdAt: q.createdAt,
      icon:      '❓',
      label:     'Asked',
    })),
    ...answers.map(a => ({
      type:      'answer',
      title:     a.question?.title || 'a question',
      id:        a.question?._id,
      createdAt: a.createdAt,
      icon:      a.isAccepted ? '✓' : '💬',
      label:     a.isAccepted ? 'Accepted answer on' : 'Answered',
      isAccepted: a.isAccepted,
    })),
  ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
   .slice(0, 20)

  const badges = profile ? getBadges(profile.stats, profile.role) : []

  // ─────────────────────────────────────────────
  // RENDER: Loading
  // ─────────────────────────────────────────────
  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white border border-gray-100 rounded-2xl p-6 mb-5">
          <div className="flex items-start gap-5 mb-6">
            <SkeletonBlock className="w-16 h-16 rounded-full" />
            <div className="flex-1">
              <SkeletonBlock className="h-6 w-48 mb-2" />
              <SkeletonBlock className="h-4 w-32 mb-3" />
              <SkeletonBlock className="h-4 w-full" />
            </div>
          </div>
          <div className="grid grid-cols-4 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <SkeletonBlock key={i} className="h-20 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  // ─────────────────────────────────────────────
  // RENDER: Error
  // ─────────────────────────────────────────────
  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="text-4xl mb-4">👤</div>
        <h2 className="text-base font-medium text-gray-900 mb-2">
          Profile not found
        </h2>
        <p className="text-sm text-gray-400 mb-5">{error}</p>
        <button
          onClick={() => navigate('/')}
          className="text-sm text-purple-600 border border-purple-200 px-4 py-2 rounded-lg hover:bg-purple-50"
        >
          Go home
        </button>
      </div>
    )
  }

  if (!profile) return null

  // ─────────────────────────────────────────────
  // RENDER: Profile
  // ─────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">

        {/* ── PROFILE HEADER CARD ─────────── */}
        <div className="bg-white border border-gray-100 rounded-2xl p-6 mb-5">

          {/* Top row: avatar + info + edit button */}
          <div className="flex items-start gap-5 mb-6">

            {/* Avatar — large */}
            <Avatar
              name={profile.name}
              src={profile.avatar}
              size="xl"
              className="flex-shrink-0"
            />

            {/* Info */}
            <div className="flex-1 min-w-0">
              {isEditing ? (
                // ── Edit mode ──────────────────
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Name
                    </label>
                    <input
                      type="text"
                      value={editData.name}
                      onChange={e => setEditData(p => ({ ...p, name: e.target.value }))}
                      className="w-full h-9 px-3 text-sm border border-gray-200 rounded-lg outline-none focus:border-purple-400"
                      maxLength={50}
                      autoFocus
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Bio
                    </label>
                    <textarea
                      value={editData.bio}
                      onChange={e => setEditData(p => ({ ...p, bio: e.target.value }))}
                      placeholder="Tell others about yourself..."
                      maxLength={200}
                      rows={3}
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-purple-400 resize-none leading-relaxed placeholder:text-gray-300"
                    />
                    <div className="text-right text-xs text-gray-300 mt-1">
                      {editData.bio.length}/200
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleSaveProfile}
                      disabled={editLoading}
                      className="flex items-center gap-1.5 bg-purple-600 text-white text-xs px-4 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
                    >
                      {editLoading && <Spinner size="sm" color="border-white" />}
                      Save changes
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="text-xs text-gray-400 hover:text-gray-600 px-3 py-2"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                // ── View mode ──────────────────
                <>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h1 className="text-xl font-medium text-gray-900 mb-1">
                        {profile.name}
                      </h1>
                      <span className={`
                        inline-flex items-center text-xs font-medium px-2 py-0.5
                        rounded-md capitalize mb-2
                        ${profile.role === 'senior'
                          ? 'bg-purple-50 text-purple-600'
                          : 'bg-gray-50 text-gray-500'
                        }
                      `}>
                        {profile.role}
                      </span>
                    </div>

                    {/* Edit button — only on own profile */}
                    {isOwnProfile && (
                      <button
                        onClick={startEditing}
                        className="flex-shrink-0 text-xs border border-gray-200 text-gray-500 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-1.5"
                      >
                        ✎ Edit profile
                      </button>
                    )}
                  </div>

                  {profile.bio ? (
                    <p className="text-sm text-gray-500 leading-relaxed mb-2">
                      {profile.bio}
                    </p>
                  ) : (
                    isOwnProfile && (
                      <p className="text-sm text-gray-300 italic mb-2">
                        No bio yet — click "Edit profile" to add one
                      </p>
                    )
                  )}

                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    <span>📅 Joined {formatTimeAgo(profile.createdAt)}</span>
                    {profile.role === 'senior' && (
                      <span>⭐ Verified senior</span>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatCard
              value={profile.reputationPoints}
              label="Reputation"
              highlight
            />
            <StatCard
              value={profile.stats?.answerCount   || 0}
              label="Answers given"
            />
            <StatCard
              value={profile.stats?.acceptedCount || 0}
              label="Accepted answers"
            />
            <StatCard
              value={profile.stats?.questionCount || 0}
              label="Questions asked"
            />
          </div>

        </div>

        {/* ── MAIN CONTENT + SIDEBAR ──────── */}
        <div className="flex gap-5">

          {/* ── LEFT: Tabs + Content ─────── */}
          <div className="flex-1 min-w-0">

            {/* Tab navigation */}
            <div className="flex border-b border-gray-200 mb-4">
              {TABS.map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`
                    text-sm px-4 py-2.5 border-b-2 transition-colors
                    ${activeTab === tab.key
                      ? 'border-purple-600 text-purple-600 font-medium'
                      : 'border-transparent text-gray-400 hover:text-gray-600'
                    }
                  `}
                >
                  {tab.label}
                  <span className="ml-1.5 text-xs bg-gray-100 text-gray-400 px-1.5 py-0.5 rounded-full">
                    {tab.key === 'questions' ? questions.length :
                     tab.key === 'answers'   ? answers.length   :
                     activityFeed.length}
                  </span>
                </button>
              ))}
            </div>

            {/* ── ACTIVITY TAB ─────────────── */}
            {activeTab === 'activity' && (
              <div>
                {activityFeed.length === 0 ? (
                  <div className="bg-white border border-gray-100 rounded-2xl p-10 text-center">
                    <div className="text-3xl mb-3">🌱</div>
                    <p className="text-sm text-gray-400">
                      No activity yet
                    </p>
                  </div>
                ) : (
                  <div className="bg-white border border-gray-100 rounded-2xl divide-y divide-gray-100">
                    {activityFeed.map((item, idx) => (
                      <div
                        key={`${item.type}-${item.id}-${idx}`}
                        className="flex items-start gap-3 p-4 hover:bg-gray-50 transition-colors"
                      >
                        {/* Icon */}
                        <div className={`
                          w-8 h-8 rounded-lg flex items-center justify-center
                          text-sm flex-shrink-0 mt-0.5
                          ${item.type === 'question'
                            ? 'bg-purple-50 text-purple-600'
                            : item.isAccepted
                            ? 'bg-green-50 text-green-600'
                            : 'bg-blue-50 text-blue-600'
                          }
                        `}>
                          {item.icon}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-gray-400 mb-0.5">
                            {item.label}
                          </p>
                          <Link
                            to={`/questions/${item.id}`}
                            className="text-sm text-gray-700 hover:text-purple-600 transition-colors line-clamp-1"
                          >
                            {item.title}
                          </Link>
                        </div>

                        {/* Time */}
                        <span className="text-xs text-gray-300 flex-shrink-0">
                          {formatTimeAgo(item.createdAt)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── QUESTIONS TAB ─────────────── */}
            {activeTab === 'questions' && (
              <div>
                {questions.length === 0 ? (
                  <div className="bg-white border border-gray-100 rounded-2xl p-10 text-center">
                    <div className="text-3xl mb-3">🤔</div>
                    <p className="text-sm text-gray-400">
                      No questions posted yet
                    </p>
                    {isOwnProfile && (
                      <Link
                        to="/ask"
                        className="inline-block mt-4 text-sm text-purple-600 border border-purple-200 px-4 py-2 rounded-lg hover:bg-purple-50 transition-colors"
                      >
                        Ask your first question
                      </Link>
                    )}
                  </div>
                ) : (
                  <div className="bg-white border border-gray-100 rounded-2xl divide-y divide-gray-100">
                    {questions.map(q => (
                      <div key={q._id} className="p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-start gap-3">

                          {/* Stats */}
                          <div className="flex gap-3 text-center flex-shrink-0">
                            <div>
                              <div className={`
                                text-sm font-medium
                                ${(q.votes?.length || 0) > 0
                                  ? 'text-purple-600'
                                  : 'text-gray-400'
                                }
                              `}>
                                {q.votes?.length || 0}
                              </div>
                              <div className="text-[10px] text-gray-300">votes</div>
                            </div>
                            <div>
                              <div className={`
                                text-sm font-medium
                                ${q.isResolved
                                  ? 'text-green-600'
                                  : (q.answers?.length || 0) > 0
                                  ? 'text-gray-600'
                                  : 'text-gray-300'
                                }
                              `}>
                                {q.answers?.length || 0}
                              </div>
                              <div className="text-[10px] text-gray-300">ans</div>
                            </div>
                          </div>

                          {/* Title + tags */}
                          <div className="flex-1 min-w-0">
                            <Link
                              to={`/questions/${q._id}`}
                              className="text-sm text-gray-800 hover:text-purple-600 transition-colors font-medium line-clamp-1 mb-1.5"
                            >
                              {q.title}
                            </Link>
                            <div className="flex flex-wrap gap-1">
                              {q.tags?.slice(0, 3).map(tag => (
                                <span
                                  key={tag}
                                  className="text-xs bg-purple-50 text-purple-500 border border-purple-100 px-1.5 py-0.5 rounded"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>

                          {/* Time */}
                          <span className="text-xs text-gray-300 flex-shrink-0">
                            {formatTimeAgo(q.createdAt)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── ANSWERS TAB ───────────────── */}
            {activeTab === 'answers' && (
              <div>
                {answers.length === 0 ? (
                  <div className="bg-white border border-gray-100 rounded-2xl p-10 text-center">
                    <div className="text-3xl mb-3">💬</div>
                    <p className="text-sm text-gray-400">
                      No answers posted yet
                    </p>
                  </div>
                ) : (
                  <div className="bg-white border border-gray-100 rounded-2xl divide-y divide-gray-100">
                    {answers.map(a => (
                      <div key={a._id} className="p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-start gap-3">

                          {/* Accepted badge or vote count */}
                          <div className="flex-shrink-0 text-center">
                            {a.isAccepted ? (
                              <div className="w-8 h-8 bg-green-50 border border-green-200 rounded-full flex items-center justify-center text-green-600 text-sm">
                                ✓
                              </div>
                            ) : (
                              <div>
                                <div className="text-sm font-medium text-gray-500">
                                  {a.votes?.length || 0}
                                </div>
                                <div className="text-[10px] text-gray-300">votes</div>
                              </div>
                            )}
                          </div>

                          {/* Answer body + question link */}
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-gray-400 mb-1">
                              Answer on:{' '}
                              <Link
                                to={`/questions/${a.question?._id}`}
                                className="text-purple-600 hover:underline"
                              >
                                {a.question?.title || 'a question'}
                              </Link>
                            </p>
                            <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
                              {a.body}
                            </p>
                          </div>

                          {/* Time */}
                          <span className="text-xs text-gray-300 flex-shrink-0">
                            {formatTimeAgo(a.createdAt)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

          </div>

          {/* ── RIGHT: Sidebar ─────────────── */}
          <div className="hidden lg:block w-52 flex-shrink-0">

            {/* Reputation breakdown */}
            <div className="bg-white border border-gray-100 rounded-xl p-4 mb-4">
              <h3 className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-3">
                Reputation
              </h3>
              <div className="text-3xl font-medium text-purple-600 mb-1">
                {profile.reputationPoints}
              </div>
              <div className="text-xs text-gray-400 mb-3">
                points earned
              </div>

              {/* Progress to next level */}
              {(() => {
                const levels = [
                  { name: 'Newcomer',  min: 0    },
                  { name: 'Member',    min: 100  },
                  { name: 'Regular',   min: 500  },
                  { name: 'Expert',    min: 1500 },
                  { name: 'Master',    min: 3000 },
                ]
                const rep     = profile.reputationPoints
                const current = [...levels].reverse().find(l => rep >= l.min) || levels[0]
                const next    = levels[levels.indexOf(current) + 1]

                if (!next) return (
                  <div className="text-xs text-purple-600 font-medium">
                    🏆 Master level achieved!
                  </div>
                )

                const progress = Math.min(
                  ((rep - current.min) / (next.min - current.min)) * 100,
                  100
                )

                return (
                  <>
                    <div className="flex justify-between text-xs text-gray-400 mb-1">
                      <span>{current.name}</span>
                      <span>{next.name}</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full mb-1">
                      <div
                        className="h-1.5 bg-purple-500 rounded-full transition-all duration-500"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <div className="text-xs text-gray-300">
                      {next.min - rep} rep to {next.name}
                    </div>
                  </>
                )
              })()}
            </div>

            {/* Top tags */}
            {sortedTags.length > 0 && (
              <div className="bg-white border border-gray-100 rounded-xl p-4 mb-4">
                <h3 className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-3">
                  Top tags
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {sortedTags.map(tag => (
                    <Link key={tag} to={`/?tag=${tag}`}>
                      <TagBadge tag={tag} />
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Badges */}
            {badges.length > 0 && (
              <div className="bg-white border border-gray-100 rounded-xl p-4">
                <h3 className="text-xs font-medium text-gray-600 uppercase tracking-wide mb-3">
                  Badges
                </h3>
                <div className="space-y-2">
                  {badges.map(badge => (
                    <div key={badge.name} className="flex items-center gap-2">
                      <div className="w-7 h-7 bg-amber-50 rounded-full flex items-center justify-center text-sm">
                        {badge.icon}
                      </div>
                      <div>
                        <div className="text-xs font-medium text-gray-700">
                          {badge.name}
                        </div>
                        <div className="text-[10px] text-gray-400">
                          {badge.desc}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfilePage