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
          <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${product ? 'bg-green-100' : 'bg-red-100'}`}>
            {product ? <CheckCircle2 className="w-8 h-8 text-green-700" /> : <XCircle className="w-8 h-8 text-red-600" />}
          </div>
          <h1 className={`text-2xl md:text-3xl font-bold ${product ? 'text-green-800' : 'text-red-800'}`}>
            {product ? 'Produk Asli — Terverifikasi' : 'Produk Tidak Terverifikasi'}
          </h1>
          <p className="text-batik-600 mt-2 text-sm">
            {product
              ? 'Produk ini terdaftar dan terverifikasi di BatikChain Indonesia'
              : 'Produk Tidak Terverifikasi atau Diduga Palsu'}
          </p>
          {product && (
            <span className="inline-block mt-3 px-4 py-1 rounded-full text-sm font-medium bg-green-100 text-green-700">
              Terverifikasi di Blockchain
            </span>
          )}
        </div>

        {product && (
          <div className="bg-white rounded-2xl border-2 border-green-300 p-6 md:p-8 shadow-lg space-y-5">
            <div className="flex justify-center">
              <img src={product.imageUrl} alt={product.productName}
                className="w-40 h-40 md:w-48 md:h-48 object-cover rounded-2xl border-2 border-batik-200 shadow-md"
                onError={e => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/192/f9edda/7d421f?text=B' }} />
            </div>
            <div className="space-y-3 text-sm">
              {([
                ['Nama Produk', product.productName],
                ['Produsen', product.producerName],
                ['Daerah Asal', product.originLocation],
                ['Tanggal Produksi', product.productionDate],
                ['ID Produk', product.tokenId],
                ['Tanggal Sertifikasi', product.certificationDate],
              ] as const).map(([label, value]) => (
                <div key={label} className="flex justify-between border-b border-batik-100 pb-2">
                  <span className="text-batik-600 font-medium">{label}</span>
                  <span className="text-batik-900 font-semibold text-right max-w-[60%]">{value}</span>
                </div>
              ))}
              <div>
                <span className="text-batik-600 text-xs block mb-1 font-medium">Metadata Hash</span>
                <div className="hash-text bg-batik-50 text-[11px]">{product.metadataHash}</div>
              </div>
            </div>
            <div className="flex justify-center pt-2">
              <div className="bg-white p-4 rounded-xl shadow-md border border-batik-200">
                <QRCode value={JSON.stringify({ tokenId: product.tokenId, hash: product.metadataHash })} size={140} />
              </div>
            </div>
            <div className="text-center">
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
