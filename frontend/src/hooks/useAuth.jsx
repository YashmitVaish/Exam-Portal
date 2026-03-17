import { createContext, useContext, useState, useCallback } from 'react'

const AuthContext = createContext(null)

function decodeRole(token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return payload.role || null
  } catch {
    return null
  }
}

function load() {
  try {
    return JSON.parse(localStorage.getItem('ep_auth') || 'null')
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(load)

  const login = useCallback((token, roleHint) => {
    const role = decodeRole(token) || roleHint
    const value = { token, role }
    setAuth(value)
    localStorage.setItem('ep_auth', JSON.stringify(value))
  }, [])

  const logout = useCallback(() => {
    setAuth(null)
    localStorage.removeItem('ep_auth')
  }, [])

  return (
    <AuthContext.Provider value={{ auth, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be inside AuthProvider')
  return ctx
}
