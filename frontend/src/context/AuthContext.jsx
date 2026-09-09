import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const AuthContext = createContext(null)
const USERS_KEY = 'kharcova-users-v1'
const SESSION_KEY = 'kharcova-session-v1'

function readUsers() {
  try { return JSON.parse(localStorage.getItem(USERS_KEY) || '[]') } catch { return [] }
}

function safeUser(user) {
  if (!user) return null
  return { id: user.id, name: user.name, email: user.email }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return safeUser(JSON.parse(localStorage.getItem(SESSION_KEY) || 'null')) } catch { return null }
  })

  useEffect(() => {
    if (user) localStorage.setItem(SESSION_KEY, JSON.stringify(user))
    else localStorage.removeItem(SESSION_KEY)
  }, [user])

  const signup = (name, email, password) => {
    const cleanEmail = email.trim().toLowerCase()
    if (!name.trim() || !cleanEmail || password.length < 6) {
      return { ok: false, message: 'Please enter your name, email and a password of at least 6 characters.' }
    }
    const users = readUsers()
    if (users.some(u => u.email === cleanEmail)) return { ok: false, message: 'An account with this email already exists.' }
    const newUser = { id: `user-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, name: name.trim(), email: cleanEmail, password }
    localStorage.setItem(USERS_KEY, JSON.stringify([...users, newUser]))
    setUser(safeUser(newUser))
    return { ok: true }
  }

  const login = (email, password) => {
    const cleanEmail = email.trim().toLowerCase()
    const found = readUsers().find(u => u.email === cleanEmail && u.password === password)
    if (!found) return { ok: false, message: 'Incorrect email or password.' }
    setUser(safeUser(found))
    return { ok: true }
  }

  const logout = () => setUser(null)

  const value = useMemo(() => ({ user, isAuthenticated: !!user, login, signup, logout }), [user])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
