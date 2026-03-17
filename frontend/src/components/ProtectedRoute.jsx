import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

/**
 * Wraps a route to require authentication and optionally a specific role.
 * @param {{ role?: 'teacher' | 'student', children: React.ReactNode }} props
 */
export default function ProtectedRoute({ role, children }) {
  const { auth } = useAuth()

  if (!auth) return <Navigate to="/login" replace />
  if (role && auth.role !== role) return <Navigate to="/" replace />

  return children
}
