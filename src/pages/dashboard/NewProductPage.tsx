import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Upload, Shield } from 'lucide-react'
import { registerProduct } from '../../lib/api'
import http from '../../lib/http'

export default function NewProductPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    productName: '', producerName: '', originLocation: '', productionDate: '', imageUrl: '',
  })
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState('')
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  function validate() {
    const e: Record<string, string> = {}
    if (!form.productName.trim()) e.productName = 'Nama produk wajib diisi'
    if (!form.producerName.trim()) e.producerName = 'Nama produsen wajib diisi'
    if (!form.originLocation.trim()) e.originLocation = 'Asal daerah wajib diisi'
    if (!form.productionDate) e.productionDate = 'Tanggal produksi wajib diisi'
    if (!file && !form.imageUrl) e.imageUrl = 'Gambar produk wajib diupload'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) return
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
      await registerProduct({ ...form, imageUrl })
      navigate('/dashboard/products')
    } catch {
      setErrors({ productName: 'Gagal menyimpan produk. Coba lagi.' })
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
            <div>
              <label className="block text-sm font-medium text-batik-800 mb-1.5">Nama Produsen / UMKM</label>
              <input value={form.producerName} onChange={e => setForm(p => ({ ...p, producerName: e.target.value }))}
                placeholder="Nama UKM"
                className="w-full px-4 py-2.5 rounded-lg border border-batik-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-batik-300" />
              {errors.producerName && <p className="text-red-500 text-xs mt-1">{errors.producerName}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-batik-800 mb-1.5">Asal Daerah</label>
              <input value={form.originLocation} onChange={e => setForm(p => ({ ...p, originLocation: e.target.value }))}
                placeholder="Contoh: Pekanbaru, Riau"
                className="w-full px-4 py-2.5 rounded-lg border border-batik-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-batik-300" />
              {errors.originLocation && <p className="text-red-500 text-xs mt-1">{errors.originLocation}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-batik-800 mb-1.5">Tanggal Produksi</label>
              <input type="date" value={form.productionDate} onChange={e => setForm(p => ({ ...p, productionDate: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-lg border border-batik-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-batik-300" />
              {errors.productionDate && <p className="text-red-500 text-xs mt-1">{errors.productionDate}</p>}
            </div>
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
              {loading ? 'Mengupload & Mendaftarkan...' : 'Register & Generate QR Code'}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
