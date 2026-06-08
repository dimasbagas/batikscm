import { useState, useEffect, useRef } from 'react'
import { ScrollText, Printer, Download } from 'lucide-react'
import { getProducts } from '../../lib/api'
import { QRCode } from '../../components/qr-code'
import type { Product } from '../../types'

export default function CertificatesPage() {
  const [products, setProducts] = useState<Product[]>([])
  useEffect(() => { getProducts().then(setProducts) }, [])
  const certRefs = useRef<Record<string, HTMLDivElement | null>>({})

  function handlePrint() { window.print() }

  function handleDownload(product: (typeof products)[0]) {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    canvas.width = 800; canvas.height = 600
    ctx.fillStyle = '#fdf6ed'; ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.strokeStyle = '#7d421f'; ctx.lineWidth = 6; ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20)
    ctx.strokeStyle = '#d4862e'; ctx.lineWidth = 2; ctx.strokeRect(22, 22, canvas.width - 44, canvas.height - 44)
    ctx.fillStyle = '#3a1c0d'
    ctx.font = 'bold 26px Georgia, serif'; ctx.textAlign = 'center'
    ctx.fillText('Certificate of Authenticity', canvas.width / 2, 70)
    ctx.fillStyle = '#7d421f'; ctx.font = '14px Georgia, serif'
    ctx.fillText('Indonesian Traditional Batik', canvas.width / 2, 95)
    ctx.fillStyle = '#3a1c0d'; ctx.font = '15px Inter, sans-serif'; ctx.textAlign = 'left'
    const data = [
      ['Product Name', product.productName],
      ['Producer', product.producerName],
      ['Origin', product.originLocation],
      ['Production Date', product.productionDate],
      ['Token ID', product.tokenId],
      ['Certification Date', product.certificationDate],
    ]
    let y = 140
    data.forEach(([l, v]) => {
      ctx.fillStyle = '#7d421f'; ctx.font = 'bold 13px Inter'; ctx.fillText(l, 60, y)
      ctx.fillStyle = '#3a1c0d'; ctx.font = '13px Inter'; ctx.fillText(': ' + v, 200, y)
      y += 30
    })
    ctx.fillStyle = '#7d421f'; ctx.font = '10px monospace'
    ctx.fillText('Metadata Hash: ' + product.metadataHash.substring(0, 50) + '...', 60, y + 15)
    const link = document.createElement('a')
    link.download = `Certificate_${product.tokenId}.png`; link.href = canvas.toDataURL('image/png'); link.click()
  }

  if (products.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-batik-950">Sertifikat</h1>
        <div className="bg-white rounded-xl border border-batik-100 p-12 text-center text-batik-400">
          <ScrollText className="w-12 h-12 mx-auto mb-3" />
          <p className="font-medium">Belum ada sertifikat</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-batik-950">Sertifikat</h1>
      <p className="text-batik-500 text-sm -mt-4">{products.length} sertifikat tersedia</p>
      <div className="grid gap-6">
        {[...products].reverse().map(p => (
          <div key={p.id} className="certificate-border p-6 md:p-8 bg-white">
            <div className="flex justify-end gap-2 mb-4 no-print">
              <button onClick={handlePrint}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-batik-600 border border-batik-200 hover:bg-batik-50">
                <Printer className="w-4 h-4" /> Print
              </button>
              <button onClick={() => handleDownload(p)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-batik-600 border border-batik-200 hover:bg-batik-50">
                <Download className="w-4 h-4" /> Download
              </button>
            </div>
            <div className="text-center mb-5">
              <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-batik-100 flex items-center justify-center">
                <svg className="w-6 h-6 text-batik-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
                </svg>
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-batik-900">Certificate of Authenticity</h2>
              <p className="text-batik-600 text-sm font-medium">Indonesian Traditional Batik</p>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <img src={p.imageUrl} alt={p.productName}
                  className="w-full aspect-square object-cover rounded-xl border-2 border-batik-200"
                  onError={e => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300/f9edda/7d421f?text=B' }} />
                <div className="space-y-1.5 text-sm">
                  {[
                    ['Product Name', p.productName],
                    ['Producer', p.producerName],
                    ['Origin', p.originLocation],
                    ['Production Date', p.productionDate],
                  ].map(([l, v]) => (
                    <div key={l} className="flex justify-between border-b border-batik-100 pb-1">
                      <span className="text-batik-600 font-medium">{l}</span>
                      <span className="text-batik-900 font-semibold text-right">{v}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex flex-col items-center justify-center space-y-4">
                <div className="bg-white p-3 rounded-xl shadow-md border border-batik-200">
                  <QRCode value={JSON.stringify({ tokenId: p.tokenId, hash: p.metadataHash })} size={140} />
                </div>
                <p className="text-xs text-batik-500">Scan untuk verifikasi</p>
                <div className="w-full space-y-2 bg-batik-50/50 p-4 rounded-xl border border-batik-100">
                  <div className="flex justify-between text-sm">
                    <span className="text-batik-600">Token ID</span>
                    <span className="text-batik-900 font-bold font-mono">{p.tokenId}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-batik-600">Cert. Date</span>
                    <span className="text-batik-900 font-medium">{p.certificationDate}</span>
                  </div>
                  <div>
                    <span className="text-batik-600 text-xs block mb-1">Metadata Hash</span>
                    <div className="hash-text text-[10px]">{p.metadataHash}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
