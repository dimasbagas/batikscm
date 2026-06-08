import { useState, useEffect } from 'react'
import { Users, Store, Package, ScrollText, Scan, Activity } from 'lucide-react'
import { getAdminStats } from '../../lib/api'
import type { AdminStats } from '../../types'

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats>({ totalUsers: 0, totalUmkm: 0, totalProducts: 0, totalCertificates: 0, totalVerifications: 0, recentProducts: [] })

  useEffect(() => { getAdminStats().then(setStats) }, [])

  const cards = [
    { label: 'Total Pengguna', value: stats.totalUsers, icon: Users, color: 'bg-blue-100 text-blue-700' },
    { label: 'UMKM Terdaftar', value: stats.totalUmkm, icon: Store, color: 'bg-green-100 text-green-700' },
    { label: 'Total Produk', value: stats.totalProducts, icon: Package, color: 'bg-purple-100 text-purple-700' },
    { label: 'Sertifikat', value: stats.totalCertificates, icon: ScrollText, color: 'bg-batik-100 text-batik-700' },
    { label: 'Verifikasi', value: stats.totalVerifications, icon: Scan, color: 'bg-orange-100 text-orange-700' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-batik-950">Admin Dashboard</h1>
        <p className="text-batik-500 text-sm mt-1">Statistik nasional platform BatikChain</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
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
        <div className="px-5 py-4 border-b border-batik-100 flex items-center gap-2">
          <Activity className="w-4 h-4 text-batik-600" />
          <h2 className="font-semibold text-batik-900">Produk Terbaru</h2>
        </div>
        <div className="p-5">
          {stats.recentProducts.length === 0 ? (
            <p className="text-sm text-batik-500 text-center py-6">Belum ada produk</p>
          ) : (
            <div className="space-y-3">
              {stats.recentProducts.map(p => (
                <div key={p.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-batik-50 transition-colors">
                  <img src={p.imageUrl} alt={p.productName}
                    className="w-12 h-12 rounded-lg object-cover border border-batik-200"
                    onError={e => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/48/f9edda/7d421f?text=B' }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-batik-900 truncate">{p.productName}</p>
                    <p className="text-xs text-batik-500">{p.producerName} &middot; {p.tokenId}</p>
                  </div>
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                    p.status === 'verified' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>{p.status === 'verified' ? 'Terverifikasi' : 'Terdaftar'}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
