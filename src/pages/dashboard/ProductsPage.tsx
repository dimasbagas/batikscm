import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Search, Package } from 'lucide-react'
import { getProducts } from '../../lib/api'
import type { Product } from '../../types'

export default function ProductsPage() {
  const [search, setSearch] = useState('')
  const [products, setProducts] = useState<Product[]>([])

  useEffect(() => { getProducts().then(setProducts) }, [])
  const filtered = products.filter(p =>
    p.productName.toLowerCase().includes(search.toLowerCase()) ||
    p.tokenId.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-batik-950">Produk</h1>
          <p className="text-batik-500 text-sm mt-1">Kelola produk batik Anda ({products.length})</p>
        </div>
        <Link to="/dashboard/products/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-white font-semibold text-sm bg-gradient-to-r from-batik-700 to-batik-800 hover:from-batik-800 hover:to-batik-900">
          <Plus className="w-4 h-4" /> Tambah Produk
        </Link>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-batik-400" />
        <input type="text" placeholder="Cari produk atau token ID..." value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-batik-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-batik-300" />
      </div>

      <div className="grid gap-4">
        {filtered.length === 0 ? (
          <div className="bg-white rounded-xl border border-batik-100 p-12 text-center text-batik-400">
            <Package className="w-12 h-12 mx-auto mb-3" />
            <p className="font-medium">Tidak ada produk ditemukan</p>
          </div>
        ) : filtered.map(p => (
          <Link key={p.id} to="/dashboard/certificates"
            className="bg-white rounded-xl border border-batik-100 p-4 flex items-center gap-4 hover:border-batik-300 transition-colors">
            <img src={p.imageUrl} alt={p.productName}
              className="w-16 h-16 rounded-xl object-cover border border-batik-200"
              onError={e => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/64/f9edda/7d421f?text=B' }} />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-batik-900">{p.productName}</p>
              <p className="text-xs text-batik-500 font-mono mt-0.5">{p.tokenId}</p>
              <p className="text-xs text-batik-500 mt-0.5">{p.producerName} &middot; {p.originLocation}</p>
            </div>
            <div className="text-right text-xs text-batik-500 hidden sm:block">
              <p>{p.certificationDate}</p>
            </div>
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
              p.status === 'verified' ? 'bg-green-100 text-green-700' :
              p.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
            }`}>
              {p.status === 'verified' ? 'Terverifikasi' : p.status === 'rejected' ? 'Ditolak' : 'Terdaftar'}
            </span>
          </Link>
        ))}
      </div>
    </div>
  )
}
