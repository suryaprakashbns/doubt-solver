import express from 'express'
import asyncHandler from 'express-async-handler'
import User from '../models/User.js'
import Question from '../models/Question.js'
import Answer from '../models/Answer.js'
import { protect } from '../middleware/authMiddleware.js'

const router = express.Router()

// ── PUT /api/users/profile ─────────────────────
// MUST come BEFORE /:id — otherwise Express treats
// the word "profile" as an :id parameter
router.put('/profile', protect, asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)

  if (!user) {
    res.status(404)
    throw new Error('User not found')
  }

  const { name, bio, avatar } = req.body

  if (name && name.trim().length >= 2) user.name = name.trim()
  if (bio   !== undefined)             user.bio  = bio.trim()
  if (avatar !== undefined)            user.avatar = avatar

  const updated = await user.save()

  res.status(200).json({
    _id:              updated._id,
    name:             updated.name,
    email:            updated.email,
    role:             updated.role,
    bio:              updated.bio,
    avatar:           updated.avatar,
    reputationPoints: updated.reputationPoints,
    createdAt:        updated.createdAt,
  })
}))

// ── GET /api/users/:id/questions ───────────────
// Also BEFORE /:id bare route
router.get('/:id/questions', asyncHandler(async (req, res) => {
  const questions = await Question.find({ author: req.params.id })
    .populate('author', 'name role avatar reputationPoints')
    .sort({ createdAt: -1 })
    .limit(50)

  res.status(200).json({ questions })
}))

// ── GET /api/users/:id/answers ─────────────────
router.get('/:id/answers', asyncHandler(async (req, res) => {
  const answers = await Answer.find({ author: req.params.id })
    .populate('question', 'title _id')
    .populate('author', 'name role avatar reputationPoints')
    .sort({ createdAt: -1 })
    .limit(50)

  res.status(200).json(answers)
}))

// ── GET /api/users/:id ─────────────────────────
// This MUST be last — it's the catch-all
router.get('/:id', asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('-password')

  if (!user) {
    res.status(404)
    throw new Error('User not found')
  }

  const [questionCount, answerCount, acceptedCount] = await Promise.all([
    Question.countDocuments({ author: req.params.id }),
    Answer.countDocuments({ author: req.params.id }),
    Answer.countDocuments({ author: req.params.id, isAccepted: true }),
  ])

  res.status(200).json({
    _id:              user._id,
    name:             user.name,
    email:            user.email,
    role:             user.role,
    bio:              user.bio,
    avatar:           user.avatar,
    reputationPoints: user.reputationPoints,
    createdAt:        user.createdAt,
    stats: {
      questionCount,
      answerCount,
      acceptedCount,
    },
  })
}))

export default router