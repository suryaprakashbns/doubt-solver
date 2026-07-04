// ─────────────────────────────────────────────
// components/common/ProtectedRoute.jsx
//
// A wrapper component that protects routes
// requiring authentication.
//
// HOW IT WORKS:
// In App.jsx we wrap protected routes like:
//   <Route path="/ask" element={
//     <ProtectedRoute>
//       <AskQuestionPage />
//     </ProtectedRoute>
//   } />
//
// When someone visits /ask:
// 1. ProtectedRoute checks if user is logged in
// 2. If yes → render AskQuestionPage normally
// 3. If no  → redirect to /login
//
// The `replace` prop on Navigate means the /ask
// URL is REPLACED in browser history (not pushed).
// So after logging in, the back button doesn't
// take them back to the broken protected page.
//
// state={{ from: location }} passes the current
// URL to the login page, so after logging in
// the app can redirect back to where they were.
// ─────────────────────────────────────────────
                                                
import { Navigate, useLocation } from 'react-router-dom'
import useAuth from '../../hooks/useAuth.js'

const ProtectedRoute = ({ children }) => {
  const { isAuth } = useAuth()

  // useLocation gives us the current URL info.
  // We pass it to the login page via state so
  // after login the user returns to their intended page.
  const location = useLocation()

  if (!isAuth) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location }}
      />
    )
  }

  // User is authenticated — render the protected content
  return children
}

export default ProtectedRoute