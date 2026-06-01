// ─────────────────────────────────────────────
// routes/answerRoutes.js
//
// Mounted at /api/answers in server.js
// Full paths:
//   POST   /api/answers
//   PUT    /api/answers/:id
//   DELETE /api/answers/:id
//   PUT    /api/answers/:id/vote
//   PUT    /api/answers/:id/accept
// ─────────────────────────────────────────────

import express from 'express'
import {
  createAnswer,
  updateAnswer,
  deleteAnswer,
  voteAnswer,
  acceptAnswer,
} from '../controllers/answerController.js'
import { protect } from '../middleware/authMiddleware.js'

const router = express.Router()

// All answer routes require authentication —
// you must be logged in to interact with answers
router.post('/',           protect, createAnswer)
router.put('/:id',         protect, updateAnswer)
router.delete('/:id',      protect, deleteAnswer)
router.put('/:id/vote',    protect, voteAnswer)
router.put('/:id/accept',  protect, acceptAnswer)

export default router