// ─────────────────────────────────────────────
// utils/generateToken.js
//
// A single utility function that creates a JWT.
// We isolate this in utils/ because:
// 1. Both the register and login controllers need it
// 2. If we ever change token logic (add fields,
//    change expiry), we change it in ONE place
// 3. Clean separation — controllers don't need to
//    know the details of token creation
// ─────────────────────────────────────────────

import jwt from 'jsonwebtoken'

// ─────────────────────────────────────────────
// generateToken
//
// Parameters:
//   userId — the MongoDB _id of the user
//   role   — 'junior' or 'senior'
//
// Returns:
//   A signed JWT string
// ─────────────────────────────────────────────
const generateToken = (userId, role) => {
  // jwt.sign() creates a new JWT
  //
  // Parameter 1 — PAYLOAD:
  // The data embedded inside the token
  // We include userId so middleware can identify
  // the user, and role so we can do authorization.
  // Keep payloads small — the token travels in
  // every request header.
  //
  // Parameter 2 — SECRET:
  // The key used to sign the token. Anyone with
  // this secret can create valid tokens, so it
  // must stay in .env and never be committed to Git.
  //
  // Parameter 3 — OPTIONS:
  // expiresIn: '30d' means the token expires in
  // 30 days. After that, the server rejects it
  // and the user must log in again.
  // Common values: '1h', '7d', '30d', '1y'
  return jwt.sign(
    { userId, role },
    process.env.JWT_SECRET,
    { expiresIn: '30d' }
  )
}

export default generateToken