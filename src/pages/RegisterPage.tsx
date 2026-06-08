import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Shield, User, Store, Mail, Phone, MapPin, Lock, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function RegisterPage() {
  const navigate = useNavigate()
  const { register } = useAuth()
  const [form, setForm] = useState({ name: '', umkmName: '', email: '', phone: '', city: '', province: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')

  function update(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    const labels: Record<string, string> = { name: 'Nama', umkmName: 'Nama UMKM', email: 'Email', phone: 'No. HP', city: 'Kota', province: 'Provinsi', password: 'Password' }
    for (const key of Object.keys(labels)) {
      if (!form[key as keyof typeof form]) { setError(`${labels[key]} wajib diisi`); return }
    }
    await register(form)
    navigate('/dashboard')
  }

  const fields = [
    { key: 'name', label: 'Nama Lengkap', icon: User, placeholder: 'Nama pemilik UMKM', span: true },
    { key: 'umkmName', label: 'Nama UMKM', icon: Store, placeholder: 'Nama usaha/kelompok batik', span: true },
    { key: 'email', label: 'Email', icon: Mail, placeholder: 'nama@email.com', span: true },
    { key: 'phone', label: 'Nomor HP', icon: Phone, placeholder: '08xxxxxxxxxx' },
    { key: 'city', label: 'Kota', icon: MapPin, placeholder: 'Kota asal UMKM' },
    { key: 'province', label: 'Provinsi', icon: MapPin, placeholder: 'Provinsi asal UMKM' },
  ]

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-batik-50 via-white to-batik-100 p-4 py-8">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-batik-200 p-8">
        <div className="text-center mb-6">
          <div className="flex justify-center mb-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-batik-600 to-batik-800 flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
          </div>
          <h1 className="text-xl font-bold text-batik-900">Daftar UMKM Batik</h1>
          <p className="text-sm text-batik-500 mt-1">Bergabung untuk melindungi produk batik Anda dengan blockchain</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {fields.map(f => {
              const Icon = f.icon
              return (
                <div key={f.key} className={f.span ? 'md:col-span-2' : ''}>
                  <label className="block text-sm font-medium text-batik-800 mb-1.5">{f.label}</label>
                  <div className="relative">
                    <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-batik-400" />
                    <input type={f.key === 'email' ? 'email' : f.key === 'phone' ? 'tel' : 'text'}
                      value={form[f.key as keyof typeof form] as string}
                      onChange={e => update(f.key, e.target.value)}
                      placeholder={f.placeholder}
                      className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-batik-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-batik-300 focus:border-batik-500" />
                  </div>
                </div>
              )
            })}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-batik-800 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-batik-400" />
                <input type={showPass ? 'text' : 'password'} value={form.password}
                  onChange={e => update('password', e.target.value)} placeholder="Min. 6 karakter"
                  className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-batik-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-batik-300 focus:border-batik-500" />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-batik-400">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button type="submit"
            className="w-full py-2.5 rounded-xl text-white font-semibold bg-gradient-to-r from-batik-700 to-batik-800 hover:from-batik-800 hover:to-batik-900 transition-all">
            Daftar Sekarang
          </button>
        </form>
        <p className="text-center text-sm text-batik-500 mt-4">
          Sudah punya akun?{' '}
          <Link to="/login" className="text-batik-700 font-medium hover:underline">Masuk</Link>
        </p>
      </div>
    </div>
  )
}
