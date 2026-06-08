import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Shield, Mail, ArrowLeft } from 'lucide-react'
import { forgotPassword } from '../lib/api'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!email) { setError('Email wajib diisi'); return }
    try {
      await forgotPassword(email)
      setSent(true)
    } catch {
      setError('Gagal mengirim email. Coba lagi.')
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
          <h1 className="text-xl font-bold text-batik-900">Reset Password</h1>
          <p className="text-sm text-batik-500 mt-1">Masukkan email untuk menerima link reset</p>
        </div>
        {sent ? (
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
              <Mail className="w-8 h-8 text-green-600" />
            </div>
            <p className="text-sm text-batik-700 mb-4">Link reset password telah dikirim ke email Anda (cek console backend untuk link).</p>
            <Link to="/login" className="text-batik-700 font-medium hover:underline">Kembali ke login</Link>
          </div>
        ) : (
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
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button type="submit"
              className="w-full py-2.5 rounded-xl text-white font-semibold bg-gradient-to-r from-batik-700 to-batik-800 hover:from-batik-800 hover:to-batik-900 transition-all">
              Kirim Link Reset
            </button>
            <Link to="/login" className="flex items-center justify-center gap-1 text-sm text-batik-500 hover:text-batik-700">
              <ArrowLeft className="w-3 h-3" /> Kembali ke login
            </Link>
          </form>
        )}
      </div>
    </div>
  )
}
