import { useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { Shield, Lock, Eye, EyeOff } from 'lucide-react'
import { resetPassword } from '../lib/api'

export default function ResetPasswordPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!token) {
      setError('Token reset password tidak valid atau tidak ditemukan di URL.')
      return
    }
    if (password.length < 8) {
      setError('Password baru minimal harus 8 karakter.')
      return
    }
    if (password !== confirmPassword) {
      setError('Konfirmasi password tidak cocok.')
      return
    }

    setLoading(true)
    try {
      await resetPassword(token, password)
      setSuccess(true)
      setTimeout(() => navigate('/login'), 3000)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gagal mereset password. Token mungkin sudah kedaluwarsa.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-batik-50 via-white to-batik-100 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-batik-200 p-8">
        <div className="text-center mb-6">
          <div className="flex justify-center mb-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-batik-600 to-batik-800 flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
          </div>
          <h1 className="text-xl font-bold text-batik-900">Ubah Password Baru</h1>
          <p className="text-sm text-batik-500 mt-1">Masukkan kata sandi baru untuk akun Anda</p>
        </div>

        {success ? (
          <div className="text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto">
              ✓
            </div>
            <p className="text-sm text-batik-800 font-semibold">Password Berhasil Diubah!</p>
            <p className="text-xs text-batik-500">Mengarahkan Anda kembali ke halaman login dalam 3 detik...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-batik-800 mb-1.5">Password Baru</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-batik-400" />
                <input type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="Min. 8 karakter (Huruf Besar, Kecil & Angka)"
                  className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-batik-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-batik-300 focus:border-batik-500" />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-batik-400">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-batik-800 mb-1.5">Konfirmasi Password Baru</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-batik-400" />
                <input type={showPass ? 'text' : 'password'} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Konfirmasi password baru"
                  className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-batik-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-batik-300 focus:border-batik-500" />
              </div>
            </div>

            {error && <p className="text-red-500 text-xs font-semibold">{error}</p>}

            <button type="submit" disabled={loading}
              className="w-full py-2.5 rounded-xl text-white font-semibold bg-gradient-to-r from-batik-700 to-batik-800 hover:from-batik-800 hover:to-batik-900 disabled:opacity-60 transition-all shadow-md">
              {loading ? 'Mengubah...' : 'Simpan Password'}
            </button>
            <div className="text-center pt-2">
              <Link to="/login" className="text-xs text-batik-500 hover:text-batik-700 hover:underline">
                Batal & Kembali ke Login
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
