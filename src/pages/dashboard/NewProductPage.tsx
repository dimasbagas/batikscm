import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Upload, Shield } from 'lucide-react'
import { registerProduct, getPublicDistributors } from '../../lib/api'
import { useAuth } from '../../context/AuthContext'
import http from '../../lib/http'

export default function NewProductPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const isPengrajin = user?.role?.toLowerCase() === 'pengrajin'

  if (user?.role?.toLowerCase() === 'umkm') {
    return (
      <div className="bg-white rounded-xl border border-batik-100 p-12 text-center text-batik-400">
        <Shield className="w-12 h-12 mx-auto mb-3" />
        <p className="font-semibold text-batik-800 text-lg">Akses Terbatas</p>
        <p className="text-sm text-batik-500 mt-1">Akun UMKM tidak dapat mendaftarkan produk baru.</p>
      </div>
    )
  }

  const [form, setForm] = useState({
    productName: '', producerName: '', originLocation: '', productionDate: '', imageUrl: '', distributorId: '',
  })
  const [distributors, setDistributors] = useState<any[]>([])
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState('')
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    getPublicDistributors().then(setDistributors)
  }, [])

  useEffect(() => {
    if (user) {
      setForm(prev => ({
        ...prev,
        producerName: user.umkmName || user.name || '',
        originLocation: user.city ? `${user.city}, ${user.province || ''}` : '',
        distributorId: user.distributorId || '',
      }))
    }
  }, [user])

  function validate() {
    const e: Record<string, string> = {}
    if (!form.productName.trim()) e.productName = 'Nama produk wajib diisi'
    if (!form.producerName.trim()) e.producerName = 'Nama produsen wajib diisi'
    if (!form.originLocation.trim()) e.originLocation = 'Asal daerah wajib diisi'
    if (!form.productionDate) {
      e.productionDate = 'Tanggal produksi wajib diisi'
    } else {
      const year = new Date(form.productionDate).getFullYear()
      if (year < 1900 || year > 2100) {
        e.productionDate = 'Tahun produksi tidak valid (harus antara 1900 - 2100)'
      }
    }
    if (!isPengrajin && !file && !form.imageUrl) e.imageUrl = 'Gambar produk wajib diupload'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
  const MAX_SIZE = 5 * 1024 * 1024

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) return
    if (!ALLOWED_TYPES.includes(f.type)) {
      setErrors(prev => ({ ...prev, imageUrl: 'Format file harus JPG, PNG, atau WebP' }))
      return
    }
    if (f.size > MAX_SIZE) {
      setErrors(prev => ({ ...prev, imageUrl: 'Ukuran file maksimal 5MB' }))
      return
    }
    setFile(f)
    setErrors(prev => ({ ...prev, imageUrl: '' }))
    const reader = new FileReader()
    reader.onload = ev => setPreview(ev.target?.result as string || '')
    reader.readAsDataURL(f)
  }

  async function uploadFile(): Promise<string> {
    if (form.imageUrl && !file) return form.imageUrl
    if (!file) return ''
    const fd = new FormData()
    fd.append('file', file)
    const res = await http.post('/products/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
    return res.data.url
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      const imageUrl = await uploadFile()
      const formattedDate = new Date(form.productionDate).toISOString()
      const payload = { ...form, productionDate: formattedDate, imageUrl }
      console.log('Sending product payload:', JSON.stringify(payload))
      await registerProduct(payload)
      navigate('/dashboard/products')
    } catch (err: any) {
      console.error('Failed to register product:', JSON.stringify(err.response?.data || err))
      const msg = err.response?.data?.message
      setErrors({ productName: Array.isArray(msg) ? msg.join(', ') : 'Gagal menyimpan produk. Coba lagi.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/dashboard/products" className="text-batik-600 hover:text-batik-800">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-batik-950">Registrasi Produk Baru</h1>
          <p className="text-batik-500 text-sm">Daftarkan produk batik ke blockchain</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-batik-100">
        <div className="px-5 py-4 border-b border-batik-100 flex items-center gap-2">
          <Shield className="w-4 h-4 text-batik-600" />
          <h2 className="font-semibold text-batik-900">Data Produk</h2>
        </div>
        <div className="p-5 space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-batik-800 mb-1.5">Nama Produk</label>
              <input value={form.productName} onChange={e => setForm(p => ({ ...p, productName: e.target.value }))}
                placeholder="Contoh: Batik Riau Melayu"
                className="w-full px-4 py-2.5 rounded-lg border border-batik-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-batik-300" />
              {errors.productName && <p className="text-red-500 text-xs mt-1">{errors.productName}</p>}
            </div>
            {!isPengrajin && (
              <div>
                <label className="block text-sm font-medium text-batik-800 mb-1.5">Nama Produsen / UMKM</label>
                <input value={form.producerName} onChange={e => setForm(p => ({ ...p, producerName: e.target.value }))}
                  placeholder="Nama UKM"
                  className="w-full px-4 py-2.5 rounded-lg border border-batik-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-batik-300" />
                {errors.producerName && <p className="text-red-500 text-xs mt-1">{errors.producerName}</p>}
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-batik-800 mb-1.5">Asal Daerah</label>
              <input value={form.originLocation} onChange={e => setForm(p => ({ ...p, originLocation: e.target.value }))}
                placeholder="Contoh: Pekanbaru, Riau"
                className="w-full px-4 py-2.5 rounded-lg border border-batik-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-batik-300" />
              {errors.originLocation && <p className="text-red-500 text-xs mt-1">{errors.originLocation}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-batik-800 mb-1.5">Tanggal Produksi</label>
              <input type="date" min="1900-01-01" max="2100-12-31" value={form.productionDate} onChange={e => setForm(p => ({ ...p, productionDate: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-lg border border-batik-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-batik-300" />
              {errors.productionDate && <p className="text-red-500 text-xs mt-1">{errors.productionDate}</p>}
            </div>
            {isPengrajin && (
              <div>
                <label className="block text-sm font-medium text-batik-800 mb-1.5">Distributor Penyalur</label>
                <input
                  type="text"
                  readOnly
                  value={distributors.find(d => d.id === form.distributorId)?.umkmName || distributors.find(d => d.id === form.distributorId)?.name || 'Memuat distributor...'}
                  className="w-full px-4 py-2.5 rounded-lg border border-batik-200 bg-batik-50 text-batik-700 text-sm font-semibold cursor-not-allowed outline-none"
                />
                <p className="text-[11px] text-batik-500 mt-1">Distributor otomatis terpilih dari akun Anda saat pendaftaran.</p>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-batik-800 mb-1.5">Gambar Produk</label>
              <div className={`flex items-center gap-3 p-2.5 border-2 rounded-lg cursor-pointer transition ${
                errors.imageUrl ? 'border-red-400 bg-red-50' : 'border-dashed border-batik-300 bg-batik-50 hover:bg-batik-100'
              }`} onClick={() => document.getElementById('file-upload')?.click()}>
                <Upload className="w-6 h-6 text-batik-400 flex-shrink-0" />
                <span className={`text-sm ${file ? 'text-batik-900 font-medium' : 'text-batik-400'}`}>
                  {file?.name || 'Klik untuk upload gambar...'}
                </span>
              </div>
              <input id="file-upload" type="file" accept="image/*" onChange={handleFile} className="hidden" />
              {errors.imageUrl && <p className="text-red-500 text-xs mt-1">{errors.imageUrl}</p>}
            </div>
          </div>

          {preview && (
            <div className="flex justify-center">
              <img src={preview} alt="Preview" className="w-28 h-28 object-cover rounded-xl border-2 border-batik-200" />
            </div>
          )}

          <div className="flex justify-end pt-2">
            <button type="submit" disabled={loading}
              className="px-8 py-2.5 rounded-xl text-white font-semibold bg-gradient-to-r from-batik-700 to-batik-800 hover:from-batik-800 hover:to-batik-900 disabled:opacity-60 transition-all">
              {loading ? 'Mengupload & Mendaftarkan...' : isPengrajin ? 'Daftarkan Batik (Ke Blockchain)' : 'Register & Generate QR Code'}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
