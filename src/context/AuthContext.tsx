import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react'
import http from '../lib/http'
import type { User } from '../types'

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<void>
  register: (data: Partial<User> & { password: string }) => Promise<void>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const urlToken = params.get('auth_token')
    const urlUser = params.get('user')

    if (urlToken && urlUser) {
      localStorage.setItem('auth_token', urlToken)
      localStorage.setItem('user', urlUser)
      try {
        setUser(JSON.parse(urlUser))
        window.history.replaceState({}, document.title, window.location.pathname)
      } catch (e) {
        console.error('Failed to parse user from URL')
      }
    } else {
      const stored = localStorage.getItem('user')
      if (stored) {
        try { setUser(JSON.parse(stored)) } catch { localStorage.removeItem('user') }
      }
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
        distributorId: res.data.user?.distributorId,
      }
      localStorage.setItem('auth_token', res.data.accessToken)
      localStorage.setItem('user', JSON.stringify(u))
      setUser(u)
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Email atau password salah')
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
        role: data.role ? data.role.toUpperCase() : undefined,
        distributorId: data.distributorId || undefined,
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
        distributorId: res.data.user?.distributorId,
      }
      if (res.data.accessToken) {
        localStorage.setItem('auth_token', res.data.accessToken)
      }
      localStorage.setItem('user', JSON.stringify(u))
      setUser(u)
    } catch (err: any) {
      const msg = err.response?.data?.message
      if (Array.isArray(msg)) {
        throw new Error(msg.join(', '))
      }
      throw new Error(msg || 'Pendaftaran gagal')
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
