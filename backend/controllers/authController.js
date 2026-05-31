// ─────────────────────────────────────────────
// controllers/authController.js
//
// Controllers contain the business logic for
// each API endpoint. They receive the request,
// interact with the database, and send a response.
//
// This file handles three operations:
// 1. registerUser  — POST /api/auth/register
// 2. loginUser     — POST /api/auth/login
// 3. getMe         — GET  /api/auth/me
// ─────────────────────────────────────────────

import asyncHandler from 'express-async-handler'
import User from '../models/User.js'
import generateToken from '../utils/generateToken.js'

// ─────────────────────────────────────────────
// WHY asyncHandler?
//
// Our controllers are async functions (they await
// database calls). If an async function throws an
// error, Express does NOT catch it automatically
// in Express 4.x — the server just hangs.
//
// asyncHandler wraps our function in a try/catch
// and calls next(error) automatically if anything
// throws. This passes the error to our errorHandler
// middleware in errorMiddleware.js.
//
// In Express 5 (not yet mainstream), this is built-in.
// For now, asyncHandler is the industry standard fix.
// ─────────────────────────────────────────────


// ─────────────────────────────────────────────
// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public (no token needed)
// ─────────────────────────────────────────────
const registerUser = asyncHandler(async (req, res) => {
  // Destructure the fields from the request body.
  // req.body is populated by express.json() middleware.
  // When React sends: { name, email, password, role }
  // we extract each field here.
  const { name, email, password, role } = req.body

  // ── Step 1: Validate required fields ─────────
  // Always validate on the backend — never trust
  // the frontend to send complete data. Frontend
  // validation is for UX; backend validation is
  // for security and data integrity.
  if (!name || !email || !password) {
    // Set status 400 (Bad Request) before throwing.
    // Our errorHandler reads res.statusCode to decide
    // what status code to send in the error response.
    res.status(400)
    throw new Error('Please provide name, email, and password')
  }

  // ── Step 2: Check if user already exists ─────
  // MongoDB's unique index on email would also catch
  // duplicates, but it throws a cryptic error (code 11000).
  // This gives a cleaner, user-friendly error message.
  const userExists = await User.findOne({ email: email.toLowerCase() })

  if (userExists) {
    res.status(400)
    throw new Error('An account with this email already exists')
  }

  // ── Step 3: Create the user ───────────────────
  // User.create() is shorthand for:
  //   const user = new User({ name, email, password, role })
  //   await user.save()
  //
  // When .save() is called internally, our pre-save
  // hook fires and hashes the password automatically.
  // We pass the raw password — the hook handles hashing.
  const user = await User.create({
    name,
    email: email.toLowerCase(),
    password,              // raw — hook hashes it
    role: role || 'junior', // default to junior if not provided
  })

  // ── Step 4: Send the response ─────────────────
  // If user creation succeeded, send back:
  // - User details (excluding password — never send this)
  // - A JWT token so they're immediately logged in
  //
  // Status 201 = Created (resource was successfully created)
  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      reputationPoints: user.reputationPoints,
      avatar: user.avatar,
      bio: user.bio,
      createdAt: user.createdAt,
      // Generate and include the JWT token
      token: generateToken(user._id, user.role),
    })
  } else {
    // This branch is rarely hit — it would mean
    // User.create() returned falsy without throwing.
    // Including it for completeness.
    res.status(400)
    throw new Error('Invalid user data — user could not be created')
  }
})


// ─────────────────────────────────────────────
// @desc    Login user and return token
// @route   POST /api/auth/login
// @access  Public
// ─────────────────────────────────────────────
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body

  // ── Step 1: Validate input ────────────────────
  if (!email || !password) {
    res.status(400)
    throw new Error('Please provide email and password')
  }

  // ── Step 2: Find user by email ────────────────
  // CRITICAL: We use .select('+password') here.
  // Remember in the User schema, password has
  // select: false — it's excluded from results
  // by default. We need it here to compare it
  // against the submitted password, so we
  // explicitly include it with '+password'.
  const user = await User.findOne({ email: email.toLowerCase() })
                         .select('+password')

  // ── Step 3: Verify user exists AND password matches
  // We check BOTH conditions together on purpose.
  //
  // SECURITY REASON: If we said "User not found"
  // vs "Wrong password" separately, an attacker
  // could use those different messages to determine
  // which emails are registered in our system
  // (user enumeration attack).
  //
  // By saying "Invalid email or password" for both,
  // we give no information about whether the email
  // exists. This is a standard security practice.
  if (!user || !(await user.matchPassword(password))) {
    res.status(401)
    throw new Error('Invalid email or password')
  }

  // ── Step 4: Send response with token ──────────
  // Status 200 = OK (successful login)
  res.status(200).json({
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    reputationPoints: user.reputationPoints,
    avatar: user.avatar,
    bio: user.bio,
    createdAt: user.createdAt,
    token: generateToken(user._id, user.role),
  })
})


// ─────────────────────────────────────────────
// @desc    Get currently logged-in user's profile
// @route   GET /api/auth/me
// @access  Private (requires valid JWT)
// ─────────────────────────────────────────────
const getMe = asyncHandler(async (req, res) => {
  // req.user is attached by our auth middleware (Step 7).
  // By the time this controller runs, the middleware
  // has already verified the JWT and fetched the user.
  // We just send it back.
  //
  // This endpoint is used by the frontend on page load
  // to check "is the stored token still valid and who
  // is the logged-in user?"
  const user = await User.findById(req.user._id)

  if (!user) {
    res.status(404)
    throw new Error('User not found')
  }

  res.status(200).json({
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    reputationPoints: user.reputationPoints,
    avatar: user.avatar,
    bio: user.bio,
    createdAt: user.createdAt,
  })
})


// Export all three controller functions
export { registerUser, loginUser, getMe }