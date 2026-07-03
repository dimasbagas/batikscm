import { useState } from 'react'
import { getProducts, receiveProduct } from '../../lib/api'
import { Scan, Shield, CheckCircle, AlertTriangle, ArrowRight, Loader } from 'lucide-react'

export default function ReceiveProductPage() {
  const [tokenId, setTokenId] = useState('')
  const [loading, setLoading] = useState(false)
  const [product, setProduct] = useState<any | null>(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  async function handleCheckBatik(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setSuccess(false)
    setProduct(null)
    if (!tokenId.trim()) {
      setError('Harap masukkan Token ID atau Kode Unik Batik.')
      return
    }

    setLoading(true)
    try {
      // Fetch products and find the matching one
      const allProducts = await getProducts()
      const found = allProducts.find((p: any) => p.tokenId === tokenId.trim() || p.id === tokenId.trim())
      if (!found) {
        setError('Batik tidak ditemukan. Periksa kembali Token ID Anda.')
      } else if (found.status !== 'distributed') {
        setError(
          found.status === 'received' 
            ? 'Batik ini sudah diterima sebelumnya oleh toko/UMKM.' 
            : found.status === 'verified'
            ? 'Batik ini sudah selesai terverifikasi dan bersertifikat.'
            : 'Batik belum disalurkan/didistribusikan oleh distributor.'
        )
        setProduct(found)
      } else {
        setProduct(found)
      }
    } catch (err: any) {
      setError('Gagal memeriksa data batik. Pastikan server terhubung.')
    } finally {
      setLoading(false)
    }
  }

  async function handleConfirmReceipt() {
    if (!product) return
    setLoading(true)
    setError('')
    try {
      await receiveProduct(product.id)
      setSuccess(true)
      setProduct(null)
      setTokenId('')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gagal mengonfirmasi penerimaan barang.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-batik-950">Penerimaan Barang</h1>
        <p className="text-batik-500 text-sm mt-1">Konfirmasi penerimaan produk batik resmi via Kode Unik / Barcode</p>
      </div>

      <div className="bg-white rounded-xl border border-batik-100 p-6 space-y-4 shadow-sm">
        <form onSubmit={handleCheckBatik} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-batik-800 mb-1.5">
              Masukkan Token ID / Kode Unik Batik
            </label>
            <div className="relative">
              <Scan className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-batik-400" />
              <input 
                type="text" 
                value={tokenId} 
                onChange={e => setTokenId(e.target.value)}
                placeholder="Contoh: BTK-XXXXX atau Token ID"
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-batik-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-batik-300"
              />
            </div>
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-2.5 rounded-xl text-white font-semibold bg-gradient-to-r from-batik-700 to-batik-800 hover:from-batik-800 hover:to-batik-900 disabled:opacity-60 transition-all flex items-center justify-center gap-2"
          >
            {loading ? <Loader className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
            Periksa Batik
          </button>
        </form>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Perhatian</p>
              <p>{error}</p>
            </div>
          </div>
        )}

        {success && (
          <div className="p-4 bg-green-50 border border-green-200 text-green-800 text-xs rounded-xl flex items-start gap-2">
            <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-sm">Penerimaan Batik Berhasil Dikonfirmasi!</p>
              <p className="mt-1">Kepemilikan fisik batik telah tercatat atas nama toko/UMKM Anda di rantai pasok blockchain.</p>
            </div>
          </div>
        )}
      </div>

      {product && !success && (
        <div className="bg-white rounded-xl border border-batik-100 p-6 space-y-4 shadow-sm">
          <div className="border-b border-batik-100 pb-3">
            <h2 className="font-bold text-batik-900 text-base">Detail Produk Ditemukan</h2>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <img 
              src={product.imageUrl} 
              alt={product.productName} 
              className="w-24 h-24 rounded-xl object-cover border border-batik-200 mx-auto sm:mx-0"
              onError={e => {
                const target = e.target as HTMLImageElement;
                target.onerror = null;
                target.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64"><rect width="64" height="64" fill="%23f9edda"/><text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="24" fill="%237d421f">B</text></svg>';
              }}
            />
            <div className="flex-1 space-y-1 text-center sm:text-left">
              <h3 className="font-bold text-batik-900 text-lg">{product.productName}</h3>
              <p className="text-xs text-batik-500 font-mono">{product.tokenId}</p>
              <p className="text-xs text-batik-600">Produsen: <span className="font-semibold text-batik-800">{product.producerName}</span> &middot; {product.originLocation}</p>
              <p className="text-xs text-batik-600">Penyalur/Distributor: <span className="font-semibold text-batik-800">{product.distributorName}</span></p>
              <div className="pt-2 flex justify-center sm:justify-start">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  product.status === 'verified' ? 'bg-green-100 text-green-700' :
                  product.status === 'distributed' ? 'bg-orange-100 text-orange-700' :
                  product.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {product.status === 'verified' ? 'Terverifikasi' :
                   product.status === 'distributed' ? 'Siap Diterima' :
                   product.status === 'rejected' ? 'Ditolak' : 'Terdaftar di Pengrajin'}
                </span>
              </div>
            </div>
          </div>

          {product.status === 'distributed' && (
            <div className="pt-2 border-t border-batik-100">
              <button 
                onClick={handleConfirmReceipt}
                disabled={loading}
                className="w-full py-2.5 rounded-xl text-white font-semibold bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 disabled:opacity-60 transition-all flex items-center justify-center gap-1.5"
              >
                Konfirmasi Penerimaan Barang <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
