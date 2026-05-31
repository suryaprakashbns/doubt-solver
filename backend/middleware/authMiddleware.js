// ─────────────────────────────────────────────
// middleware/authMiddleware.js
//
// This middleware protects routes that require
// authentication. It runs before protected route
// handlers and does three things:
// 1. Extracts the JWT from the Authorization header
// 2. Verifies the token is valid and not expired
// 3. Fetches the user from MongoDB and attaches
//    them to req.user for downstream handlers
// ─────────────────────────────────────────────

import jwt from 'jsonwebtoken'
import asyncHandler from 'express-async-handler'
import User from '../models/User.js'

// ─────────────────────────────────────────────
// protect middleware
//
// Usage: router.get('/me', protect, getMe)
// The protect function runs, then if it calls
// next(), getMe runs. If protect sends a response,
// getMe never runs.
// ─────────────────────────────────────────────
const protect = asyncHandler(async (req, res, next) => {
  let token

  // ── Step 1: Extract token from header ─────────
  // The standard for JWT is to send it in the
  // Authorization header with the format:
  //   Authorization: Bearer eyJhbGc...
  //
  // req.headers.authorization gives us the full
  // string "Bearer eyJhbGc..."
  // We check it starts with 'Bearer' and split
  // on the space to get just the token part.
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    // "Bearer eyJhbGc...".split(' ') gives ['Bearer', 'eyJhbGc...']
    // [1] gets the second element — the token itself
    token = req.headers.authorization.split(' ')[1]
  }

  // ── Step 2: Check token exists ────────────────
  if (!token) {
    res.status(401)
    throw new Error('Not authorized — no token provided')
  }

  // ── Step 3: Verify the token ──────────────────
  // jwt.verify() does two things:
  // 1. Checks the signature is valid (was signed
  //    with our JWT_SECRET — not tampered with)
  // 2. Checks the token hasn't expired
  //
  // If either check fails, it throws a JsonWebTokenError
  // or TokenExpiredError — asyncHandler catches it
  // and passes it to our global errorHandler.
  const decoded = jwt.verify(token, process.env.JWT_SECRET)
  // decoded is now: { userId: '64f1a2...', role: 'junior', iat: ..., exp: ... }

  // ── Step 4: Fetch the user from database ──────
  // WHY FETCH FROM DB instead of just using
  // the decoded payload?
  //
  // The token's payload is from the time of login.
  // What if the user was deleted since then?
  // What if their role was changed by an admin?
  // Fetching fresh from the DB ensures we have
  // current, accurate user data.
  //
  // We use .select('-password') to explicitly
  // exclude the password field (even though it's
  // already excluded by default via select: false,
  // this makes the intention clear).
  req.user = await User.findById(decoded.userId).select('-password')

  // ── Step 5: Check user still exists ───────────
  if (!req.user) {
    res.status(401)
    throw new Error('Not authorized — user no longer exists')
  }

  // ── Step 6: Pass control to the next handler ──
  // Everything checked out. Attach the user to req
  // and call next() so the actual route handler runs.
  next()
})


// ─────────────────────────────────────────────
// authorize middleware (Role-based access control)
//
// Usage: router.delete('/:id', protect, authorize('senior'), deleteQuestion)
//
// This runs AFTER protect. By this point req.user
// is already set. We just check if their role
// is in the allowed roles list.
//
// It's a function that RETURNS middleware — this
// pattern is called a "middleware factory" and
// lets us pass arguments to middleware.
// ─────────────────────────────────────────────
const authorize = (...roles) => {
  // The returned function IS the middleware
  return (req, res, next) => {
    // roles is an array like ['senior'] or ['senior', 'admin']
    // We check if req.user.role is in that array
    if (!roles.includes(req.user.role)) {
      res.status(403)
      throw new Error(
        `Role '${req.user.role}' is not authorized to perform this action`
      )
    }
    next()
  }
}

export { protect, authorize }