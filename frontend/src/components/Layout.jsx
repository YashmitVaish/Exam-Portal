import { Outlet, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import './Layout.css'

export default function Layout() {
  const { auth, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="layout">
      <nav className="nav">
        <Link to="/" className="nav-brand">
          Exam<span>Portal</span>
        </Link>
        <div className="nav-right">
          {auth && (
            <>
              <span className="role-badge">{auth.role}</span>
              <button className="btn btn-ghost btn-sm" onClick={handleLogout}>
                Sign out
              </button>
            </>
          )}
        </div>
      </nav>
      <main className="main">
        <Outlet />
      </main>
    </div>
  )
}
