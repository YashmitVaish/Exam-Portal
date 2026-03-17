import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function RootRedirect() {
  const { auth } = useAuth()
  if (!auth) return <Navigate to="/login" replace />
  if (auth.role === 'teacher') return <Navigate to="/teacher" replace />
  return <Navigate to="/student" replace />
}
