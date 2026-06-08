import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Search, Package } from 'lucide-react'
import { getProducts } from '../../lib/api'
import type { Product } from '../../types'

export default function AdminProductsPage() {
  const [search, setSearch] = useState('')
  const [products, setProducts] = useState<Product[]>([])

  useEffect(() => { getProducts().then(setProducts) }, [])

  const filtered = products.filter(p =>
    p.productName.toLowerCase().includes(search.toLowerCase()) ||
    p.tokenId.toLowerCase().includes(search.toLowerCase()) ||
    p.producerName.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-batik-950">Semua Produk</h1>
        <p className="text-batik-500 text-sm mt-1">Seluruh produk yang terdaftar ({products.length})</p>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-batik-400" />
        <input type="text" placeholder="Cari produk, token ID, atau produsen..." value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-batik-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-batik-300" />
      </div>

      <div className="bg-white rounded-xl border border-batik-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-batik-100 bg-batik-50/50">
                <th className="text-left px-5 py-3 font-semibold text-batik-700">Produk</th>
                <th className="text-left px-5 py-3 font-semibold text-batik-700">Token ID</th>
                <th className="text-left px-5 py-3 font-semibold text-batik-700">Produsen</th>
                <th className="text-left px-5 py-3 font-semibold text-batik-700">Asal</th>
                <th className="text-left px-5 py-3 font-semibold text-batik-700">Status</th>
                <th className="text-left px-5 py-3 font-semibold text-batik-700">Tanggal</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id} className="border-b border-batik-50 hover:bg-batik-50/30">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <img src={p.imageUrl} alt={p.productName}
                        className="w-9 h-9 rounded-lg object-cover border border-batik-200"
                        onError={e => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/36/f9edda/7d421f?text=B' }} />
                      <span className="font-medium text-batik-900">{p.productName}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 font-mono text-xs text-batik-600">{p.tokenId}</td>
                  <td className="px-5 py-3 text-batik-600">{p.producerName}</td>
                  <td className="px-5 py-3 text-batik-600">{p.originLocation}</td>
                  <td className="px-5 py-3">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                      p.status === 'verified' ? 'bg-green-100 text-green-700' :
                      p.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {p.status === 'verified' ? 'Terverifikasi' : p.status === 'rejected' ? 'Ditolak' : 'Terdaftar'}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-batik-500 text-xs">{p.certificationDate}</td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="px-5 py-12 text-center text-batik-400">
                  <Package className="w-8 h-8 mx-auto mb-2" />
                  <p>Tidak ada produk ditemukan</p>
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
