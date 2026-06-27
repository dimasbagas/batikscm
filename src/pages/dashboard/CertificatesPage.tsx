import { useState, useEffect, useRef } from 'react'
import { ScrollText, Printer, Download } from 'lucide-react'
import { getProducts } from '../../lib/api'
import { QRCode } from '../../components/qr-code'
import type { Product } from '../../types'
import * as QRCodeLib from 'qrcode'

const loadImage = (src: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = (e) => reject(e)
    img.src = src
  })
}

export default function CertificatesPage() {
  const [products, setProducts] = useState<Product[]>([])
  useEffect(() => { getProducts().then(setProducts) }, [])
  const certRefs = useRef<Record<string, HTMLDivElement | null>>({})

  function handlePrint() { window.print() }

  async function handleDownload(product: (typeof products)[0]) {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    canvas.width = 800; canvas.height = 600
    
    // Background and border
    ctx.fillStyle = '#fdf6ed'; ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.strokeStyle = '#7d421f'; ctx.lineWidth = 6; ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20)
    ctx.strokeStyle = '#d4862e'; ctx.lineWidth = 2; ctx.strokeRect(22, 22, canvas.width - 44, canvas.height - 44)
    
    // Title
    ctx.fillStyle = '#3a1c0d'
    ctx.font = 'bold 26px Georgia, serif'; ctx.textAlign = 'center'
    ctx.fillText('Certificate of Authenticity', canvas.width / 2, 70)
    ctx.fillStyle = '#7d421f'; ctx.font = '14px Georgia, serif'
    ctx.fillText('Indonesian Traditional Batik', canvas.width / 2, 95)
    
    // --- Left Column: Product Image & Metadata ---
    let productImg: HTMLImageElement;
    try {
      productImg = await loadImage(product.imageUrl)
    } catch {
      const fallbackSvg = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300"><rect width="300" height="300" fill="%23f9edda"/><text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="120" fill="%237d421f">B</text></svg>';
      productImg = await loadImage(fallbackSvg)
    }
    
    // Draw Product Image
    ctx.drawImage(productImg, 60, 130, 300, 300)
    
    // Draw image border
    ctx.strokeStyle = '#e8d0bc'
    ctx.lineWidth = 2
    ctx.strokeRect(60, 130, 300, 300)
    
    // Draw table under product image
    const data = [
      ['Product Name', product.productName],
      ['Producer', product.producerName],
      ['Origin', product.originLocation],
      ['Production Date', product.productionDate],
    ]
    
    ctx.textAlign = 'left'
    let y = 460
    data.forEach(([l, v]) => {
      // Draw border bottom line
      ctx.strokeStyle = '#f2e5d5'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(60, y + 5)
      ctx.lineTo(360, y + 5)
      ctx.stroke()
      
      ctx.fillStyle = '#7d421f'; ctx.font = 'bold 12px Inter, sans-serif'
      ctx.fillText(l, 60, y)
      
      ctx.fillStyle = '#3a1c0d'; ctx.font = 'bold 12px Inter, sans-serif'
      ctx.textAlign = 'right'
      ctx.fillText(v, 360, y)
      ctx.textAlign = 'left' // reset
      y += 24
    })
    
    // --- Right Column: QR Code & Info Box ---
    const qrCanvas = document.createElement('canvas')
    const qr = (QRCodeLib as any).toCanvas ? QRCodeLib : ((QRCodeLib as any).default || QRCodeLib);
    await qr.toCanvas(qrCanvas, JSON.stringify({ tokenId: product.tokenId, hash: product.metadataHash }), {
      width: 160,
      color: { dark: '#7d421f', light: '#ffffff' },
      margin: 1,
    })
    
    // Draw QR Code
    ctx.drawImage(qrCanvas, 510, 130, 160, 160)
    
    // Draw text below QR Code
    ctx.fillStyle = '#7d421f'; ctx.font = '12px Inter, sans-serif'; ctx.textAlign = 'center'
    ctx.fillText('Scan untuk verifikasi', 590, 310)
    
    // Info Box
    const boxX = 440, boxY = 340, boxW = 300, boxH = 195
    ctx.fillStyle = '#fcf8f2'
    ctx.fillRect(boxX, boxY, boxW, boxH)
    ctx.strokeStyle = '#e8d0bc'
    ctx.lineWidth = 1
    ctx.strokeRect(boxX, boxY, boxW, boxH)
    
    // Write contents inside Info Box
    ctx.textAlign = 'left'
    
    // Token ID
    ctx.fillStyle = '#7d421f'; ctx.font = '12px Inter, sans-serif'
    ctx.fillText('Token ID', boxX + 15, boxY + 30)
    ctx.fillStyle = '#3a1c0d'; ctx.font = 'bold 12px monospace'; ctx.textAlign = 'right'
    ctx.fillText(product.tokenId, boxX + boxW - 15, boxY + 30)
    
    // Cert Date
    ctx.textAlign = 'left'
    ctx.fillStyle = '#7d421f'; ctx.font = '12px Inter, sans-serif'
    ctx.fillText('Cert. Date', boxX + 15, boxY + 60)
    ctx.fillStyle = '#3a1c0d'; ctx.font = '500 12px Inter, sans-serif'; ctx.textAlign = 'right'
    ctx.fillText(product.certificationDate || '-', boxX + boxW - 15, boxY + 60)
    
    // Metadata Hash
    ctx.textAlign = 'left'
    ctx.fillStyle = '#7d421f'; ctx.font = '12px Inter, sans-serif'
    ctx.fillText('Metadata Hash', boxX + 15, boxY + 95)
    
    // Value of Hash (split in 2 lines for wrapping)
    ctx.fillStyle = '#7d421f'; ctx.font = '10px monospace'
    const hash = product.metadataHash || ''
    const line1 = hash.substring(0, 32)
    const line2 = hash.substring(32)
    ctx.fillText(line1, boxX + 15, boxY + 120)
    ctx.fillText(line2, boxX + 15, boxY + 135)
    
    // Trigger download
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
                  onError={e => {
                    const target = e.target as HTMLImageElement;
                    target.onerror = null;
                    target.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300"><rect width="300" height="300" fill="%23f9edda"/><text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="120" fill="%237d421f">B</text></svg>';
                  }} />
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
