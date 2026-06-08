import { Link } from 'react-router-dom'
import { Shield, Scan, QrCode, ArrowRight } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-batik-100 bg-white/70 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-batik-600 to-batik-800 flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg text-batik-900">BatikChain</span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <a href="#tentang" className="text-sm text-batik-600 hover:text-batik-800">Tentang</a>
            <a href="#fitur" className="text-sm text-batik-600 hover:text-batik-800">Fitur</a>
            <Link to="/verify/BC-2023-001" className="text-sm text-batik-600 hover:text-batik-800">Verifikasi</Link>
            <Link to="/login" className="text-sm font-medium text-batik-700 hover:text-batik-900 px-4 py-2 rounded-lg border border-batik-300">Masuk</Link>
            <Link to="/register" className="text-sm font-medium text-white px-4 py-2 rounded-lg bg-gradient-to-r from-batik-700 to-batik-800 hover:from-batik-800 hover:to-batik-900">Daftar UMKM</Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <section className="max-w-6xl mx-auto px-4 py-20 md:py-32 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-batik-100 text-batik-700 text-sm font-medium mb-6">
            <Shield className="w-4 h-4" /> Blockchain Certification Platform
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-batik-950 leading-tight max-w-3xl mx-auto">
            Lindungi Batik Indonesia dengan{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-batik-600 to-batik-800">Sertifikasi Blockchain</span>
          </h1>
          <p className="mt-5 text-lg text-batik-600 max-w-xl mx-auto">
            Platform nasional untuk UMKM batik mendaftarkan produk ke blockchain, menghasilkan sertifikat digital NFT, dan QR Code anti-pemalsuan.
          </p>
          <div className="flex flex-wrap justify-center gap-4 mt-8">
            <Link to="/register"
              className="inline-flex items-center gap-2 px-8 py-3 rounded-xl text-white font-semibold bg-gradient-to-r from-batik-700 to-batik-800 hover:from-batik-800 hover:to-batik-900 shadow-lg shadow-batik-200">
              Daftarkan UMKM Anda <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/verify/BC-2023-001"
              className="inline-flex items-center gap-2 px-8 py-3 rounded-xl text-batik-700 font-semibold border-2 border-batik-300 hover:bg-batik-50">
              <Scan className="w-4 h-4" /> Verifikasi Produk
            </Link>
          </div>
        </section>

        <section id="fitur" className="max-w-6xl mx-auto px-4 py-16">
          <h2 className="text-2xl md:text-3xl font-bold text-center text-batik-950 mb-12">Fitur Unggulan</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: QrCode, title: 'QR Code Autentikasi', desc: 'Setiap produk memiliki QR unik untuk verifikasi instan oleh konsumen.' },
              { icon: Shield, title: 'Sertifikat Digital NFT', desc: 'Sertifikat ERC-721 di blockchain sebagai bukti keaslian tak terbantahkan.' },
              { icon: Scan, title: 'Verifikasi Publik', desc: 'Konsumen dapat memverifikasi keaslian batik melalui portal publik.' },
            ].map((f, i) => {
              const Icon = f.icon
              return (
                <div key={i} className="bg-white rounded-2xl p-6 border border-batik-100 shadow-sm">
                  <div className="w-12 h-12 rounded-xl bg-batik-100 flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-batik-700" />
                  </div>
                  <h3 className="font-bold text-batik-900 mb-2">{f.title}</h3>
                  <p className="text-sm text-batik-600 leading-relaxed">{f.desc}</p>
                </div>
              )
            })}
          </div>
        </section>

        <section id="tentang" className="max-w-4xl mx-auto px-4 py-16 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-batik-950 mb-6">Tentang BatikChain</h2>
          <p className="text-batik-600 leading-relaxed max-w-2xl mx-auto">
            BatikChain adalah platform nasional yang memberdayakan UMKM batik Indonesia untuk melindungi produk mereka
            melalui teknologi blockchain. Terinspirasi dari penelitian mengenai penggunaan blockchain, NFT ERC-721,
            smart contract, dan QR Code untuk mencegah pemalsuan produk batik di Pekanbaru, Riau.
          </p>
        </section>
      </main>

      <footer className="border-t border-batik-100 bg-white/50 py-8 text-center text-sm text-batik-500">
        <p className="font-medium">BatikChain Indonesia — Melindungi Warisan Batik Melalui Teknologi Blockchain</p>
        <p className="mt-1">&copy; {new Date().getFullYear()} BatikChain. All rights reserved.</p>
      </footer>
    </div>
  )
}
