// ─────────────────────────────────────────────
// layouts/MainLayout.jsx
//
// The shell that wraps every page.
// Contains the Navbar at the top and renders
// the page content below it via <Outlet />.
//
// WHY A LAYOUT COMPONENT?
// Every page needs a Navbar. Without a layout,
// every page component would import and render
// Navbar individually — repetitive. With a layout,
// the Navbar lives here once and every nested
// route automatically gets it.
//
// React Router's <Outlet /> renders whatever
// child route matched. Think of it as a
// "content slot" in the layout template.
// ─────────────────────────────────────────────

import { Outlet } from 'react-router-dom'

// Navbar component will be built in Step 13.
// Using a placeholder for now.
const Navbar = () => (
  <nav className="border-b border-gray-100 bg-white px-6 py-3 flex items-center justify-between sticky top-0 z-50">
    <a href="/" className="font-medium text-gray-900">DoubtSolver</a>
    <div className="flex gap-3">
      <a href="/login" className="text-sm text-gray-500 hover:text-gray-900">Login</a>
      <a href="/register" className="text-sm bg-purple-600 text-white px-3 py-1 rounded-md hover:bg-purple-700">Sign up</a>
    </div>
  </nav>
)

const MainLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      {/* Outlet renders the matched child route */}
      <main>
        <Outlet />
      </main>
    </div>
  )
}

export default MainLayout