import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Users, Package, Printer, CheckCircle, Plus, Minus, FileText } from 'lucide-react'
import { getPartnerPengrajin, issueFabric } from '../../lib/api'
import { useAuth } from '../../context/AuthContext'

export default function IssueFabricPage() {
  const navigate = useNavigate()
  const { user } = useAuth()

  const [artisans, setArtisans] = useState<any[]>([])
  const [selectedArtisanId, setSelectedArtisanId] = useState('')
  const [productName, setProductName] = useState('Kain Katun Primissima')
  const [quantity, setQuantity] = useState(1)
  
  const [loading, setLoading] = useState(false)
  const [issuedProducts, setIssuedProducts] = useState<any[]>([])
  const [error, setError] = useState('')

  useEffect(() => {
    if (user?.role === 'distributor') {
      getPartnerPengrajin().then(setArtisans)
    }
  }, [user])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedArtisanId) {
      setError('Silakan pilih pengrajin mitra terlebih dahulu.')
      return
    }
    if (!productName.trim()) {
      setError('Nama kain wajib diisi.')
      return
    }
    if (quantity < 1 || quantity > 50) {
      setError('Jumlah kain harus antara 1 dan 50.')
      return
    }

    setLoading(true)
    setError('')
    try {
      const result = await issueFabric(productName, selectedArtisanId, quantity)
      setIssuedProducts(result)
    } catch (err: any) {
      console.error(err)
      setError(err.response?.data?.message || 'Gagal menyerahkan kain mentah. Coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  const selectedArtisan = artisans.find(a => a.id === selectedArtisanId)

  const handlePrint = () => {
    window.print()
  }

  if (issuedProducts.length > 0) {
    return (
      <div className="max-w-4xl mx-auto space-y-8 print:p-0 print:m-0">
        {/* Header - Hidden on Print */}
        <div className="flex items-center justify-between gap-4 print:hidden">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/dashboard/products')}
              className="p-2 rounded-lg border border-batik-200 text-batik-700 hover:bg-batik-50 transition"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-batik-950">Kain Mentah Berhasil Diserahkan!</h1>
              <p className="text-batik-500 text-sm">Cetak barcode berikut dan tempelkan ke kain fisik</p>
            </div>
          </div>
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-white font-semibold bg-gradient-to-r from-batik-700 to-batik-800 hover:from-batik-800 hover:to-batik-900 shadow-md transition-all"
          >
            <Printer className="w-4 h-4" /> Cetak Semua Barcode
          </button>
        </div>

        {/* Success Banner - Hidden on Print */}
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 flex items-start gap-4 print:hidden">
          <CheckCircle className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-emerald-950">Registrasi Kain Berhasil</h3>
            <p className="text-emerald-700 text-sm mt-1">
              Sebanyak {issuedProducts.length} kain mentah untuk <strong>{selectedArtisan?.name} ({selectedArtisan?.umkmName || 'Sentra'})</strong> telah dicatat dalam database. Status saat ini: <strong>KAIN MENTAH DISERAHKAN (FABRIC_ISSUED)</strong>.
            </p>
          </div>
        </div>

        {/* Printable Barcodes Container */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print:grid-cols-2 print:gap-4">
          {issuedProducts.map((p, idx) => (
            <div
              key={p.id}
              className="bg-white border-2 border-dashed border-batik-300 rounded-2xl p-6 shadow-sm flex flex-col justify-between aspect-[1.6/1] bg-gradient-to-br from-white to-batik-50/20 relative overflow-hidden print:shadow-none print:border-solid print:border-2 print:border-black print:rounded-none"
            >
              {/* Card Watermark/Decoration */}
              <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-batik-100/10 rounded-full flex items-center justify-center pointer-events-none print:hidden">
                <Package className="w-12 h-12 text-batik-700/5" />
              </div>

              {/* Top Header */}
              <div className="flex justify-between items-start border-b border-batik-100 pb-3 print:border-black">
                <div>
                  <h4 className="text-[10px] font-bold tracking-widest text-batik-600 uppercase">BatikChain Indonesia</h4>
                  <p className="text-sm font-bold text-batik-950 mt-0.5">{p.productName}</p>
                </div>
                <div className="bg-batik-100/80 text-batik-800 font-bold px-2 py-0.5 rounded text-[10px] border border-batik-200/50 print:border-black print:bg-none">
                  Kain Mentah
                </div>
              </div>

              {/* Middle Section: Info */}
              <div className="my-4 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <p className="text-batik-450 font-medium print:text-black">Penerima (Pengrajin)</p>
                  <p className="font-semibold text-batik-900 truncate print:text-black">{selectedArtisan?.name} ({selectedArtisan?.umkmName || 'Sentra'})</p>
                </div>
                <div>
                  <p className="text-batik-450 font-medium print:text-black">Tanggal Penyerahan</p>
                  <p className="font-semibold text-batik-900 print:text-black">{new Date().toLocaleDateString('id-ID')}</p>
                </div>
              </div>

              {/* Bottom Section: Mock Barcode & Token ID */}
              <div className="flex items-center justify-between gap-4 border-t border-batik-100 pt-3 print:border-black">
                <div className="font-mono text-sm font-bold text-batik-950 print:text-black">
                  {p.tokenId}
                </div>
                {/* Simulated Barcode */}
                <div className="flex items-center h-8 gap-[1.5px] bg-white p-1 rounded border border-batik-250 print:border-black">
                  <div className="w-[3px] h-6 bg-black"></div>
                  <div className="w-[1px] h-6 bg-black"></div>
                  <div className="w-[2px] h-6 bg-black"></div>
                  <div className="w-[4px] h-6 bg-black"></div>
                  <div className="w-[1px] h-6 bg-black"></div>
                  <div className="w-[3px] h-6 bg-black"></div>
                  <div className="w-[2px] h-6 bg-black"></div>
                  <div className="w-[1px] h-6 bg-black"></div>
                  <div className="w-[3px] h-6 bg-black"></div>
                  <div className="w-[4px] h-6 bg-black"></div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Back Button - Hidden on Print */}
        <div className="flex justify-center pt-4 print:hidden">
          <button
            onClick={() => navigate('/dashboard/products')}
            className="px-6 py-2.5 border border-batik-300 text-batik-800 rounded-xl font-semibold hover:bg-batik-50 transition"
          >
            Kembali ke Daftar Produk
          </button>
        </div>
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
          <h1 className="text-2xl font-bold text-batik-950">Serahkan Kain Mentah ke Pengrajin</h1>
          <p className="text-batik-500 text-sm">Catat penyerahan bahan baku untuk dilacak di blockchain nantinya</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-batik-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-batik-100 flex items-center gap-2 bg-gradient-to-r from-batik-50 to-transparent">
          <FileText className="w-4 h-4 text-batik-650" />
          <h2 className="font-semibold text-batik-900">Form Serah Terima Kain</h2>
        </div>

        <div className="p-5 space-y-5">
          {error && (
            <div className="p-3.5 bg-red-550/10 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* 1. Select Artisan */}
          <div>
            <label className="block text-sm font-semibold text-batik-850 mb-1.5 flex items-center gap-1.5">
              <Users className="w-4 h-4 text-batik-500" />
              Pilih Pengrajin Mitra
            </label>
            <select
              value={selectedArtisanId}
              onChange={e => setSelectedArtisanId(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-batik-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-batik-300"
            >
              <option value="">-- Pilih Pengrajin --</option>
              {artisans.map(artisan => (
                <option key={artisan.id} value={artisan.id}>
                  {artisan.name} ({artisan.city || 'Daerah Belum Diatur'})
                </option>
              ))}
            </select>
            <p className="text-[11px] text-batik-500 mt-1">
              Hanya menampilkan pengrajin yang mendaftar bermitra dengan Anda saat registrasi.
            </p>
          </div>

          {/* 2. Fabric Name */}
          <div>
            <label className="block text-sm font-semibold text-batik-850 mb-1.5 flex items-center gap-1.5">
              <Package className="w-4 h-4 text-batik-500" />
              Jenis/Nama Kain Mentah
            </label>
            <input
              type="text"
              value={productName}
              onChange={e => setProductName(e.target.value)}
              placeholder="Contoh: Kain Katun Primissima, Kain Sutra Halus"
              className="w-full px-4 py-2.5 rounded-lg border border-batik-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-batik-300"
            />
          </div>

          {/* 3. Quantity Counter */}
          <div>
            <label className="block text-sm font-semibold text-batik-850 mb-1.5">
              Jumlah Kain Mentah (Lembar)
            </label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                className="p-2.5 rounded-lg border border-batik-200 hover:bg-batik-50 text-batik-850 font-semibold"
              >
                <Minus className="w-4 h-4" />
              </button>
              <input
                type="number"
                value={quantity}
                onChange={e => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-20 px-3 py-2 text-center rounded-lg border border-batik-200 font-bold focus:outline-none focus:ring-2 focus:ring-batik-300"
              />
              <button
                type="button"
                onClick={() => setQuantity(q => Math.min(50, q + 1))}
                className="p-2.5 rounded-lg border border-batik-200 hover:bg-batik-50 text-batik-850 font-semibold"
              >
                <Plus className="w-4 h-4" />
              </button>
              <span className="text-xs text-batik-500 font-medium">
                (Maksimal 50 lembar per transaksi)
              </span>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-3 border-t border-batik-100">
            <Link
              to="/dashboard/products"
              className="px-5 py-2.5 border border-batik-300 text-batik-800 rounded-xl font-semibold hover:bg-batik-50 text-sm transition"
            >
              Batal
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl text-white font-semibold text-sm bg-gradient-to-r from-batik-700 to-batik-800 hover:from-batik-800 hover:to-batik-900 disabled:opacity-60 transition shadow"
            >
              {loading ? 'Menyimpan & Men-generate...' : 'Serahkan & Cetak Barcode'}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
