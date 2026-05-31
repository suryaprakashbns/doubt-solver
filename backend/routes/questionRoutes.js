// ─────────────────────────────────────────────
// routes/questionRoutes.js
//
// Maps HTTP method + path → controller function
//
// Mounted at /api/questions in server.js
// So these paths become:
//   GET    /api/questions
//   POST   /api/questions
//   GET    /api/questions/:id
//   PUT    /api/questions/:id
//   DELETE /api/questions/:id
//   PUT    /api/questions/:id/vote
// ─────────────────────────────────────────────

import express from 'express'
import {
  createQuestion,
  getQuestions,
  getQuestionById,
  updateQuestion,
  deleteQuestion,
  voteQuestion,
} from '../controllers/questionController.js'
import { protect } from '../middleware/authMiddleware.js'

const router = express.Router()

// ── Public routes ───────────────────────────
// Anyone can browse questions without logging in
router.get('/', getQuestions)
router.get('/:id', getQuestionById)

// ── Protected routes ────────────────────────
// Must be logged in to create, edit, delete, vote
router.post('/', protect, createQuestion)
router.put('/:id', protect, updateQuestion)
router.delete('/:id', protect, deleteQuestion)
router.put('/:id/vote', protect, voteQuestion)

export default router