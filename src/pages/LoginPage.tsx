import { useState, useEffect } from 'react'
import { useNavigate, Link, useSearchParams } from 'react-router-dom'
import { Shield, Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [searchParams] = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const token = searchParams.get('token')
    const refresh = searchParams.get('refresh')
    if (token) {
      localStorage.setItem('auth_token', token)
      if (refresh) localStorage.setItem('refresh_token', refresh)
      navigate('/dashboard', { replace: true })
    }
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!email || !password) { setError('Email dan password wajib diisi'); return }
    const ok = await login(email, password)
    if (ok) navigate('/dashboard')
  }

  const googleLoginUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1'}/auth/google`

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-batik-50 via-white to-batik-100 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-batik-200 p-8">
        <div className="text-center mb-6">
          <div className="flex justify-center mb-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-batik-600 to-batik-800 flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
          </div>
          <h1 className="text-xl font-bold text-batik-900">Masuk ke BatikChain</h1>
          <p className="text-sm text-batik-500 mt-1">Platform sertifikasi batik blockchain Indonesia</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-batik-800 mb-1.5">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-batik-400" />
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="nama@email.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-batik-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-batik-300 focus:border-batik-500" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-batik-800 mb-1.5">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-batik-400" />
              <input type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-batik-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-batik-300 focus:border-batik-500" />
              <button type="button" onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-batik-400">
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <div className="flex justify-end -mt-2">
            <Link to="/forgot-password" className="text-xs text-batik-500 hover:text-batik-700 hover:underline">Lupa password?</Link>
          </div>
          <button type="submit"
            className="w-full py-2.5 rounded-xl text-white font-semibold bg-gradient-to-r from-batik-700 to-batik-800 hover:from-batik-800 hover:to-batik-900 transition-all">
            Masuk
          </button>
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-batik-200" /></div>
            <div className="relative flex justify-center"><span className="bg-white px-3 text-xs text-batik-400">atau</span></div>
          </div>
          <a href={googleLoginUrl}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-batik-200 text-batik-700 font-medium hover:bg-batik-50 transition-all">
            <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
            Masuk dengan Google
          </a>
        </form>
        <p className="text-center text-sm text-batik-500 mt-4">
          Belum punya akun?{' '}
          <Link to="/register" className="text-batik-700 font-medium hover:underline">Daftar UMKM</Link>
        </p>
      </div>
    </div>
  )
}
