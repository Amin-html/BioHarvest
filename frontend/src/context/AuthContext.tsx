import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { api, setAccessToken } from '../lib/api'
import type { User } from '../types/api'

interface AuthContextValue {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  async function fetchMe() {
    try {
      const { data } = await api.get<User>('/auth/me')
      setUser(data)
    } catch {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // при первой загрузке access-токена в памяти ещё нет — пробуем refresh по cookie
    api.post('/auth/refresh', {})
      .then(({ data }) => {
        setAccessToken(data.access_token)
        return fetchMe()
      })
      .catch(() => setLoading(false))
  }, [])

  async function login(email: string, password: string) {
    const { data } = await api.post('/auth/login', { email, password })
    setAccessToken(data.access_token)
    await fetchMe()
  }

  async function register(email: string, password: string) {
    await api.post('/auth/register', { email, password })
    await login(email, password)
  }

  async function logout() {
    await api.post('/auth/logout')
    setAccessToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}