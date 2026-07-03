import { useState, useEffect } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { ArrowLeft, Upload, Shield } from 'lucide-react'
import { getProductById, distributeProduct } from '../../lib/api'
import { useAuth } from '../../context/AuthContext'
import http from '../../lib/http'

export default function DistributeProductPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()

  if (user && user.role !== 'distributor' && user.role !== 'admin') {
    return (
      <div className="bg-white rounded-xl border border-batik-100 p-12 text-center text-batik-400">
        <Shield className="w-12 h-12 mx-auto mb-3" />
        <p className="font-semibold text-batik-800 text-lg">Akses Terbatas</p>
        <p className="text-sm text-batik-500 mt-1">Halaman ini hanya dapat diakses oleh akun Distributor atau Admin.</p>
      </div>
    )
  }

  const [product, setProduct] = useState<any>(null)
  const [distributorName, setDistributorName] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState('')
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (id) {
      getProductById(id).then(setProduct)
    }
  }, [id])

  useEffect(() => {
    if (user) {
      setDistributorName(user.umkmName || user.name || '')
    }
  }, [user])

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
    if (!file) return ''
    const fd = new FormData()
    fd.append('file', file)
    const res = await http.post('/products/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
    return res.data.url
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!distributorName.trim()) {
      setErrors(prev => ({ ...prev, distributorName: 'Nama distributor wajib diisi' }))
      return
    }
    if (!file && !product.imageUrl) {
      setErrors(prev => ({ ...prev, imageUrl: 'Gambar produk wajib diupload' }))
      return
    }

    setLoading(true)
    try {
      const imageUrl = file ? await uploadFile() : product.imageUrl
      if (!id) return
      await distributeProduct(id, imageUrl, distributorName)
      alert('Produk berhasil didistribusikan & diperbarui di blockchain!')
      navigate('/dashboard/products')
    } catch (err: any) {
      console.error('Failed to distribute product:', err)
      const msg = err.response?.data?.message || 'Gagal mendistribusikan produk. Silakan coba lagi.'
      alert(msg)
    } finally {
      setLoading(false)
    }
  }

  if (!product) {
    return (
      <div className="p-12 text-center text-batik-500">
        <p>Memuat data produk...</p>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/dashboard/products" className="text-batik-600 hover:text-batik-800">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-batik-950">Proses Rantai Pasok & Distribusi</h1>
          <p className="text-batik-500 text-sm">Unggah foto produk final dan catat alur distribusi</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-batik-100 p-6 space-y-4">
        <h3 className="font-semibold text-batik-900 border-b border-batik-100 pb-2">Informasi Batik Asal (Pengrajin)</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-batik-500 font-medium">Nama Produk</p>
            <p className="font-semibold text-batik-900">{product.productName}</p>
          </div>
          <div>
            <p className="text-batik-500 font-medium">Token ID</p>
            <p className="font-mono font-semibold text-batik-900">{product.tokenId}</p>
          </div>
          <div>
            <p className="text-batik-500 font-medium">Pengrajin</p>
            <p className="font-semibold text-batik-900">{product.producerName}</p>
          </div>
          <div>
            <p className="text-batik-500 font-medium">Daerah Asal</p>
            <p className="font-semibold text-batik-900">{product.originLocation}</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-batik-100">
        <div className="px-5 py-4 border-b border-batik-100 flex items-center gap-2">
          <Shield className="w-4 h-4 text-batik-600" />
          <h2 className="font-semibold text-batik-900">Data Distribusi & Foto Produk</h2>
        </div>
        <div className="p-5 space-y-4">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-batik-800 mb-1.5">Nama Distributor / Perusahaan Penyalur</label>
              <input value={distributorName} onChange={e => setDistributorName(e.target.value)}
                placeholder="Contoh: PT. Batik Harapan Bangsa"
                className="w-full px-4 py-2.5 rounded-lg border border-batik-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-batik-300" />
              {errors.distributorName && <p className="text-red-500 text-xs mt-1">{errors.distributorName}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-batik-800 mb-1.5">Perbarui / Unggah Foto Fisik Batik Final</label>
              <div className={`flex items-center gap-3 p-2.5 border-2 rounded-lg cursor-pointer transition ${
                errors.imageUrl ? 'border-red-400 bg-red-50' : 'border-dashed border-batik-300 bg-batik-50 hover:bg-batik-100'
              }`} onClick={() => document.getElementById('file-upload')?.click()}>
                <Upload className="w-6 h-6 text-batik-400 flex-shrink-0" />
                <span className={`text-sm ${file ? 'text-batik-900 font-medium' : 'text-batik-400'}`}>
                  {file?.name || (product.imageUrl ? 'Ganti foto yang sudah diupload pengrajin...' : 'Klik untuk upload gambar final...')}
                </span>
              </div>
              <input id="file-upload" type="file" accept="image/*" onChange={handleFile} className="hidden" />
              {errors.imageUrl && <p className="text-red-500 text-xs mt-1">{errors.imageUrl}</p>}
            </div>
          </div>

          {(preview || product.imageUrl) && (
            <div className="flex flex-col items-center gap-2 pt-2">
              <p className="text-xs text-batik-550 font-semibold">Preview Foto Batik:</p>
              <img src={preview || product.imageUrl} alt="Preview" className="w-40 h-40 object-cover rounded-xl border-2 border-batik-200 shadow-md" />
              {preview && product.imageUrl && <p className="text-[10px] text-orange-600 font-semibold">Foto baru akan menggantikan foto dari pengrajin</p>}
            </div>
          )}

          <div className="flex justify-end pt-2">
            <button type="submit" disabled={loading}
              className="px-8 py-2.5 rounded-xl text-white font-semibold bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 disabled:opacity-60 transition-all shadow-md">
              {loading ? 'Mengunggah & Memproses...' : 'Kirim & Catat ke Blockchain'}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
