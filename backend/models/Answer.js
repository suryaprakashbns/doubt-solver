// ─────────────────────────────────────────────
// models/Answer.js
//
// SCHEMA DESIGN DECISIONS:
//
// 1. Every Answer references its parent Question.
//    This enables:
//    - Finding all answers for a question:
//      Answer.find({ question: questionId })
//    - Deleting all answers when a question
//      is deleted: Answer.deleteMany({ question: id })
//
// 2. isAccepted and votes follow the same pattern
//    as Question — array for votes (prevents
//    duplicates), boolean for accepted state.
//
// 3. We don't embed answers inside Question
//    documents because answers can be long and
//    numerous. Separate collection = no size limits.
// ─────────────────────────────────────────────

import mongoose from 'mongoose'

const answerSchema = new mongoose.Schema(
  {
    // ── body ───────────────────────────────────
    // The full answer text.
    // In Phase 3 this will support Markdown.
    body: {
      type: String,
      required: [true, 'Answer body is required'],
      trim: true,
      minlength: [20, 'Answer must be at least 20 characters'],
    },

    // ── author ─────────────────────────────────
    // The user who wrote this answer.
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Answer must have an author'],
    },

    // ── question ───────────────────────────────
    // The question this answer belongs to.
    // This is the "back-reference" that lets us
    // find all answers for a given question, and
    // clean up answers when a question is deleted.
    question: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Question',
      required: [true, 'Answer must belong to a question'],
    },

    // ── votes ──────────────────────────────────
    // Array of user ObjectIds who upvoted.
    // Same pattern as Question.votes —
    // array instead of count prevents duplicate
    // votes and enables toggle behavior.
    votes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],

    // ── isAccepted ─────────────────────────────
    // True when the question author marks this
    // answer as the accepted/best answer.
    // Only one answer per question can be accepted.
    // When this is set to true, we also:
    // 1. Set question.acceptedAnswer = this._id
    // 2. Set question.isResolved = true
    // 3. Award reputation points to the answer author
    isAccepted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON:   { virtuals: true },
    toObject: { virtuals: true },
  }
)

// ─────────────────────────────────────────────
// INDEXES
// ─────────────────────────────────────────────

// Most common query: "get all answers for question X"
// This index makes it instant regardless of
// how many answers exist in the collection.
answerSchema.index({ question: 1 })

// "Get all answers by this user" for profile page
answerSchema.index({ author: 1 })

// Sort answers by vote count (most helpful first)
answerSchema.index({ createdAt: -1 })

// ─────────────────────────────────────────────
// VIRTUAL: voteCount
// ─────────────────────────────────────────────
answerSchema.virtual('voteCount').get(function () {
  return this.votes.length
})

const Answer = mongoose.model('Answer', answerSchema)

export default Answer