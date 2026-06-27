import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Shield, CheckCircle2, XCircle, ArrowLeft } from 'lucide-react'
import { QRCode } from '../components/qr-code'
import { getProductById } from '../lib/api'
import type { Product } from '../types'

export default function VerifyPage() {
  const { productId } = useParams<{ productId: string }>()
  const [product, setProduct] = useState<Product | undefined>()
  useEffect(() => {
    if (productId) getProductById(productId).then(setProduct)
  }, [productId])

  return (
    <div className="min-h-screen bg-gradient-to-br from-batik-50 via-white to-batik-100">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-batik-600 hover:text-batik-800 mb-6">
          <ArrowLeft className="w-4 h-4" /> Kembali
        </Link>

        <div className="text-center mb-8">
          <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${
            !product ? 'bg-red-100' :
            product.status === 'verified' ? 'bg-green-100' :
            product.status === 'rejected' ? 'bg-red-100' : 'bg-yellow-100'
          }`}>
            {!product ? <XCircle className="w-8 h-8 text-red-600" /> :
             product.status === 'verified' ? <CheckCircle2 className="w-8 h-8 text-green-700" /> :
             product.status === 'rejected' ? <XCircle className="w-8 h-8 text-red-600" /> :
             <Shield className="w-8 h-8 text-yellow-700" />}
          </div>
          <h1 className={`text-2xl md:text-3xl font-bold ${
            !product ? 'text-red-800' :
            product.status === 'verified' ? 'text-green-800' :
            product.status === 'rejected' ? 'text-red-800' : 'text-yellow-800'
          }`}>
            {!product ? 'Produk Tidak Terverifikasi' :
             product.status === 'verified' ? 'Produk Asli — Terverifikasi' :
             product.status === 'rejected' ? 'Registrasi Produk Ditolak' : 'Produk Terdaftar'}
          </h1>
          <p className="text-batik-600 mt-2 text-sm">
            {!product ? 'Produk Tidak Terverifikasi atau Diduga Palsu' :
             product.status === 'verified' ? 'Produk ini terdaftar dan terverifikasi di BatikChain Indonesia' :
             product.status === 'rejected' ? 'Pengajuan sertifikasi produk ini ditolak.' :
             'Produk ini telah terdaftar tetapi belum terverifikasi secara on-chain di Blockchain.'}
          </p>
          {product && (
            <span className={`inline-block mt-3 px-4 py-1 rounded-full text-sm font-medium ${
              product.status === 'verified' ? 'bg-green-100 text-green-700' :
              product.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
            }`}>
              {product.status === 'verified' ? 'Terverifikasi di Blockchain' :
               product.status === 'rejected' ? 'Sertifikasi Ditolak' : 'Menunggu Verifikasi Blockchain'}
            </span>
          )}
        </div>

        {product && (
          <div className={`bg-white rounded-2xl border-2 p-6 md:p-8 shadow-lg space-y-5 ${
            product.status === 'verified' ? 'border-green-300' :
            product.status === 'rejected' ? 'border-red-300' : 'border-yellow-300'
          }`}>
            <div className="flex justify-center">
              <img src={product.imageUrl} alt={product.productName}
                className="w-40 h-40 md:w-48 md:h-48 object-cover rounded-2xl border-2 border-batik-200 shadow-md"
                onError={e => {
                  const target = e.target as HTMLImageElement;
                  target.onerror = null;
                  target.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="192" height="192" viewBox="0 0 192 192"><rect width="192" height="192" fill="%23f9edda"/><text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="72" fill="%237d421f">B</text></svg>';
                }} />
            </div>
            <div className="space-y-3 text-sm">
              {([
                ['Nama Produk', product.productName],
                ['Produsen', product.producerName],
                ['Daerah Asal', product.originLocation],
                ['Tanggal Produksi', product.productionDate],
                ['ID Produk', product.tokenId],
                ...(product.status === 'verified' && product.certificationDate ? [['Tanggal Sertifikasi', product.certificationDate]] : []),
                ...(product.status === 'verified' && product.contractAddress ? [['Contract Address', product.contractAddress]] : []),
                ...(product.status === 'verified' && product.transactionHash ? [['Tx Hash', product.transactionHash]] : []),
              ] as const).map(([label, value]) => (
                <div key={label} className="flex justify-between border-b border-batik-100 pb-2">
                  <span className="text-batik-600 font-medium">{label}</span>
                  <span className="text-batik-900 font-semibold text-right max-w-[60%] truncate font-mono">{value}</span>
                </div>
              ))}
              <div>
                <span className="text-batik-600 text-xs block mb-1 font-medium">Metadata Hash</span>
                <div className="hash-text bg-batik-50 text-[11px]">{product.metadataHash}</div>
              </div>
            </div>
            {product.status === 'verified' && (
              <div className="flex justify-center pt-2">
                <div className="bg-white p-4 rounded-xl shadow-md border border-batik-200 text-center">
                  <QRCode value={JSON.stringify({ tokenId: product.tokenId, hash: product.metadataHash })} size={140} />
                  <p className="text-xs text-batik-500 mt-2 font-medium">Scan QR Code Keaslian</p>
                </div>
              </div>
            )}
            <div className="text-center pt-2">
              <Link to="/"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-sm text-batik-700 border-2 border-batik-300 hover:bg-batik-50">
                <ArrowLeft className="w-4 h-4" /> Ke Halaman Utama
              </Link>
            </div>
          </div>
        )}

        {!product && (
          <div className="text-center">
            <Link to="/"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-white font-semibold bg-gradient-to-r from-batik-700 to-batik-800">
              Kembali ke Beranda
            </Link>
          </div>
        )}

        <footer className="text-center mt-10 text-xs text-batik-400">
          <p>BatikChain Indonesia — Sertifikasi Batik Blockchain</p>
        </footer>
      </div>
    </div>
  )
}
