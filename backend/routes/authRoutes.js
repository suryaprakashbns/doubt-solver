import express from 'express'
import { registerUser, loginUser, getMe } from '../controllers/authController.js'
import { protect } from '../middleware/authMiddleware.js'

// express.Router() creates a mini Express application
// that can have its own routes and middleware.
// We mount this router at a base path in server.js.
const router = express.Router()

// Public routes — no authentication needed
router.post('/register', registerUser)
router.post('/login', loginUser)

// Protected route — requires valid JWT
// The 'protect' middleware runs BEFORE getMe.
// If the token is invalid, protect sends a 401
// and getMe never runs.
// If the token is valid, protect attaches req.user
// and calls next() — then getMe runs.
router.get('/me', protect, getMe)

export default router