import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { authApi } from '../../api/client'
import './AuthPage.css'

export default function AuthPage() {
  const [tab, setTab] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('student')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const { login } = useAuth()
  const navigate = useNavigate()

  const submit = async () => {
    if (!email || !password) { setError('Please fill in all fields'); return }
    setError('')
    setLoading(true)
    try {
      if (tab === 'register') {
        const data = await authApi.register(email, password, role)
        login(data.access_token, role)
      } else {
        const data = await authApi.login(email, password)
        login(data.access_token, null)
      }
      navigate('/')
    } catch (e) {
      setError(e.detail || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const onKey = (e) => e.key === 'Enter' && submit()

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <div className="auth-logo">
          Exam<span>Portal</span>
        </div>
        <p className="auth-sub">
          {tab === 'login' ? 'Welcome back. Sign in to continue.' : 'Create your account to get started.'}
        </p>

        <div className="auth-tabs">
          <button
            className={`auth-tab ${tab === 'login' ? 'auth-tab--active' : ''}`}
            onClick={() => { setTab('login'); setError('') }}
          >
            Sign in
          </button>
          <button
            className={`auth-tab ${tab === 'register' ? 'auth-tab--active' : ''}`}
            onClick={() => { setTab('register'); setError('') }}
          >
            Register
          </button>
        </div>

        <div className="auth-form">
          {error && <div className="alert alert-error">⚠ {error}</div>}

          <div className="field">
            <label className="label">Email address</label>
            <input
              className="input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@school.edu"
              onKeyDown={onKey}
              autoFocus
            />
          </div>

          <div className="field">
            <label className="label">Password</label>
            <input
              className="input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              onKeyDown={onKey}
            />
          </div>

          {tab === 'register' && (
            <div className="field">
              <label className="label">I am a…</label>
              <div className="role-select">
                <button
                  type="button"
                  className={`role-opt ${role === 'student' ? 'role-opt--active' : ''}`}
                  onClick={() => setRole('student')}
                >
                  🎓 Student
                </button>
                <button
                  type="button"
                  className={`role-opt ${role === 'teacher' ? 'role-opt--active' : ''}`}
                  onClick={() => setRole('teacher')}
                >
                  📋 Teacher
                </button>
              </div>
            </div>
          )}

          <button
            className="btn btn-primary btn-lg btn-block"
            onClick={submit}
            disabled={loading}
          >
            {loading ? (
              <><span className="spinner spinner--white" /> Working…</>
            ) : tab === 'login' ? (
              'Sign in →'
            ) : (
              'Create account →'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
