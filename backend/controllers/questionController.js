// ─────────────────────────────────────────────
// controllers/questionController.js
//
// Five controller functions:
// createQuestion   — POST /api/questions
// getQuestions     — GET  /api/questions
// getQuestionById  — GET  /api/questions/:id
// updateQuestion   — PUT  /api/questions/:id
// deleteQuestion   — DELETE /api/questions/:id
// ─────────────────────────────────────────────

import asyncHandler from 'express-async-handler'
import Question from '../models/Question.js'
import Answer from '../models/Answer.js'
// ─────────────────────────────────────────────
// @desc    Create a new question
// @route   POST /api/questions
// @access  Private (any logged-in user)
// ─────────────────────────────────────────────
const createQuestion = asyncHandler(async (req, res) => {
  const { title, body, tags } = req.body

  // ── Validate required fields ────────────────
  if (!title || !body || !tags) {
    res.status(400)
    throw new Error('Title, body, and tags are required')
  }

  // tags can arrive as a comma-separated string
  // "react, hooks, javascript"
  // OR as a proper array ["react", "hooks"]
  // We normalize to array either way.
  const tagsArray = Array.isArray(tags)
    ? tags
    : tags.split(',').map(t => t.trim()).filter(Boolean)

  if (tagsArray.length === 0) {
    res.status(400)
    throw new Error('At least one tag is required')
  }

  // ── Create the question ─────────────────────
  // req.user is attached by protect middleware.
  // We use req.user._id as the author.
  const question = await Question.create({
    title,
    body,
    tags: tagsArray,
    author: req.user._id,
  })

  // ── Populate author details for the response ─
  // After creating, we populate the author field
  // so the response includes the user's name and role
  // instead of just their ObjectId.
  // This is what the frontend uses to display
  // "Asked by Surya Prakash" on the question card.
  await question.populate('author', 'name role avatar reputationPoints')

  res.status(201).json(question)
})


// ─────────────────────────────────────────────
// @desc    Get all questions with search, filter, sort, pagination
// @route   GET /api/questions
// @access  Public
//
// Query parameters supported:
//   ?search=useEffect       full-text search
//   ?tag=react              filter by tag
//   ?sort=newest            sort: newest | oldest | votes | views
//   ?page=1                 pagination: page number
//   ?limit=10               pagination: results per page
// ─────────────────────────────────────────────
const getQuestions = asyncHandler(async (req, res) => {
  // ── Extract query parameters ────────────────
  // These come from the URL: /api/questions?search=react&page=2
  // req.query is populated by Express automatically.
   console.log("=== getQuestions called ===");
   console.log(req.query);

  const {
    search,
    tag,
    sort = 'newest',   // default sort is newest first
    page = 1,          // default page is 1
    limit = 10,        // default 10 per page
  } = req.query

  // ── Build the filter object ─────────────────
  // We start with an empty filter and add
  // conditions only if the query param exists.
  // This lets us compose complex queries cleanly.
  const filter = {}

  // Full-text search using MongoDB's $text operator.
  // This uses the text index we created on
  // title, body, and tags fields.
  // Only adds the search condition if ?search= is provided.
  if (search && search.trim()) {
    filter.$text = { $search: search.trim() }
  }

  // Tag filtering: find questions where the tags
  // array contains this specific tag string.
  // $in operator: field value is IN this array.
  // We wrap tag in an array for $in compatibility.
  if (tag && tag.trim()) {
    filter.tags = { $in: [tag.toLowerCase().trim()] }
  }

  // ── Build the sort object ───────────────────
  // MongoDB's sort() takes an object like:
  // { createdAt: -1 } = newest first
  // { createdAt: 1  } = oldest first
  // { votes: -1     } = most votes first (we sort by array length)
  // { views: -1     } = most views first
  const sortOptions = {
    newest:    { createdAt: -1 },
    oldest:    { createdAt: 1  },
    votes:     { voteCount: -1 },
    views:     { views: -1     },
    unanswered:{ createdAt: -1 },
  }

  // Additional filter for "unanswered" tab —
  // questions where answers array is empty
  if (sort === 'unanswered') {
    filter.answers = { $size: 0 }
  }

  const sortBy = sortOptions[sort] || sortOptions.newest

  // ── Pagination math ─────────────────────────
  // Page 1: skip 0,  take 10
  // Page 2: skip 10, take 10
  // Page 3: skip 20, take 10
  // Formula: skip = (page - 1) * limit
  const pageNum   = Math.max(1, parseInt(page))   // minimum page is 1
  const limitNum  = Math.min(50, parseInt(limit))  // maximum 50 per page
  const skipCount = (pageNum - 1) * limitNum

  // ── Execute the query ───────────────────────
  // We run two queries in parallel using Promise.all:
  // 1. The actual data query (with pagination)
  // 2. A count query (for total pages calculation)
  //
  // Promise.all runs both simultaneously —
  // faster than running them sequentially.
  const [questions, totalCount] = await Promise.all([
    Question.find(filter)
      .populate('author', 'name role avatar reputationPoints')
      // populate answers only to get the count
      // we don't need full answer data in the feed
      .populate('answers', '_id')
      .sort(sortBy)
      .skip(skipCount)
      .limit(limitNum)
      // lean() returns plain JS objects instead of
      // Mongoose documents. Faster when we don't need
      // Mongoose methods on the results.
      // We skip lean() here because we need virtuals.
      ,
    Question.countDocuments(filter),
  ])

  // ── Send paginated response ─────────────────
  res.status(200).json({
    questions,
    pagination: {
      currentPage:  pageNum,
      totalPages:   Math.ceil(totalCount / limitNum),
      totalQuestions: totalCount,
      hasNextPage:  pageNum < Math.ceil(totalCount / limitNum),
      hasPrevPage:  pageNum > 1,
    },
  })
})


