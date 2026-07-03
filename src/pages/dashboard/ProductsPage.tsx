import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Plus, Search, Package, ArrowRight, Users, Phone, MapPin, Mail, CheckCircle } from 'lucide-react'
import { getProducts, getPartnerPengrajin } from '../../lib/api'
import { useAuth } from '../../context/AuthContext'
import type { Product } from '../../types'
import { QRCode } from '../../components/qr-code'

export default function ProductsPage() {
  const [search, setSearch] = useState('')
  const [products, setProducts] = useState<Product[]>([])
  const [partnerPengrajins, setPartnerPengrajins] = useState<any[]>([])
  const [printProduct, setPrintProduct] = useState<Product | null>(null)
  const { user } = useAuth()
  const navigate = useNavigate()
  
  const isDistributor = user?.role?.toLowerCase() === 'distributor'
  const isPengrajin = user?.role?.toLowerCase() === 'pengrajin'
  const isUMKM = user?.role?.toLowerCase() === 'umkm'

  const [activeTab, setActiveTab] = useState<'fabric_issued' | 'registered' | 'distributed' | 'pengrajin'>('fabric_issued')

  useEffect(() => {
    getProducts().then(setProducts)
    if (user?.role?.toLowerCase() === 'distributor') {
      getPartnerPengrajin().then(setPartnerPengrajins)
    }
  }, [user])

  // Filter based on role and tab
  let displayedProducts = products

  if (isPengrajin) {
    if (activeTab === 'fabric_issued') {
      displayedProducts = products.filter(p => p.status === 'fabric_issued' && p.producerId === user?.id)
    } else {
      displayedProducts = products.filter(p => p.status !== 'fabric_issued' && p.producerId === user?.id)
    }
  } else if (isDistributor) {
    if (activeTab === 'fabric_issued') {
      displayedProducts = products.filter(p => p.status === 'fabric_issued' && p.distributorId === user?.id)
    } else if (activeTab === 'registered') {
      displayedProducts = products.filter(p => p.status === 'registered' && p.distributorId === user?.id)
    } else if (activeTab === 'distributed') {
      displayedProducts = products.filter(p => ['distributed', 'received', 'verified'].includes(p.status) && p.distributorId === user?.id)
    }
  } else if (isUMKM) {
    displayedProducts = products.filter(p => p.recipientId === user?.id)
  }

  // Filter based on search query
  const filtered = displayedProducts.filter(p =>
    p.productName.toLowerCase().includes(search.toLowerCase()) ||
    p.tokenId.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-batik-950">Produk & Kain</h1>
          <p className="text-batik-500 text-sm mt-1">
            {isDistributor ? 'Kelola distribusi dan kain pengrajin' : isUMKM ? 'Daftar produk batik yang sudah Anda terima' : 'Kelola pengerjaan batik Anda'} ({filtered.length})
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {isDistributor && (
            <Link to="/dashboard/products/issue"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-white font-semibold text-sm bg-gradient-to-r from-batik-700 to-batik-800 hover:from-batik-800 hover:to-batik-900 shadow transition">
              <Plus className="w-4 h-4" /> Serahkan Kain Mentah
            </Link>
          )}
          {isPengrajin && (
            <>
              <Link to="/dashboard/products/complete-work"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-white font-semibold text-sm bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-750 hover:to-amber-700 shadow transition">
                <CheckCircle className="w-4 h-4" /> Setor Batik Selesai
              </Link>
              <Link to="/dashboard/products/new"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-batik-800 font-semibold text-sm bg-batik-100 hover:bg-batik-200 border border-batik-200 transition">
                <Plus className="w-4 h-4" /> Registrasi Mandiri
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Tabs for Distributor */}
      {isDistributor && (
        <div className="flex flex-wrap border-b border-batik-100 gap-1">
          <button
            onClick={() => setActiveTab('fabric_issued')}
            className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition ${
              activeTab === 'fabric_issued' ? 'border-batik-750 text-batik-850 font-bold' : 'border-transparent text-batik-500 hover:text-batik-850'
            }`}
          >
            Kain Mentah Diserahkan
          </button>
          <button
            onClick={() => setActiveTab('registered')}
            className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition ${
              activeTab === 'registered' ? 'border-batik-750 text-batik-850 font-bold' : 'border-transparent text-batik-500 hover:text-batik-850'
            }`}
          >
            Batik Terdaftar (Selesai Dibuat)
          </button>
          <button
            onClick={() => setActiveTab('distributed')}
            className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition ${
              activeTab === 'distributed' ? 'border-batik-750 text-batik-850 font-bold' : 'border-transparent text-batik-500 hover:text-batik-850'
            }`}
          >
            Batik Didistribusikan
          </button>
          <button
            onClick={() => {
              setActiveTab('pengrajin')
              setSearch('')
            }}
            className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition ${
              activeTab === 'pengrajin' ? 'border-batik-750 text-batik-850 font-bold' : 'border-transparent text-batik-500 hover:text-batik-850'
            }`}
          >
            Pengrajin Mitra ({partnerPengrajins.length})
          </button>
        </div>
      )}

      {/* Tabs for Pengrajin */}
      {isPengrajin && (
        <div className="flex border-b border-batik-100 gap-1">
          <button
            onClick={() => setActiveTab('fabric_issued')}
            className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition ${
              activeTab === 'fabric_issued' ? 'border-batik-750 text-batik-850 font-bold' : 'border-transparent text-batik-500 hover:text-batik-850'
            }`}
          >
            Kain Mentah dari Sentra
          </button>
          <button
            onClick={() => setActiveTab('registered')}
            className={`px-4 py-2.5 text-sm font-semibold border-b-2 transition ${
              activeTab === 'registered' ? 'border-batik-750 text-batik-850 font-bold' : 'border-transparent text-batik-500 hover:text-batik-850'
            }`}
          >
            Batik Selesai Dikerjakan
          </button>
        </div>
      )}

      {isDistributor && activeTab === 'pengrajin' ? (
        <div className="space-y-6">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-batik-400" />
            <input type="text" placeholder="Cari nama pengrajin..." value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-batik-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-batik-300" />
          </div>

          <div className="grid gap-6">
            {partnerPengrajins.filter(p => 
              p.name.toLowerCase().includes(search.toLowerCase()) || 
              (p.umkmName || '').toLowerCase().includes(search.toLowerCase())
            ).length === 0 ? (
              <div className="bg-white rounded-xl border border-batik-100 p-12 text-center text-batik-400">
                <Users className="w-12 h-12 mx-auto mb-3" />
                <p className="font-medium">Belum ada pengrajin bergabung</p>
              </div>
            ) : (
              partnerPengrajins.filter(p => 
                p.name.toLowerCase().includes(search.toLowerCase()) || 
                (p.umkmName || '').toLowerCase().includes(search.toLowerCase())
              ).map(p => (
                <div key={p.id} className="bg-white rounded-xl border border-batik-100 p-6 space-y-4 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-batik-50 pb-4">
                    <div>
                      <h3 className="font-bold text-batik-950 text-base">{p.umkmName || 'Kelompok Batik Tanpa Nama'}</h3>
                      <p className="text-xs text-batik-550 mt-0.5">Penanggung Jawab: {p.name}</p>
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-batik-600">
                      <div className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-batik-450" /> {p.email}</div>
                      {p.phone && <div className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-batik-450" /> {p.phone}</div>}
                      <div className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-batik-450" /> {p.city}, {p.province}</div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-[10px] font-bold text-batik-450 uppercase tracking-wider mb-3">Daftar Kain/Batik ({p.products?.length || 0})</h4>
                    {(!p.products || p.products.length === 0) ? (
                      <p className="text-xs text-batik-400 italic">Belum ada produk terasosiasi.</p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {p.products.map((prod: any) => (
                          <div key={prod.id} className="p-3 bg-batik-50/50 rounded-xl border border-batik-100 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-batik-100 flex items-center justify-center border border-batik-200 text-batik-700 font-bold text-sm">
                              {prod.productName.substring(0,1)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold text-batik-900 truncate">{prod.productName}</p>
                              <p className="text-[9px] text-batik-500 font-mono mt-0.5">{prod.tokenId}</p>
                              <span className={`inline-block text-[8px] font-bold px-1.5 py-0.5 rounded-full mt-1 ${
                                prod.status === 'verified' || prod.status === 'VERIFIED' ? 'bg-green-100 text-green-700' :
                                prod.status === 'distributed' || prod.status === 'DISTRIBUTED' ? 'bg-orange-100 text-orange-700' :
                                prod.status === 'fabric_issued' || prod.status === 'FABRIC_ISSUED' ? 'bg-blue-100 text-blue-700' :
                                prod.status === 'rejected' || prod.status === 'REJECTED' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                              }`}>
                                {prod.status === 'verified' || prod.status === 'VERIFIED' ? 'Terverifikasi' :
                                 prod.status === 'distributed' || prod.status === 'DISTRIBUTED' ? 'Didistribusikan' :
                                 prod.status === 'fabric_issued' || prod.status === 'FABRIC_ISSUED' ? 'Kain Mentah' :
                                 prod.status === 'rejected' || prod.status === 'REJECTED' ? 'Ditolak' : 'Selesai Dibuat'}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      ) : (
        <>
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-batik-400" />
            <input type="text" placeholder="Cari nama batik atau token ID..." value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-batik-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-batik-300" />
          </div>

          <div className="grid gap-4">
            {filtered.length === 0 ? (
              <div className="bg-white rounded-xl border border-batik-100 p-12 text-center text-batik-400">
                <Package className="w-12 h-12 mx-auto mb-3" />
                <p className="font-medium">Tidak ada kain atau batik ditemukan di tab ini</p>
              </div>
            ) : filtered.map(p => {
              const content = (
                <div className="p-4 flex items-center gap-4">
                  {p.imageUrl ? (
                    <img src={p.imageUrl} alt={p.productName}
                      className="w-16 h-16 rounded-xl object-cover border border-batik-200"
                      onError={e => {
                        const target = e.target as HTMLImageElement;
                        target.onerror = null;
                        target.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64"><rect width="64" height="64" fill="%23f9edda"/><text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-weight="bold" font-size="24" fill="%237d421f">B</text></svg>';
                      }} />
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-batik-50 flex items-center justify-center border border-batik-200/60 text-batik-700 font-bold text-lg">
                      {p.productName.substring(0, 2).toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-batik-900">{p.productName}</p>
                    <p className="text-xs text-batik-500 font-mono mt-0.5">{p.tokenId}</p>
                    <p className="text-xs text-batik-500 mt-0.5">
                      {isPengrajin ? `Ditugaskan oleh: ${p.distributorName || 'Sentra'}` : `Penerima: ${p.producerName}`}
                    </p>
                  </div>
                  <div className="text-right text-xs text-batik-500 hidden sm:block">
                    <p>{p.productionDate}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                      p.status === 'verified' ? 'bg-green-100 text-green-700' :
                      p.status === 'distributed' ? 'bg-orange-100 text-orange-700' :
                      p.status === 'received' ? 'bg-purple-100 text-purple-750' :
                      p.status === 'fabric_issued' ? 'bg-blue-100 text-blue-750 border border-blue-200' :
                      p.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-750'
                    }`}>
                      {p.status === 'verified' ? 'Terverifikasi' :
                       p.status === 'distributed' ? 'Didistribusikan' :
                       p.status === 'received' ? 'Diterima Toko' :
                       p.status === 'fabric_issued' ? 'Kain Mentah' :
                       p.status === 'rejected' ? 'Ditolak' : 'Selesai Dibuat'}
                    </span>
                    {isDistributor && p.status === 'registered' && (
                      <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); navigate(`/dashboard/products/${p.id}/distribute`); }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 transition shadow-sm">
                        Proses Distribusi <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {isDistributor && p.status !== 'fabric_issued' && (
                      <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); setPrintProduct(p); }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-batik-800 bg-batik-100 hover:bg-batik-200 transition border border-batik-200 shadow-sm">
                        Cetak Label & Sertifikat
                      </button>
                    )}
                    {isPengrajin && p.status === 'fabric_issued' && (
                      <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); navigate(`/dashboard/products/complete-work?tokenId=${p.tokenId}`); }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-750 transition shadow-sm">
                        Setor Batik <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); navigate(`/verify/${p.tokenId}`); }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-batik-700 bg-white hover:bg-batik-50 transition border border-batik-200 shadow-sm ml-auto">
                      Lihat Detail <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );

              // Click-through behavior
              return (
                <div 
                  key={p.id} 
                  onClick={() => navigate(`/verify/${p.tokenId}`)}
                  className="bg-white rounded-xl border border-batik-100 hover:border-batik-300 transition-colors block cursor-pointer">
                  {content}
                </div>
              );
            })}
          </div>
        </>
      )}
      {printProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 no-print-overlay">
          <style>{`
            @media print {
              body * {
                visibility: hidden !important;
              }
              .printable-card-area, .printable-card-area * {
                visibility: visible !important;
              }
              .printable-card-area {
                position: absolute !important;
                left: 50% !important;
                top: 50% !important;
                transform: translate(-50%, -50%) !important;
                width: 100% !important;
                max-width: 600px !important;
                border: 2px solid #7d421f !important;
                padding: 24px !important;
                background: white !important;
                box-shadow: none !important;
              }
              .no-print {
                display: none !important;
              }
            }
          `}</style>
          <div className="bg-white rounded-2xl shadow-2xl border border-batik-100 max-w-xl w-full overflow-hidden flex flex-col no-print-modal">
            <div className="printable-card-area p-8 bg-gradient-to-br from-amber-50/50 via-white to-amber-50/30 border-4 border-double border-batik-600 rounded-xl m-4 relative">
              <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#7d421f_1px,transparent_1px)] [background-size:16px_16px]" />
              <div className="text-center space-y-2 relative font-serif">
                <span className="text-[10px] uppercase tracking-widest text-batik-600 font-bold font-sans">BatikChain Indonesia</span>
                <h2 className="text-2xl font-bold text-batik-950">SERTIFIKAT KEASLIAN BATIK</h2>
                <div className="w-24 h-0.5 bg-batik-600 mx-auto" />
                <p className="text-xs text-batik-500 italic mt-1 font-sans">Certificate of Authenticity</p>
              </div>
              <div className="mt-8 flex flex-col md:flex-row items-center gap-6 relative">
                <div className="bg-white p-3 rounded-xl border border-batik-200 shadow-sm flex-shrink-0 flex items-center justify-center">
                  <QRCode value={`${window.location.origin}/verify/${printProduct.tokenId}`} size={120} />
                </div>
                <div className="flex-1 space-y-2.5 text-sm">
                  <div>
                    <p className="text-[10px] text-batik-500 font-semibold uppercase">Nama Batik</p>
                    <p className="font-bold text-batik-900 text-base">{printProduct.productName}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-[10px] text-batik-500 font-semibold uppercase">Token ID</p>
                      <p className="font-mono font-bold text-batik-800 text-xs">{printProduct.tokenId}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-batik-500 font-semibold uppercase">Asal Daerah</p>
                      <p className="font-semibold text-batik-800">{printProduct.originLocation}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-[10px] text-batik-500 font-semibold uppercase">Pengrajin Mitra</p>
                      <p className="font-semibold text-batik-800">{printProduct.producerName}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-batik-500 font-semibold uppercase">Tanggal Produksi</p>
                      <p className="font-semibold text-batik-800">{printProduct.productionDate}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-8 pt-4 border-t border-dashed border-batik-200 flex justify-between items-end relative text-xs">
                <div className="text-[9px] text-batik-500 font-mono">
                  <p>Metadata Hash:</p>
                  <p className="truncate w-40" title={printProduct.metadataHash}>{printProduct.metadataHash || 'N/A'}</p>
                </div>
                <div className="text-right text-[9px] text-batik-600 font-semibold">
                  <p>Didistribusikan Oleh:</p>
                  <p className="font-bold text-batik-800">{printProduct.distributorName || 'Sentra Batik'}</p>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 bg-batik-50 border-t border-batik-100 flex justify-end gap-3 no-print">
              <button onClick={() => setPrintProduct(null)}
                className="px-4 py-2 text-sm font-semibold text-batik-700 bg-white border border-batik-200 rounded-xl hover:bg-batik-50 transition">
                Tutup
              </button>
              <button onClick={() => window.print()}
                className="px-5 py-2 text-sm font-semibold text-white bg-gradient-to-r from-batik-700 to-batik-800 rounded-xl hover:from-batik-800 hover:to-batik-900 shadow transition">
                Cetak Label & Sertifikat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
