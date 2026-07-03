import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Package, ScrollText, Scan, ShieldCheck } from 'lucide-react'
import { getDashboardStats } from '../../lib/api'
import type { DashboardStats } from '../../types'
import { useAuth } from '../../context/AuthContext'

export default function DashboardPage() {
  const { user } = useAuth()
  const [stats, setStats] = useState<DashboardStats>({ totalProducts: 0, totalCertificates: 0, totalScans: 0, verifiedProducts: 0, recentProducts: [] })

  useEffect(() => {
    getDashboardStats().then(setStats)
  }, [])

  const cards = [
    { label: 'Total Produk', value: stats.totalProducts, icon: Package, color: 'bg-blue-100 text-blue-700' },
    { label: 'Sertifikat', value: stats.totalCertificates, icon: ScrollText, color: 'bg-green-100 text-green-700' },
    { label: 'Total Scan', value: stats.totalScans, icon: Scan, color: 'bg-purple-100 text-purple-700' },
    { label: 'Terverifikasi', value: stats.verifiedProducts, icon: ShieldCheck, color: 'bg-batik-100 text-batik-700' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-batik-950">Dashboard</h1>
        <p className="text-batik-500 text-sm mt-1">Selamat datang, {user?.umkmName || user?.name}</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map(c => {
          const Icon = c.icon
          return (
            <div key={c.label} className="bg-white rounded-xl border border-batik-100 p-5 flex items-center gap-4">
              <div className={`w-11 h-11 rounded-xl ${c.color} flex items-center justify-center`}>
                <Icon className="w-5.5 h-5.5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-batik-950">{c.value}</p>
                <p className="text-xs text-batik-500">{c.label}</p>
              </div>
            </div>
          )
        })}
      </div>

      <div className="bg-white rounded-xl border border-batik-100">
        <div className="px-5 py-4 border-b border-batik-100">
          <h2 className="font-semibold text-batik-900">Produk Terbaru</h2>
        </div>
        <div className="p-5">
          {stats.recentProducts.length === 0 ? (
            <p className="text-sm text-batik-500 text-center py-6">
              {user?.role === 'umkm' 
                ? 'Belum ada produk diterima. Gunakan menu Terima Barang untuk menerima produk batik baru!' 
                : 'Belum ada produk. Daftarkan produk pertama Anda!'}
            </p>
          ) : (
            <div className="space-y-3">
              {stats.recentProducts.map(p => (
                <Link key={p.id} to={user?.role === 'umkm' ? '/dashboard/receive' : '/dashboard/products'}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-batik-50 transition-colors">
                  <img src={p.imageUrl} alt={p.productName}
                    className="w-12 h-12 rounded-lg object-cover border border-batik-200"
                    onError={e => {
                      const target = e.target as HTMLImageElement;
                      target.onerror = null;
                      target.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48"><rect width="48" height="48" fill="%23f9edda"/><text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="18" fill="%237d421f">B</text></svg>';
                    }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-batik-900 truncate">{p.productName}</p>
                    <p className="text-xs text-batik-500">{p.tokenId} &middot; {p.certificationDate}</p>
                  </div>
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                    p.status === 'verified' ? 'bg-green-100 text-green-700' :
                    p.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {p.status === 'verified' ? 'Terverifikasi' : p.status === 'rejected' ? 'Ditolak' : 'Terdaftar'}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