// ─────────────────────────────────────────────
// @desc    Get a single question by ID
// @route   GET /api/questions/:id
// @access  Public
// ─────────────────────────────────────────────
const getQuestionById = asyncHandler(async (req, res) => {
  // req.params.id is the :id part of the URL.
  // GET /api/questions/64f1a2b3c4d5e6f7a8b9c0d1
  // req.params.id = "64f1a2b3c4d5e6f7a8b9c0d1"
  const question = await Question.findById(req.params.id)
    .populate('author', 'name role avatar reputationPoints bio')
    .populate({
      path: 'answers',
      populate: {
        // Nested populate: populate the author
        // field inside each Answer document
        path: 'author',
        select: 'name role avatar reputationPoints',
      },
    })

  if (!question) {
    res.status(404)
    throw new Error('Question not found')
  }

  // ── Increment view count ────────────────────
  // Every time the detail page is loaded, we
  // increment views by 1.
  //
  // $inc is MongoDB's increment operator —
  // it's atomic (thread-safe) and avoids the
  // read-modify-write race condition of:
  //   question.views = question.views + 1
  //   await question.save()
  // which could lose increments under concurrent requests.
  await Question.findByIdAndUpdate(
    req.params.id,
    { $inc: { views: 1 } },
    { new: false } // we don't need the updated doc back
  )

  res.status(200).json(question)
})


// ─────────────────────────────────────────────
// @desc    Update a question
// @route   PUT /api/questions/:id
// @access  Private (owner only)
// ─────────────────────────────────────────────
const updateQuestion = asyncHandler(async (req, res) => {
  const question = await Question.findById(req.params.id)

  if (!question) {
    res.status(404)
    throw new Error('Question not found')
  }

  // ── Authorization check ─────────────────────
  // Only the question author can edit their question.
  //
  // question.author is a MongoDB ObjectId.
  // req.user._id is also a MongoDB ObjectId.
  // Direct === comparison doesn't work for objects,
  // so we use .toString() to compare as strings.
  if (question.author.toString() !== req.user._id.toString()) {
    res.status(403)
    throw new Error('You are not authorized to edit this question')
  }

  // ── Apply updates ───────────────────────────
  // Only update fields that were actually sent.
  // This way a partial update (just changing title)
  // doesn't accidentally wipe other fields.
  const { title, body, tags } = req.body

  if (title) question.title = title
  if (body)  question.body  = body
  if (tags) {
    const tagsArray = Array.isArray(tags)
      ? tags
      : tags.split(',').map(t => t.trim()).filter(Boolean)
    question.tags = tagsArray
  }

  // .save() triggers the pre-save hook and
  // updates the updatedAt timestamp automatically
  const updatedQuestion = await question.save()
  await updatedQuestion.populate('author', 'name role avatar reputationPoints')

  res.status(200).json(updatedQuestion)
})


// ─────────────────────────────────────────────
// @desc    Delete a question
// @route   DELETE /api/questions/:id
// @access  Private (owner only)
// ─────────────────────────────────────────────


// ─────────────────────────────────────────────
// @desc    Vote on a question (toggle upvote)
// @route   PUT /api/questions/:id/vote
// @access  Private
// ─────────────────────────────────────────────
const voteQuestion = asyncHandler(async (req, res) => {
  const question = await Question.findById(req.params.id)

  if (!question) {
    res.status(404)
    throw new Error('Question not found')
  }

  // Prevent voting on your own question
  if (question.author.toString() === req.user._id.toString()) {
    res.status(400)
    throw new Error('You cannot vote on your own question')
  }

  // Check if the user has already voted
  // .some() returns true if ANY element passes the test
  const alreadyVoted = question.votes.some(
    voterId => voterId.toString() === req.user._id.toString()
  )

  if (alreadyVoted) {
    // Toggle OFF: remove this user's vote
    // $pull removes a specific value from an array
    await Question.findByIdAndUpdate(
      req.params.id,
      { $pull: { votes: req.user._id } }
    )
  } else {
    // Toggle ON: add this user's vote
    // $addToSet adds to array only if not already present
    // (extra safety — prevents duplicate votes)
    await Question.findByIdAndUpdate(
      req.params.id,
      { $addToSet: { votes: req.user._id } }
    )
  }

  // Fetch fresh updated question to return
  const updatedQuestion = await Question.findById(req.params.id)
    .populate('author', 'name role avatar reputationPoints')

  res.status(200).json({
    voteCount: updatedQuestion.votes.length,
    hasVoted: !alreadyVoted,
    question: updatedQuestion,
  })
})





// Update the deleteQuestion function:
const deleteQuestion = asyncHandler(async (req, res) => {
  const question = await Question.findById(req.params.id)

  if (!question) {
    res.status(404)
    throw new Error('Question not found')
  }

  if (question.author.toString() !== req.user._id.toString()) {
    res.status(403)
    throw new Error('You are not authorized to delete this question')
  }

  // ── Delete all answers for this question ─────
  // This prevents orphaned Answer documents in
  // MongoDB that reference a deleted Question.
  // Always clean up related documents on delete.
  await Answer.deleteMany({ question: req.params.id })

  // ── Then delete the question itself ──────────
  await Question.findByIdAndDelete(req.params.id)

  res.status(200).json({
    message: 'Question and all its answers deleted successfully',
    id: req.params.id,
  })
})

export {
  createQuestion,
  getQuestions,
  getQuestionById,
  updateQuestion,
  deleteQuestion,
  voteQuestion,
}