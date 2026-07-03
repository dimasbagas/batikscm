import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Shield, User, Store, Mail, Phone, MapPin, Lock, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { getPublicDistributors } from '../lib/api'
import type { User as UserType } from '../types'

export default function RegisterPage() {
  const navigate = useNavigate()
  const { register } = useAuth()
  const [form, setForm] = useState<{
    name: string;
    umkmName: string;
    email: string;
    phone: string;
    city: string;
    province: string;
    password: string;
    role: UserType['role'];
    distributorId?: string;
  }>({ name: '', umkmName: '', email: '', phone: '', city: '', province: '', password: '', role: 'pengrajin', distributorId: '' })
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')
  const [distributors, setDistributors] = useState<any[]>([])
  const [searchDist, setSearchDist] = useState('')
  const [showDistDropdown, setShowDistDropdown] = useState(false)

  useEffect(() => {
    getPublicDistributors().then(setDistributors)
  }, [])

  function update(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    const labels: Record<string, string> = {
      name: form.role === 'pengrajin' ? 'Nama Lengkap Pengrajin' : form.role === 'distributor' ? 'Nama Penanggung Jawab' : 'Nama Lengkap',
      umkmName: form.role === 'pengrajin' ? 'Nama Kelompok / Studio Batik' : form.role === 'distributor' ? 'Nama Distributor' : 'Nama UMKM',
      email: 'Email',
      phone: 'No. HP',
      city: 'Kota',
      province: 'Provinsi',
      password: 'Password'
    }
    for (const key of Object.keys(labels)) {
      if (form.role === 'pengrajin' && key === 'umkmName') continue
      if (key !== 'role' && key !== 'distributorId' && !form[key as keyof typeof form]) { setError(`${labels[key]} wajib diisi`); return }
    }
    if (form.role === 'pengrajin' && !form.distributorId) {
      setError('Harap pilih distributor asosiasi Anda');
      return
    }
    try {
      let payload = { ...form }
      if (form.role === 'pengrajin') {
        const selected = distributors.find(d => d.id === form.distributorId)
        payload.umkmName = selected ? (selected.umkmName || selected.name) : undefined
      }
      await register(payload)
      navigate('/dashboard')
    } catch (err: any) {
      setError(err.message)
    }
  }

  const fields = [
    {
      key: 'name',
      label: form.role === 'pengrajin' ? 'Nama Lengkap Pengrajin' : form.role === 'distributor' ? 'Nama Penanggung Jawab' : 'Nama Lengkap Pemilik',
      icon: User,
      placeholder: form.role === 'pengrajin' ? 'Nama lengkap pengrajin batik' : form.role === 'distributor' ? 'Nama perwakilan/penanggung jawab' : 'Nama pemilik UMKM',
      span: true
    },
    ...(form.role !== 'pengrajin' ? [{
      key: 'umkmName',
      label: form.role === 'distributor' ? 'Nama Perusahaan Distributor' : 'Nama UMKM / Usaha',
      icon: Store,
      placeholder: form.role === 'distributor' ? 'Nama PT/CV distributor' : 'Nama usaha batik',
      span: true
    }] : []),
    { key: 'email', label: 'Email', icon: Mail, placeholder: 'nama@email.com', span: true },
    { key: 'phone', label: 'Nomor HP', icon: Phone, placeholder: '08xxxxxxxxxx' },
    {
      key: 'city',
      label: form.role === 'pengrajin' ? 'Kota Asal Sentra' : form.role === 'distributor' ? 'Kota Kantor/Gudang' : 'Kota Asal UMKM',
      icon: MapPin,
      placeholder: form.role === 'pengrajin' ? 'Kota asal kerajinan batik' : form.role === 'distributor' ? 'Kota operasional distributor' : 'Kota lokasi usaha'
    },
    {
      key: 'province',
      label: 'Provinsi',
      icon: MapPin,
      placeholder: form.role === 'pengrajin' ? 'Provinsi sentra batik' : form.role === 'distributor' ? 'Provinsi lokasi distributor' : 'Provinsi asal usaha'
    },
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
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-batik-800 mb-1.5">Mendaftar Sebagai</label>
              <select value={form.role} onChange={e => update('role', e.target.value)}
                className="w-full px-4 py-2.5 rounded-lg border border-batik-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-batik-300 focus:border-batik-500">
                <option value="pengrajin">Pengrajin Batik (Artisan)</option>
                <option value="distributor">Distributor / Penyalur Batik</option>
                <option value="umkm">UMKM Batik (Umum)</option>
              </select>
            </div>
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
            {form.role === 'pengrajin' && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-batik-800 mb-1.5">Pilih Distributor Asosiasi (Dapat Dicari)</label>
                <div className="relative">
                  <Store className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-batik-400" />
                  <input type="text"
                    value={searchDist}
                    onChange={e => {
                      setSearchDist(e.target.value)
                      setShowDistDropdown(true)
                    }}
                    onFocus={() => {
                      setSearchDist('')
                      setShowDistDropdown(true)
                    }}
                    onBlur={() => setTimeout(() => setShowDistDropdown(false), 200)}
                    placeholder="Ketik untuk mencari distributor..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-batik-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-batik-300 focus:border-batik-500" />
                  {showDistDropdown && (
                    <div className="absolute z-50 left-0 right-0 mt-1 max-h-48 overflow-y-auto bg-white border border-batik-200 rounded-lg shadow-lg">
                      {distributors.filter(d => 
                        (d.umkmName || d.name || '').toLowerCase().includes(searchDist.toLowerCase())
                      ).length === 0 ? (
                        <div className="px-4 py-2 text-xs text-batik-400">Tidak ada distributor ditemukan</div>
                      ) : (
                        distributors.filter(d => 
                          (d.umkmName || d.name || '').toLowerCase().includes(searchDist.toLowerCase())
                        ).map(d => {
                          const labelText = d.umkmName || d.name
                          return (
                            <button key={d.id} type="button"
                              onMouseDown={() => {
                                update('distributorId', d.id)
                                setSearchDist(labelText)
                                setShowDistDropdown(false)
                              }}
                              className="w-full text-left px-4 py-2 text-sm text-batik-800 hover:bg-batik-50 hover:text-batik-900 border-b border-batik-50 last:border-none">
                              <p className="font-semibold">{labelText}</p>
                              <p className="text-[10px] text-batik-400">{d.city}, {d.province}</p>
                            </button>
                          )
                        })
                      )}
                    </div>
                  )}
                </div>
                {form.distributorId && (
                  <p className="text-xs text-green-600 font-semibold mt-1">
                    Terpilih: {distributors.find(d => d.id === form.distributorId)?.umkmName || distributors.find(d => d.id === form.distributorId)?.name}
                  </p>
                )}
              </div>
            )}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-batik-800 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-batik-400" />
                <input type={showPass ? 'text' : 'password'} value={form.password}
                  onChange={e => update('password', e.target.value)} placeholder="Min. 8 karakter (Huruf Besar, Kecil & Angka)"
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
