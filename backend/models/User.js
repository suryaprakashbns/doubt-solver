// ─────────────────────────────────────────────
// models/User.js
//
// The User model defines:
// 1. The SHAPE of user documents in MongoDB
//    (what fields exist, what types they are)
// 2. VALIDATION rules (required, min length, etc.)
// 3. A PRE-SAVE HOOK to hash passwords automatically
// 4. A CUSTOM METHOD to compare passwords on login
//
// WHY A SEPARATE MODEL FILE?
// Every entity in our system (User, Question, Answer)
// gets its own model file. This keeps schema logic
// isolated and makes each model independently testable.
// ─────────────────────────────────────────────

import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

// ─────────────────────────────────────────────
// Define the Schema
//
// A Schema is a blueprint — it tells Mongoose
// exactly what a User document must look like.
// Mongoose will reject documents that don't match.
// ─────────────────────────────────────────────
const userSchema = new mongoose.Schema(
  {
    // ── name field ───────────────────────────
    name: {
      type: String,       // must be a string
      required: [true, 'Please provide your name'],
                          // required: true alone gives a generic error
                          // required: [true, 'message'] gives a custom error
                          // that error message goes into err.message
      trim: true,         // removes leading/trailing whitespace
                          // "  Surya  " becomes "Surya" before saving
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },

    // ── email field ──────────────────────────
    email: {
      type: String,
      required: [true, 'Please provide your email'],
      unique: true,       // MongoDB creates a unique index on this field
                          // Attempting to save a duplicate email throws
                          // a MongoServerError with code 11000
      lowercase: true,    // converts "SURYA@GMAIL.COM" to "surya@gmail.com"
                          // before saving — prevents duplicate accounts
                          // with different capitalizations
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email address',
      ],
      // The regex above validates email format:
      // word characters + optional dots/hyphens + @ + domain + TLD
    },

    // ── password field ───────────────────────
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [6, 'Password must be at least 6 characters'],
      // select: false means this field is EXCLUDED
      // from query results by default.
      // When we do User.findOne({ email }), the
      // password hash is NOT included in the result
      // unless we explicitly add .select('+password')
      // This prevents accidentally leaking password
      // hashes in API responses.
      select: false,
    },

    // ── role field ───────────────────────────
    role: {
      type: String,
      // enum restricts the value to this list only.
      // Any other value throws a validation error.
      enum: {
        values: ['junior', 'senior'],
        message: 'Role must be either junior or senior',
      },
      default: 'junior', // if not provided, default to junior
    },

    // ── avatar field ─────────────────────────
    avatar: {
      type: String,
      // We'll generate a default avatar URL using
      // the user's name initials later.
      // Optional — not required.
      default: '',
    },

    // ── reputation points field ───────────────
    reputationPoints: {
      type: Number,
      default: 0,   // starts at zero, increases when answers are upvoted
      min: 0,       // cannot go below zero
    },

    // ── bio field ─────────────────────────────
    bio: {
      type: String,
      maxlength: [200, 'Bio cannot exceed 200 characters'],
      default: '',
    },
  },

  // ── Schema Options ──────────────────────────
  {
    // timestamps: true automatically adds two fields:
    // createdAt — when the document was first saved
    // updatedAt — when the document was last modified
    // Mongoose manages these automatically — we never
    // set them manually.
    timestamps: true,
  }
)

// ─────────────────────────────────────────────
// PRE-SAVE MIDDLEWARE (Mongoose Hook)
//
// This function runs AUTOMATICALLY before every
// .save() call on a User document.
//
// WHY USE A HOOK INSTEAD OF HASHING IN THE CONTROLLER?
// If we hash in the controller, we'd have to remember
// to hash in EVERY place we save a user. With a hook,
// it happens automatically regardless of where .save()
// is called. It's impossible to accidentally skip.
//
// We use a regular function (not arrow function) because
// 'this' inside a mongoose hook refers to the document
// being saved. Arrow functions don't have their own
// 'this' — they'd inherit from the outer scope and
// 'this' would be undefined.
// ─────────────────────────────────────────────
userSchema.pre('save', async function (next) {
  // this.isModified('password') returns true only if
  // the password field was changed in this save operation.
  //
  // WHY THIS CHECK?
  // Imagine a user updates their bio. We call .save()
  // again. Without this check, the already-hashed
  // password would get hashed AGAIN — making it
  // impossible to ever log in. We only hash when the
  // raw password is newly set or changed.
  if (!this.isModified('password')) {
    // Call next() to proceed to the actual save
    // without doing anything to the password
    return next()
  }

  // Generate a salt and hash the password.
  // bcrypt.hash() does two things in one call:
  // 1. Generates a random salt (unique per hash)
  // 2. Hashes the password combined with that salt
  // The 10 is the salt rounds (cost factor)
  const salt = await bcrypt.genSalt(10)
  this.password = await bcrypt.hash(this.password, salt)

  // Call next() to proceed with saving the document
  
})

// ─────────────────────────────────────────────
// INSTANCE METHOD: matchPassword
//
// An instance method is a function available on
// every User document (instance of the model).
//
// Usage: const isMatch = await user.matchPassword('submitted_password')
//
// WHY ON THE MODEL INSTEAD OF IN THE CONTROLLER?
// Same reason as the hook — keeps password logic
// encapsulated in the User model. The controller
// doesn't need to know HOW passwords are compared,
// just whether they match.
// ─────────────────────────────────────────────
userSchema.methods.matchPassword = async function (enteredPassword) {
  // bcrypt.compare() hashes the enteredPassword
  // using the same salt that's embedded in this.password
  // and compares the results.
  //
  // Returns true if they match, false if they don't.
  //
  // 'this.password' is the stored hash from MongoDB.
  // But wait — we set select: false on the password field!
  // That means this only works if the query explicitly
  // included the password using .select('+password')
  // We'll make sure to do that in the login controller.
  return await bcrypt.compare(enteredPassword, this.password)
}

// ─────────────────────────────────────────────
// Create and export the Model
//
// mongoose.model('User', userSchema) does two things:
// 1. Creates a Model class named 'User'
// 2. Maps it to a MongoDB collection named 'users'
//    (Mongoose automatically lowercases and pluralizes)
//
// 'User' model → 'users' collection in MongoDB
// 'Question' model → 'questions' collection
// 'Answer' model → 'answers' collection
// ─────────────────────────────────────────────
const User = mongoose.model('User', userSchema)

export default User