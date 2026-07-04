import { Outlet, Link, useNavigate } from 'react-router-dom'
import useAuth from '../hooks/useAuth.js'
import { useToast } from '../components/ui/Toast.jsx'

const Navbar = () => {
  const { user, isAuth, logout } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    showToast('You have been logged out', 'info')
  }

  return (
    <nav className="border-b border-gray-100 bg-white px-6 py-3 flex items-center justify-between sticky top-0 z-50">

      {/* Logo */}
      <Link to="/" className="flex items-center gap-2">
        <div className="w-7 h-7 bg-purple-600 rounded-lg flex items-center justify-center text-white text-xs font-medium">
          D
        </div>
        <span className="font-medium text-gray-900 text-sm">DoubtSolver</span>
      </Link>

      {/* Nav links */}
      <div className="hidden md:flex items-center gap-1">
        <Link
          to="/"
          className="text-sm text-gray-500 hover:text-gray-900 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Home
        </Link>
        <Link
          to="/?sort=unanswered"
          className="text-sm text-gray-500 hover:text-gray-900 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Unanswered
        </Link>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2">
        {isAuth ? (
          <>
            {/* Ask question button */}
            <Link
              to="/ask"
              className="text-sm bg-purple-600 text-white px-4 py-1.5 rounded-lg hover:bg-purple-700 transition-colors font-medium"
            >
              + Ask question
            </Link>

            {/* User menu */}
            <div className="flex items-center gap-2 ml-1">
              <Link
                to={`/profile/${user._id}`}
                className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {/* Avatar circle with initials */}
                <div className="w-7 h-7 bg-purple-100 rounded-full flex items-center justify-center text-purple-700 text-xs font-medium">
                  {user.name
                    .split(' ')
                    .map(n => n[0])
                    .join('')
                    .toUpperCase()
                    .slice(0, 2)
                  }
                </div>
                <span className="text-sm text-gray-700 font-medium hidden md:block">
                  {user.name.split(' ')[0]}
                </span>
              </Link>

              <button
                onClick={handleLogout}
                className="text-xs text-gray-400 hover:text-gray-600 px-2 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Logout
              </button>
            </div>
          </>
        ) : (
          <>
            <Link
              to="/login"
              className="text-sm text-gray-600 hover:text-gray-900 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Log in
            </Link>
            <Link
              to="/register"
              className="text-sm bg-purple-600 text-white px-4 py-1.5 rounded-lg hover:bg-purple-700 transition-colors font-medium"
            >
              Sign up
            </Link>
          </>
        )}
      </div>
    </nav>
  )
}

const MainLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main>
        <Outlet />
      </main>
    </div>
  )
}

export default MainLayout




