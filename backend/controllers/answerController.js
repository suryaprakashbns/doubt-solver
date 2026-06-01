// ─────────────────────────────────────────────
// controllers/answerController.js
//
// Five controller functions:
// createAnswer  — POST /api/answers
// updateAnswer  — PUT  /api/answers/:id
// deleteAnswer  — DELETE /api/answers/:id
// voteAnswer    — PUT  /api/answers/:id/vote
// acceptAnswer  — PUT  /api/answers/:id/accept
// ─────────────────────────────────────────────

import asyncHandler from 'express-async-handler'
import Answer from '../models/Answer.js'
import Question from '../models/Question.js'
import User from '../models/User.js'

// ─────────────────────────────────────────────
// REPUTATION POINT VALUES
//
// Centralizing these constants means if we
// ever change the point system, we change it
// in one place only — not scattered throughout
// the controller.
// ─────────────────────────────────────────────
const REPUTATION = {
  ANSWER_ACCEPTED:    15,   // answerer earns when answer is accepted
  ANSWER_UPVOTED:      5,   // answerer earns per upvote on their answer
  ANSWER_DOWNVOTED:   -2,   // answerer loses when vote is removed
  QUESTION_UPVOTED:    2,   // asker earns when their question is upvoted
}


// ─────────────────────────────────────────────
// @desc    Post an answer to a question
// @route   POST /api/answers
// @access  Private
// ─────────────────────────────────────────────
const createAnswer = asyncHandler(async (req, res) => {
  const { body, questionId } = req.body

  // ── Validate inputs ─────────────────────────
  if (!body || !questionId) {
    res.status(400)
    throw new Error('Answer body and questionId are required')
  }

  // ── Verify the question exists ───────────────
  const question = await Question.findById(questionId)
  if (!question) {
    res.status(404)
    throw new Error('Question not found')
  }

  // ── Prevent answering your own question ──────
  // This is a UX decision, not a security one.
  // Self-answering is allowed on StackOverflow
  // but for our college platform it makes more
  // sense to prevent it — juniors shouldn't be
  // answering their own doubts.
  if (question.author.toString() === req.user._id.toString()) {
    res.status(400)
    throw new Error('You cannot answer your own question')
  }

  // ── Prevent duplicate answers ────────────────
  // Check if this user already answered this question.
  const existingAnswer = await Answer.findOne({
    question: questionId,
    author: req.user._id,
  })

  if (existingAnswer) {
    res.status(400)
    throw new Error(
      'You have already answered this question. Edit your existing answer instead.'
    )
  }

  // ── Create the answer ────────────────────────
  const answer = await Answer.create({
    body,
    author: req.user._id,
    question: questionId,
  })

  // ── Update the parent question ───────────────
  // Add this answer's ID to the question's
  // answers array. $push appends to an array.
  //
  // WHY NOT answer.save() + question.save()?
  // If we do them separately and one fails,
  // we'd have inconsistent data. Using
  // findByIdAndUpdate for the question is
  // slightly safer here.
  await Question.findByIdAndUpdate(
    questionId,
    { $push: { answers: answer._id } }
  )

  // ── Populate author for the response ─────────
  await answer.populate('author', 'name role avatar reputationPoints')

  res.status(201).json(answer)
})


// ─────────────────────────────────────────────
// @desc    Update an answer
// @route   PUT /api/answers/:id
// @access  Private (owner only)
// ─────────────────────────────────────────────
const updateAnswer = asyncHandler(async (req, res) => {
  const answer = await Answer.findById(req.params.id)

  if (!answer) {
    res.status(404)
    throw new Error('Answer not found')
  }

  // ── Authorization: only the author can edit ──
  if (answer.author.toString() !== req.user._id.toString()) {
    res.status(403)
    throw new Error('You are not authorized to edit this answer')
  }

  const { body } = req.body

  if (!body || body.trim().length < 20) {
    res.status(400)
    throw new Error('Answer must be at least 20 characters')
  }

  answer.body = body.trim()
  const updatedAnswer = await answer.save()
  await updatedAnswer.populate('author', 'name role avatar reputationPoints')

  res.status(200).json(updatedAnswer)
})


// ─────────────────────────────────────────────
// @desc    Delete an answer
// @route   DELETE /api/answers/:id
// @access  Private (owner only)
// ─────────────────────────────────────────────
const deleteAnswer = asyncHandler(async (req, res) => {
  const answer = await Answer.findById(req.params.id)

  if (!answer) {
    res.status(404)
    throw new Error('Answer not found')
  }

  // ── Authorization check ──────────────────────
  if (answer.author.toString() !== req.user._id.toString()) {
    res.status(403)
    throw new Error('You are not authorized to delete this answer')
  }

  // ── If this was the accepted answer, ─────────
  // unmark the question as resolved
  if (answer.isAccepted) {
    await Question.findByIdAndUpdate(answer.question, {
      isResolved:     false,
      acceptedAnswer: null,
    })
  }

  // ── Remove answer ID from the question's ─────
  // answers array. $pull removes matching elements.
  await Question.findByIdAndUpdate(
    answer.question,
    { $pull: { answers: answer._id } }
  )

  // ── Delete the answer document ───────────────
  await Answer.findByIdAndDelete(req.params.id)

  res.status(200).json({
    message: 'Answer deleted successfully',
    id: req.params.id,
  })
})


