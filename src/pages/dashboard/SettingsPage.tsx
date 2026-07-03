import { useState } from 'react'
import { User, Store, Mail, Phone, MapPin, Save, Shield } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

export default function SettingsPage() {
  const { user } = useAuth()
  const [form, setForm] = useState({
    name: user?.name || '',
    umkmName: user?.umkmName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    city: user?.city || '',
    province: user?.province || '',
  })
  const [saved, setSaved] = useState(false)

  function update(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  function handleSave() {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const fields = [
    { key: 'name', label: 'Nama Lengkap', icon: User, span: true },
    { key: 'umkmName', label: 'Nama UMKM', icon: Store, span: true },
    { key: 'email', label: 'Email', icon: Mail, span: true },
    { key: 'phone', label: 'Nomor HP', icon: Phone },
    { key: 'city', label: 'Kota', icon: MapPin },
    { key: 'province', label: 'Provinsi', icon: MapPin },
  ]

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-batik-950">Pengaturan Profil</h1>
        <p className="text-batik-500 text-sm mt-1">Kelola profil UMKM Anda</p>
      </div>

      <div className="bg-white rounded-xl border border-batik-100">
        <div className="px-5 py-4 border-b border-batik-100">
          <h2 className="font-semibold text-batik-900">Informasi UMKM</h2>
        </div>
        <div className="p-5 space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-batik-800 mb-1.5">Peran / Hak Akses (Role)</label>
              <div className="relative">
                <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-batik-600" />
                <input
                  type="text"
                  readOnly
                  value={
                    user?.role?.toLowerCase() === 'pengrajin' ? 'Pengrajin Batik (Artisan)' :
                    user?.role?.toLowerCase() === 'distributor' ? 'Distributor / Sentra Penyalur' :
                    user?.role?.toLowerCase() === 'umkm' ? 'UMKM Retailer / Toko' :
                    user?.role?.toLowerCase() === 'admin' ? 'Administrator' :
                    user?.role?.toLowerCase() === 'verificator' ? 'Verifikator Rantai Pasok' : 'Pengunjung'
                  }
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-batik-200 bg-batik-50 text-batik-900 text-sm font-bold cursor-not-allowed outline-none"
                />
              </div>
            </div>
            {fields.map(f => {
              const Icon = f.icon
              return (
                <div key={f.key} className={f.span ? 'md:col-span-2' : ''}>
                  <label className="block text-sm font-medium text-batik-800 mb-1.5">{f.label}</label>
                  <div className="relative">
                    <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-batik-400" />
                    <input type="text" value={form[f.key as keyof typeof form] as string}
                      onChange={e => update(f.key, e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-batik-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-batik-300" />
                  </div>
                </div>
              )
            })}
          </div>
          <div className="flex justify-end pt-2">
            <button onClick={handleSave}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-white font-semibold text-sm bg-gradient-to-r from-batik-700 to-batik-800 hover:from-batik-800 hover:to-batik-900 transition-all">
              <Save className="w-4 h-4" /> {saved ? 'Tersimpan!' : 'Simpan Perubahan'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
