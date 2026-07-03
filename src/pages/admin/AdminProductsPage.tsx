import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Search, Package } from 'lucide-react'
import { getProducts, getProductById, recordCertificate } from '../../lib/api'
import { useWeb3 } from '../../context/Web3Context'
import type { Product } from '../../types'

export default function AdminProductsPage() {
  const [search, setSearch] = useState('')
  const [products, setProducts] = useState<Product[]>([])
  const [verifying, setVerifying] = useState<string | null>(null)
  const { account, isConnected, connectWallet, getBatikContract } = useWeb3()

  useEffect(() => { getProducts().then(setProducts) }, [])

  async function handleVerifyProduct(productId: string) {
    let hasMetaMask = true;
    if (!isConnected) {
      const conn = await connectWallet()
      if (!conn) {
        hasMetaMask = false;
      }
    }

    if (!hasMetaMask) {
      if (!window.confirm('MetaMask tidak terdeteksi. Gunakan Mode Simulasi (Bypass Blockchain)?')) return;
      setVerifying(productId);
      try {
        const dummyTokenId = Math.floor(Math.random() * 1000) + 100;
        const dummyHash = "0x" + Array(64).fill(0).map(()=>Math.floor(Math.random()*16).toString(16)).join('');
        await recordCertificate(productId, dummyTokenId, dummyHash);
        alert('Simulasi Sertifikasi Berhasil! Status telah diperbarui.');
        const updated = await getProducts();
        setProducts(updated);
      } catch (e: any) {
        alert('Gagal simulasi: ' + e.message);
      } finally {
        setVerifying(null);
      }
      return;
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
      const updated = await getProducts()
      setProducts(updated)
    } catch (e: any) {
      console.error(e)
      const errorReason = e?.reason || e?.message || JSON.stringify(e)
      alert(`Gagal memverifikasi produk: ${errorReason}\n\nCatatan: Pastikan Anda menghubungkan MetaMask menggunakan akun Deployer/Owner Contract (Account #0 Hardhat) untuk mencetak sertifikat.`)
    } finally {
      setVerifying(null)
    }
  }

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
                <th className="text-left px-5 py-3 font-semibold text-batik-700">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id} className="border-b border-batik-50 hover:bg-batik-50/30">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <img src={p.imageUrl} alt={p.productName}
                        className="w-9 h-9 rounded-lg object-cover border border-batik-200"
                        onError={e => {
                          const target = e.target as HTMLImageElement;
                          target.onerror = null;
                          target.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36"><rect width="36" height="36" fill="%23f9edda"/><text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="14" fill="%237d421f">B</text></svg>';
                        }} />
                      <span className="font-medium text-batik-900">{p.productName}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 font-mono text-xs text-batik-600">{p.tokenId}</td>
                  <td className="px-5 py-3 text-batik-600">{p.producerName}</td>
                  <td className="px-5 py-3 text-batik-600">{p.originLocation}</td>
                  <td className="px-5 py-3">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                      p.status === 'verified' ? 'bg-green-100 text-green-700' :
                      p.status === 'distributed' ? 'bg-orange-100 text-orange-700' :
                      p.status === 'received' ? 'bg-blue-100 text-blue-700' :
                      p.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {p.status === 'verified' ? 'Terverifikasi' :
                       p.status === 'distributed' ? 'Didistribusikan' :
                       p.status === 'received' ? 'Diterima UMKM' :
                       p.status === 'rejected' ? 'Ditolak' : 'Terdaftar'}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-batik-500 text-xs">{p.certificationDate}</td>
                  <td className="px-5 py-3">
                    {p.status === 'registered' || p.status === 'distributed' || p.status === 'received' ? (
                      <button onClick={() => handleVerifyProduct(p.id)} disabled={verifying === p.id}
                        className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-batik-700 to-batik-800 text-white text-xs font-semibold hover:from-batik-800 hover:to-batik-900 disabled:opacity-60 transition-all">
                        {verifying === p.id ? 'Memproses...' : 'Verifikasi'}
                      </button>
                    ) : (
                      <span className="text-xs text-batik-400 font-medium">Selesai</span>
                    )}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="px-5 py-12 text-center text-batik-400">
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
