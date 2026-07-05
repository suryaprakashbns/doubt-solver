// ─────────────────────────────────────────────
// models/Question.js
//
// Defines the shape of a Question document
// in MongoDB. Every question posted on the
// platform will be stored using this schema.
//
// SCHEMA DESIGN DECISIONS (interview-worthy):
//
// 1. We store userId as a reference (ObjectId)
//    not as embedded user data. Why? Because if
//    the user changes their name, we don't want
//    to update every question they ever posted.
//    References stay accurate automatically.
//
// 2. We store answers as a reference array
//    (array of ObjectIds pointing to Answer docs)
//    not embedded. Why? Answers can be long and
//    numerous. Embedding them would bloat the
//    Question document and hit MongoDB's 16MB
//    document size limit for popular questions.
//
// 3. Tags are stored as an array of strings,
//    not as a separate Tags collection. Why?
//    Tags are simple strings with no extra data.
//    A separate collection would add a JOIN-like
//    operation (populate) with no real benefit.
//    Simple data = simple storage.
// ─────────────────────────────────────────────

import mongoose from 'mongoose'

const questionSchema = new mongoose.Schema(
  {
    // ── title ──────────────────────────────────
    // The short summary of the question.
    // This appears in the question feed cards.
    title: {
      type: String,
      required: [true, 'Question title is required'],
      trim: true,
      minlength: [10, 'Title must be at least 10 characters'],
      maxlength: [150, 'Title cannot exceed 150 characters'],
    },

    // ── body ───────────────────────────────────
    // The full question text. In Phase 3 this
    // will support Markdown. For now plain text.
    body: {
      type: String,
      required: [true, 'Question body is required'],
      trim: true,
      minlength: [20, 'Body must be at least 20 characters'],
    },

    // ── author ─────────────────────────────────
    // Reference to the User who posted this.
    // type: mongoose.Schema.Types.ObjectId tells
    // Mongoose this field stores a MongoDB ObjectId.
    // ref: 'User' tells .populate() which model
    // to look up when we want the full user object.
    //
    // When we query: Question.find().populate('author')
    // Mongoose replaces the ObjectId with the full
    // User document automatically — like a JOIN.
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Question must have an author'],
    },

    // ── tags ───────────────────────────────────
    // Array of lowercase strings like ['react', 'hooks']
    // Used for filtering and discovery.
    // We validate min/max length on each individual tag.
    tags: {
      type: [String],
      validate: {
        validator: function (tagsArray) {
          // Must have between 1 and 5 tags
          return tagsArray.length >= 1 && tagsArray.length <= 5
        },
        message: 'A question must have between 1 and 5 tags',
      },
      // Transform each tag: lowercase and trim whitespace
      // This runs before validation
      set: function (tagsArray) {
        return tagsArray.map(tag => tag.toLowerCase().trim())
      },
    },

    // ── answers ────────────────────────────────
    // Array of ObjectIds referencing Answer documents.
    // When a new answer is posted, we push its _id here.
    // This lets us efficiently count answers and
    // populate them when needed.
 answers: {
  type: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Answer',
  }],
  default: [],
},

    // ── views ──────────────────────────────────
    // Incremented each time the question detail
    // page is loaded. Shows question popularity.
    views: {
      type: Number,
      default: 0,
      min: 0,
    },

    // ── votes ──────────────────────────────────
    // Array of user IDs who upvoted this question.
    // We store the full list (not just a count) so:
    // 1. We can prevent the same user voting twice
    // 2. We can show the user if they already voted
    // The count is always votes.length
   votes: {
  type: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  default: [],
},

    // ── isResolved ─────────────────────────────
    // True when the question author marks an
    // answer as accepted. Drives the green
    // "answered" badge in the feed.
    isResolved: {
      type: Boolean,
      default: false,
    },

    // ── acceptedAnswer ─────────────────────────
    // Reference to the specific Answer document
    // that was marked as accepted. null by default.
    acceptedAnswer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Answer',
      default: null,
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt

    // toJSON and toObject with virtuals: true
    // means virtual properties (computed fields
    // that aren't stored in MongoDB) are included
    // when we convert the document to JSON for
    // our API response.
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
)

// ─────────────────────────────────────────────
// INDEXES
//
// Indexes make queries fast. Without an index,
// MongoDB scans every document to find matches
// (like reading every page of a book to find a word).
// With an index, it jumps directly to matches
// (like using the book's index).
//
// We index the fields we'll query most often.
// ─────────────────────────────────────────────

// Text index for full-text search across title and body.
// This enables: Question.find({ $text: { $search: 'useEffect' } })
// MongoDB scores results by relevance automatically.
questionSchema.index({ title: 'text', body: 'text', tags: 'text' })

// Index on author for fast "questions by this user" queries
questionSchema.index({ author: 1 })

// Index on tags for fast tag-based filtering
questionSchema.index({ tags: 1 })

// Compound index on createdAt and votes for sorting
// The -1 means descending (newest/most voted first)
questionSchema.index({ createdAt: -1 })
questionSchema.index({ 'votes': -1 })

// ─────────────────────────────────────────────
// VIRTUAL PROPERTY: voteCount
//
// A virtual is a computed property that isn't
// stored in the database but is calculated on
// the fly when the document is accessed.
//
// Instead of storing votes as a number AND an
// array (which could get out of sync), we store
// only the array and compute the count virtually.
// ─────────────────────────────────────────────
questionSchema.virtual('voteCount').get(function () {
  return this.votes?.length ?? 0
})

questionSchema.virtual('answerCount').get(function () {
  return this.answers?.length ?? 0
})

const Question = mongoose.model('Question', questionSchema)

export default Question