// ─────────────────────────────────────────────
// App.jsx
//
// The root component of the entire React app.
// React Router lives here — it maps URL paths
// to page components.
//
// HOW REACT ROUTER WORKS:
// <Routes> looks at the current URL.
// It finds the first <Route> whose path matches.
// It renders that route's element.
//
// Nested routes: a Route inside another Route
// shares the parent's layout. The parent renders
// <Outlet /> where child content appears.
//
// path="*" is a wildcard — matches any URL that
// nothing else matched. Used for 404 pages.
// ─────────────────────────────────────────────

import { Routes, Route } from 'react-router-dom'

// Layouts
import MainLayout from './layouts/MainLayout.jsx'

// Pages
import HomePage            from './pages/HomePage.jsx'
import LoginPage           from './pages/LoginPage.jsx'
import RegisterPage        from './pages/RegisterPage.jsx'
import QuestionDetailPage  from './pages/QuestionDetailPage.jsx'
import AskQuestionPage     from './pages/AskQuestionPage.jsx'
import ProfilePage         from './pages/ProfilePage.jsx'
import NotFoundPage        from './pages/NotFoundPage.jsx'

// Auth guard
import ProtectedRoute from './components/common/ProtectedRoute.jsx'

const App = () => {
  return (
    <Routes>
      {
      /* ── Routes using MainLayout ─────────────
          All routes nested inside this Route share
          the MainLayout (Navbar + page wrapper).
          The index prop means this route matches
          the parent path exactly ("/"). ──────── */
      }
      <Route element={<MainLayout />}>

        {/* Public routes — anyone can visit */}
        <Route index element={<HomePage />} />
        <Route path="/questions/:id" element={<QuestionDetailPage />} />

        {/* Auth routes — redirect to home if already logged in */}
        <Route path="/login"    element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected routes — redirect to login if not logged in */}
        <Route
          path="/ask"
          element={
            <ProtectedRoute>
              <AskQuestionPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile/:id"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />

      </Route>

      {/* 404 — no layout, full screen */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

export default App