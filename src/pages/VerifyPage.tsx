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
                ['ID Produk', product.tokenId],
                ['Status Registrasi', product.status === 'verified' ? 'Terverifikasi' : product.status === 'distributed' ? 'Didistribusikan' : 'Terdaftar'],
              ] as const).map(([label, value]) => (
                <div key={label} className="flex justify-between border-b border-batik-100 pb-2">
                  <span className="text-batik-600 font-medium">{label}</span>
                  <span className="text-batik-900 font-semibold text-right max-w-[60%] truncate">{value}</span>
                </div>
              ))}
              <div>
                <span className="text-batik-600 text-xs block mb-1 font-medium">Metadata Hash Terkunci</span>
                <div className="hash-text bg-batik-50 text-[11px] font-mono p-2 rounded border border-batik-100 break-all">{product.metadataHash}</div>
              </div>
            </div>

            {/* Timeline Rantai Pasok */}
            <div className="space-y-4 pt-4 border-t border-batik-100 text-left">
              <h3 className="text-sm font-bold text-batik-900 uppercase tracking-wider">Alur Rantai Pasok (Supply Chain)</h3>
              <div className="relative border-l border-batik-200 pl-5 ml-2.5 space-y-5">
                
                {/* Tahap 1: Penyerahan Kain Mentah */}
                <div className="relative">
                  <div className="absolute -left-[25px] top-1.5 w-2.5 h-2.5 rounded-full bg-blue-600 border-2 border-white"></div>
                  <div>
                    <h4 className="text-xs font-bold text-batik-900 uppercase">Tahap 1: Penyerahan Kain Mentah (Bahan Baku)</h4>
                    <div className="bg-batik-50/50 rounded-lg p-2.5 mt-1.5 space-y-1 text-xs">
                      <p><span className="font-semibold text-batik-600">Pemberi (Sentra):</span> {product.distributorName || 'Sentra Batik'}</p>
                      <p><span className="font-semibold text-batik-600">Penerima (Pengrajin):</span> {product.producerName}</p>
                      <p><span className="font-semibold text-batik-600">Tanggal Serah:</span> {product.productionDate}</p>
                    </div>
                  </div>
                </div>

                {/* Tahap 2: Pengerjaan oleh Pengrajin */}
                <div className="relative">
                  <div className={`absolute -left-[25px] top-1.5 w-2.5 h-2.5 rounded-full border-2 border-white ${
                    product.status !== 'fabric_issued' ? 'bg-green-600' : 'bg-yellow-500 animate-pulse'
                  }`}></div>
                  <div>
                    <h4 className="text-xs font-bold text-batik-900 uppercase">Tahap 2: Pengerjaan & Registrasi oleh Pengrajin</h4>
                    {product.status === 'fabric_issued' ? (
                      <p className="text-xs text-yellow-600 font-semibold mt-1">⏳ Sedang dikerjakan oleh Pengrajin di rumah...</p>
                    ) : (
                      <div className="bg-batik-50/50 rounded-lg p-2.5 mt-1.5 space-y-1 text-xs">
                        <p className="text-green-700 font-semibold">✓ Selesai Dikerjakan & Didaftarkan</p>
                        <p><span className="font-semibold text-batik-600">Daerah Asal Produksi:</span> {product.originLocation}</p>
                        {product.transactionHash && (
                          <p className="truncate"><span className="font-semibold text-batik-600">Registrasi Tx:</span> <span className="font-mono text-[10px] text-batik-500">{product.transactionHash}</span></p>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Tahap 3: Distribusi oleh Sentra */}
                <div className="relative">
                  <div className={`absolute -left-[25px] top-1.5 w-2.5 h-2.5 rounded-full border-2 border-white ${
                    ['distributed', 'received', 'verified'].includes(product.status) ? 'bg-orange-500' : 'bg-gray-300'
                  }`}></div>
                  <div>
                    <h4 className="text-xs font-bold text-batik-900 uppercase">Tahap 3: Distribusi & Unggah Gambar Fisik oleh Sentra</h4>
                    {['distributed', 'received', 'verified'].includes(product.status) ? (
                      <div className="bg-batik-50/50 rounded-lg p-2.5 mt-1.5 space-y-1 text-xs">
                        <p><span className="font-semibold text-batik-600">Distributor:</span> {product.distributorName}</p>
                        <p><span className="font-semibold text-batik-600">Tanggal Distribusi:</span> {product.distributedAt}</p>
                        {product.distributorTxHash && (
                          <p className="truncate"><span className="font-semibold text-batik-600">Distribusi Tx:</span> <span className="font-mono text-[10px] text-batik-500">{product.distributorTxHash}</span></p>
                        )}
                      </div>
                    ) : (
                      <p className="text-xs text-batik-400 mt-1">⏳ Menunggu penyelesaian pengerjaan & pengiriman ke Sentra...</p>
                    )}
                  </div>
                </div>

                {/* Tahap 4: Penerimaan oleh Toko / UMKM */}
                <div className="relative">
                  <div className={`absolute -left-[25px] top-1.5 w-2.5 h-2.5 rounded-full border-2 border-white ${
                    ['received', 'verified'].includes(product.status) ? 'bg-purple-600' : 'bg-gray-300'
                  }`}></div>
                  <div>
                    <h4 className="text-xs font-bold text-batik-900 uppercase">Tahap 4: Penerimaan Fisik oleh UMKM / Toko</h4>
                    {['received', 'verified'].includes(product.status) ? (
                      <div className="bg-batik-50/50 rounded-lg p-2.5 mt-1.5 space-y-1 text-xs">
                        <p><span className="font-semibold text-batik-600">Toko/UMKM Penerima:</span> {(product as any).recipientName || 'Toko Resmi'}</p>
                        <p><span className="font-semibold text-batik-600">Tanggal Diterima:</span> {(product as any).receivedAt ? new Date((product as any).receivedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Selesai'}</p>
                      </div>
                    ) : (
                      <p className="text-xs text-batik-400 mt-1">⏳ Menunggu penerimaan fisik barang oleh Toko/UMKM...</p>
                    )}
                  </div>
                </div>

                {/* Tahap 5: Sertifikasi Resmi Admin */}
                <div className="relative">
                  <div className={`absolute -left-[25px] top-1.5 w-2.5 h-2.5 rounded-full border-2 border-white ${
                    product.status === 'verified' ? 'bg-green-600' : 'bg-gray-300'
                  }`}></div>
                  <div>
                    <h4 className="text-xs font-bold text-batik-900 uppercase">Tahap 5: Sertifikasi Resmi & Minting NFT (Admin)</h4>
                    {product.status === 'verified' ? (
                      <div className="bg-batik-50/50 rounded-lg p-2.5 mt-1.5 space-y-1 text-xs">
                        <p><span className="font-semibold text-batik-600">Tanggal Sertifikasi:</span> {product.certificationDate}</p>
                        {product.contractAddress && <p className="truncate"><span className="font-semibold text-batik-600">Contract Address:</span> <span className="font-mono text-[10px] text-batik-500">{product.contractAddress}</span></p>}
                      </div>
                    ) : (
                      <p className="text-xs text-batik-400 mt-1">⏳ Menunggu verifikasi keaslian & penerbitan sertifikat resmi...</p>
                    )}
                  </div>
                </div>

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
