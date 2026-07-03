import { useState, useEffect } from 'react'
import { useNavigate, Link, useSearchParams } from 'react-router-dom'
import { ArrowLeft, Search, CheckCircle, Package, Shield, Calendar, ArrowRight, Loader2 } from 'lucide-react'
import { getProductById, completeArtisanWork } from '../../lib/api'

export default function ArtisanCompletePage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const initialTokenId = searchParams.get('tokenId') || ''
  
  const [tokenId, setTokenId] = useState(initialTokenId)
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [product, setProduct] = useState<any>(null)
  const [error, setError] = useState('')
  const [successProduct, setSuccessProduct] = useState<any>(null)

  useEffect(() => {
    if (initialTokenId) {
      setLoading(true)
      getProductById(initialTokenId).then(prod => {
        if (!prod) {
          setError('Kain dengan Kode/Token ID tersebut tidak ditemukan.')
          return
        }
        if (prod.status !== 'fabric_issued') {
          setError('Kain ini berstatus ' + prod.status.toUpperCase() + ' (bukan KAIN MENTAH).')
          return
        }
        setProduct(prod)
      }).catch(err => {
        setError('Gagal memuat detail kain.')
      }).finally(() => {
        setLoading(false)
      })
    }
  }, [initialTokenId])

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (!tokenId.trim()) return

    setLoading(true)
    setError('')
    setProduct(null)
    try {
      const prod = await getProductById(tokenId.trim())
      if (!prod) {
        setError('Kain dengan Kode/Token ID tersebut tidak ditemukan.')
        return
      }
      if (prod.status !== 'fabric_issued') {
        setError(
          prod.status === 'registered'
            ? 'Batik ini sudah dikonfirmasi selesai pengerjaan.'
            : 'Produk ini sudah melewati tahap produksi (berstatus ' + prod.status.toUpperCase() + ').'
        )
        return
      }
      setProduct(prod)
    } catch (err: any) {
      console.error(err)
      setError('Terjadi kesalahan saat mencari kain mentah.')
    } finally {
      setLoading(false)
    }
  }

  async function handleComplete() {
    if (!product) return
    setSubmitting(true)
    setError('')
    try {
      const updated = await completeArtisanWork(product.id)
      setSuccessProduct(updated)
      setProduct(null)
    } catch (err: any) {
      console.error(err)
      setError(err.response?.data?.message || 'Gagal mengirimkan verifikasi. Coba lagi.')
    } finally {
      setSubmitting(false)
    }
  }

  if (successProduct) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="bg-white rounded-xl border border-batik-100 p-8 shadow-sm text-center space-y-6">
          <div className="w-16 h-16 bg-green-50 border border-green-200 rounded-full flex items-center justify-center mx-auto text-green-600">
            <CheckCircle className="w-10 h-10" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-batik-950">Batik Berhasil Disetor!</h1>
            <p className="text-batik-500 text-sm mt-1">
              Data pengerjaan batik telah tercatat dan produk berhasil didaftarkan ke blockchain.
            </p>
          </div>

          <div className="bg-batik-50/50 rounded-xl p-5 border border-batik-100 text-left space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-batik-500">Nama Batik / Kain:</span>
              <span className="font-semibold text-batik-950">{successProduct.productName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-batik-500">Token ID:</span>
              <span className="font-mono font-semibold text-batik-950">{successProduct.tokenId}</span>
            </div>
            {successProduct.transactionHash && (
              <div className="flex flex-col gap-1 border-t border-batik-100 pt-3">
                <span className="text-batik-500 text-xs">Transaction Hash (Blockchain):</span>
                <span className="font-mono text-xs text-batik-700 break-all">{successProduct.transactionHash}</span>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <button
              onClick={() => {
                setSuccessProduct(null)
                setTokenId('')
              }}
              className="px-6 py-2.5 rounded-xl border border-batik-300 font-semibold text-batik-800 hover:bg-batik-50 transition text-sm"
            >
              Setor Kain Lainnya
            </button>
            <Link
              to={`/verify/${successProduct.tokenId}`}
              className="inline-flex items-center justify-center gap-1.5 px-6 py-2.5 rounded-xl text-white font-semibold text-sm bg-gradient-to-r from-batik-700 to-batik-800 hover:from-batik-800 hover:to-batik-900 shadow-sm transition"
            >
              Lihat Timeline Publik <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/dashboard/products" className="text-batik-600 hover:text-batik-800">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-batik-950">Konfirmasi Setor Batik</h1>
          <p className="text-batik-500 text-sm">Pindai barcode pada kain untuk memverifikasi pengerjaan selesai</p>
        </div>
      </div>

      {/* Search Section */}
      <div className="bg-white rounded-xl border border-batik-100 p-5 shadow-sm space-y-4">
        <h3 className="font-semibold text-batik-900 text-sm">Masukkan Token ID / Scan Barcode</h3>
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-batik-400" />
            <input
              type="text"
              placeholder="Contoh: BC-2026-001"
              value={tokenId}
              onChange={e => setTokenId(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-batik-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-batik-300 font-semibold"
            />
          </div>
          <button
            type="submit"
            disabled={loading || submitting}
            className="px-5 py-2.5 bg-batik-750 text-white rounded-lg text-sm font-semibold hover:bg-batik-800 transition flex items-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Cari'}
          </button>
        </form>

        {error && <p className="text-red-500 text-xs mt-1 font-medium">{error}</p>}
      </div>

      {/* Product Details & Action Section */}
      {product && (
        <div className="bg-white rounded-xl border border-batik-100 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="px-5 py-4 border-b border-batik-100 flex items-center gap-2 bg-gradient-to-r from-batik-50 to-transparent">
            <Package className="w-4 h-4 text-batik-600" />
            <h2 className="font-semibold text-batik-900 text-sm">Data Kain Mentah ditemukan</h2>
          </div>
          <div className="p-5 space-y-6">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-batik-500 text-xs font-semibold uppercase tracking-wider">Nama Produk</p>
                <p className="font-bold text-batik-950 mt-0.5">{product.productName}</p>
              </div>
              <div>
                <p className="text-batik-500 text-xs font-semibold uppercase tracking-wider">Token ID</p>
                <p className="font-mono font-bold text-batik-950 mt-0.5">{product.tokenId}</p>
              </div>
              <div>
                <p className="text-batik-500 text-xs font-semibold uppercase tracking-wider">Distributor (Sentra)</p>
                <p className="font-bold text-batik-950 mt-0.5">{product.distributorName || 'Sentra Batik'}</p>
              </div>
              <div>
                <p className="text-batik-500 text-xs font-semibold uppercase tracking-wider">Tanggal Ambil</p>
                <p className="font-bold text-batik-950 mt-0.5 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-batik-400" />
                  {product.productionDate}
                </p>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3.5 text-amber-800 text-xs flex gap-2">
              <Shield className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <p>
                Menekan tombol konfirmasi di bawah akan mendaftarkan batik ini ke blockchain. Ini membuktikan Anda adalah pengrajin pembuat batik ini secara sah.
              </p>
            </div>

            <button
              onClick={handleComplete}
              disabled={submitting}
              className="w-full py-3 rounded-xl text-white font-bold text-sm bg-gradient-to-r from-batik-700 to-batik-800 hover:from-batik-800 hover:to-batik-900 shadow-md transition-all flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Mengirim & Mencatat di Blockchain...
                </>
              ) : (
                'Konfirmasi Selesai Pengerjaan (Setor ke Sentra)'
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
