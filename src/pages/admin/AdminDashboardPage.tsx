import { useState, useEffect } from 'react'
import { Users, Store, Package, ScrollText, Scan, Activity } from 'lucide-react'
import { getAdminStats, getProductById, recordCertificate } from '../../lib/api'
import { useWeb3 } from '../../context/Web3Context'
import type { AdminStats } from '../../types'

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats>({ totalUsers: 0, totalUmkm: 0, totalProducts: 0, totalCertificates: 0, totalVerifications: 0, recentProducts: [] })
  const [verifying, setVerifying] = useState<string | null>(null)
  const { account, isConnected, connectWallet, getBatikContract } = useWeb3()

  useEffect(() => { getAdminStats().then(setStats) }, [])

  async function handleVerifyProduct(productId: string) {
    if (!isConnected) {
      const conn = await connectWallet()
      if (!conn) {
        alert('Hubungkan MetaMask terlebih dahulu untuk memverifikasi produk ke Blockchain.')
        return
      }
    }

    if (!window.confirm('Apakah Anda yakin ingin memverifikasi produk ini ke Blockchain via MetaMask?')) return
    setVerifying(productId)

    try {
      const product = await getProductById(productId)
      if (!product) throw new Error('Produk tidak ditemukan')

      const contract = await getBatikContract()
      if (!contract) throw new Error('Gagal menghubungkan smart contract. Pastikan Hardhat node aktif.')

      let onChainTokenId = product.onChainTokenId ? Number(product.onChainTokenId) : null

      if (!onChainTokenId) {
        console.log('Registering product on-chain...')
        const regTx = await contract.registerProduct(
          product.productName,
          product.producerName,
          product.originLocation,
          product.metadataHash,
          product.imageUrl || ''
        )
        const regReceipt = await regTx.wait()

        const regEvent = regReceipt.logs
          .map((log: any) => {
            try {
              return contract.interface.parseLog(log)
            } catch {
              return null
            }
          })
          .find((e: any) => e && e.name === 'ProductRegistered')

        if (!regEvent) throw new Error('ProductRegistered event tidak ditemukan di blockchain receipt')
        onChainTokenId = Number(regEvent.args.tokenId)
      }

      console.log('Minting certificate NFT on-chain...')
      const certUri = `http://localhost:3000/api/v1/metadata/${product.tokenId}`
      const mintTx = await contract.mintCertificate(onChainTokenId, account, certUri)
      const mintReceipt = await mintTx.wait()

      await recordCertificate(productId, onChainTokenId, mintReceipt.hash)

      alert(`Sertifikat (Token ID: ${product.tokenId}) berhasil diterbitkan ke Blockchain via MetaMask!`)
      const updated = await getAdminStats()
      setStats(updated)
    } catch (e: any) {
      console.error(e)
      const errorReason = e?.reason || e?.message || JSON.stringify(e)
      alert(`Gagal memverifikasi produk: ${errorReason}\n\nCatatan: Pastikan Anda menghubungkan MetaMask menggunakan akun Deployer/Owner Contract (Account #0 Hardhat) untuk mencetak sertifikat.`)
    } finally {
      setVerifying(null)
    }
  }

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

      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-5 flex items-start gap-4 shadow-sm">
        <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center text-amber-800 shrink-0">
          <Scan className="w-5 h-5 animate-pulse" />
        </div>
        <div className="space-y-1">
          <h3 className="font-semibold text-batik-950 text-sm">Alur Verifikasi Blockchain BatikChain</h3>
          <p className="text-xs text-batik-700 leading-relaxed">
            Setiap produk batik baru didaftarkan oleh produsen/UMKM dengan status <strong className="text-amber-800 font-semibold">Terdaftar</strong> (belum masuk blockchain). 
            Untuk memasukkannya ke dalam blockchain, Admin/Verifikator harus menekan tombol <strong className="text-batik-950 font-semibold">"Verifikasi"</strong>. 
            Proses ini akan menerbitkan Sertifikat Keaslian berupa NFT di smart contract secara permanen melalui **MetaMask** (pastikan terhubung menggunakan akun Deployer/Owner Contract), menghasilkan Token ID unik, dan memperbarui status batik menjadi <strong className="text-green-800 font-semibold">Terverifikasi</strong>.
          </p>
        </div>
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
                    onError={e => {
                      const target = e.target as HTMLImageElement;
                      target.onerror = null;
                      target.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48"><rect width="48" height="48" fill="%23f9edda"/><text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="18" fill="%237d421f">B</text></svg>';
                    }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-batik-900 truncate">{p.productName}</p>
                    <p className="text-xs text-batik-500">{p.producerName} &middot; {p.tokenId}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                      p.status === 'verified' ? 'bg-green-100 text-green-700' :
                      p.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>{p.status === 'verified' ? 'Terverifikasi' : p.status === 'rejected' ? 'Ditolak' : 'Terdaftar'}</span>
                    {p.status === 'registered' && (
                      <button onClick={() => handleVerifyProduct(p.id)} disabled={verifying === p.id}
                        className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-batik-700 to-batik-800 text-white text-xs font-semibold hover:from-batik-800 hover:to-batik-900 disabled:opacity-60 transition-all shadow-sm">
                        {verifying === p.id ? 'Memproses...' : 'Verifikasi'}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
