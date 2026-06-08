import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react'
import http from '../lib/http'
import type { User } from '../types'

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  register: (data: Partial<User> & { password: string }) => Promise<boolean>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('user')
    if (stored) {
      try { setUser(JSON.parse(stored)) } catch { localStorage.removeItem('user') }
    }
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true)
    try {
      const res = await http.post('/auth/login', { email, password })
      const u: User = {
        id: res.data.user?.id ?? '',
        email: res.data.user?.email ?? email,
        name: res.data.user?.name ?? '',
        role: (res.data.user?.role ?? 'visitor').toLowerCase() as User['role'],
        umkmName: res.data.user?.umkmName,
        phone: res.data.user?.phone,
        city: res.data.user?.city,
        province: res.data.user?.province,
        avatar: res.data.user?.photoUrl,
      }
      localStorage.setItem('auth_token', res.data.accessToken)
      localStorage.setItem('user', JSON.stringify(u))
      setUser(u)
      return true
    } catch {
      return false
    } finally {
      setIsLoading(false)
    }
  }, [])

  const register = useCallback(async (data: Partial<User> & { password: string }) => {
    setIsLoading(true)
    try {
      const res = await http.post('/auth/register', {
        email: data.email,
        password: data.password,
        name: data.name,
        umkmName: data.umkmName,
        phone: data.phone,
        city: data.city,
        province: data.province,
      })
      const u: User = {
        id: res.data.user?.id ?? '',
        email: res.data.user?.email ?? data.email ?? '',
        name: res.data.user?.name ?? data.name ?? '',
        role: (res.data.user?.role ?? 'umkm').toLowerCase() as User['role'],
        umkmName: res.data.user?.umkmName,
        phone: res.data.user?.phone,
        city: res.data.user?.city,
        province: res.data.user?.province,
        avatar: res.data.user?.photoUrl,
      }
      if (res.data.accessToken) {
        localStorage.setItem('auth_token', res.data.accessToken)
      }
      localStorage.setItem('user', JSON.stringify(u))
      setUser(u)
      return true
    } catch {
      return false
    } finally {
      setIsLoading(false)
    }
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user')
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