// ─────────────────────────────────────────────
// @desc    Vote on an answer (toggle upvote)
// @route   PUT /api/answers/:id/vote
// @access  Private
// ─────────────────────────────────────────────
const voteAnswer = asyncHandler(async (req, res) => {
  const answer = await Answer.findById(req.params.id)

  if (!answer) {
    res.status(404)
    throw new Error('Answer not found')
  }

  // ── Cannot vote on your own answer ───────────
  if (answer.author.toString() === req.user._id.toString()) {
    res.status(400)
    throw new Error('You cannot vote on your own answer')
  }

  const alreadyVoted = answer.votes.some(
    voterId => voterId.toString() === req.user._id.toString()
  )

  if (alreadyVoted) {
    // ── Remove vote ──────────────────────────
    await Answer.findByIdAndUpdate(
      req.params.id,
      { $pull: { votes: req.user._id } }
    )

    // ── Deduct reputation from answer author ─
    // REPUTATION.ANSWER_DOWNVOTED is -2
    await User.findByIdAndUpdate(
      answer.author,
      { $inc: { reputationPoints: REPUTATION.ANSWER_DOWNVOTED } }
    )
  } else {
    // ── Add vote ─────────────────────────────
    await Answer.findByIdAndUpdate(
      req.params.id,
      { $addToSet: { votes: req.user._id } }
    )

    // ── Award reputation to answer author ────
    await User.findByIdAndUpdate(
      answer.author,
      { $inc: { reputationPoints: REPUTATION.ANSWER_UPVOTED } }
    )
  }

  // Fetch fresh data to return
  const updatedAnswer = await Answer.findById(req.params.id)
    .populate('author', 'name role avatar reputationPoints')

  res.status(200).json({
    voteCount: updatedAnswer.votes.length,
    hasVoted:  !alreadyVoted,
    answer:    updatedAnswer,
  })
})


// ─────────────────────────────────────────────
// @desc    Accept an answer as the best answer
// @route   PUT /api/answers/:id/accept
// @access  Private (question owner only)
//
// FLOW:
// 1. Verify the answer exists
// 2. Verify the requester owns the question
// 3. If another answer was previously accepted,
//    unaccept it first (only one at a time)
// 4. Mark this answer as accepted
// 5. Update the question's acceptedAnswer + isResolved
// 6. Award reputation to the answer author
// ─────────────────────────────────────────────
const acceptAnswer = asyncHandler(async (req, res) => {
  // ── Fetch the answer ─────────────────────────
  const answer = await Answer.findById(req.params.id)

  if (!answer) {
    res.status(404)
    throw new Error('Answer not found')
  }

  // ── Fetch the parent question ────────────────
  const question = await Question.findById(answer.question)

  if (!question) {
    res.status(404)
    throw new Error('Parent question not found')
  }

  // ── Only the question author can accept ──────
  if (question.author.toString() !== req.user._id.toString()) {
    res.status(403)
    throw new Error('Only the question author can accept an answer')
  }

  // ── Toggle logic ─────────────────────────────
  // If this answer is already accepted, clicking
  // accept again should UN-accept it.
  const isCurrentlyAccepted = answer.isAccepted

  if (isCurrentlyAccepted) {
    // ── Un-accept this answer ─────────────────
    answer.isAccepted = false
    await answer.save()

    await Question.findByIdAndUpdate(answer.question, {
      isResolved:     false,
      acceptedAnswer: null,
    })

    // ── Remove reputation from answer author ──
    await User.findByIdAndUpdate(
      answer.author,
      { $inc: { reputationPoints: -REPUTATION.ANSWER_ACCEPTED } }
    )

    return res.status(200).json({
      message: 'Answer un-accepted',
      answer,
    })
  }

  // ── If another answer was previously accepted,
  // unmark it first. Only one accepted answer
  // per question is allowed.
  if (question.acceptedAnswer) {
    await Answer.findByIdAndUpdate(
      question.acceptedAnswer,
      { isAccepted: false }
    )

    // Remove reputation from the previously
    // accepted answer's author
    const prevAnswer = await Answer.findById(question.acceptedAnswer)
    if (prevAnswer) {
      await User.findByIdAndUpdate(
        prevAnswer.author,
        { $inc: { reputationPoints: -REPUTATION.ANSWER_ACCEPTED } }
      )
    }
  }

  // ── Mark this answer as accepted ─────────────
  answer.isAccepted = true
  await answer.save()

  // ── Update the question ───────────────────────
  await Question.findByIdAndUpdate(answer.question, {
    isResolved:     true,
    acceptedAnswer: answer._id,
  })

  // ── Award reputation to the answer author ────
  // $inc with a positive number adds to the field.
  // This is atomic — safe under concurrent requests.
  await User.findByIdAndUpdate(
    answer.author,
    { $inc: { reputationPoints: REPUTATION.ANSWER_ACCEPTED } }
  )

  // ── Populate and return ───────────────────────
  await answer.populate('author', 'name role avatar reputationPoints')

  res.status(200).json({
    message: 'Answer accepted successfully',
    answer,
  })
})


export {
  createAnswer,
  updateAnswer,
  deleteAnswer,
  voteAnswer,
  acceptAnswer,
}