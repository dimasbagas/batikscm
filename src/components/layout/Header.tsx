import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, Package, ScrollText, Settings, LogOut, LayoutDashboard, Shield, X, Scan } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

const mobileNav = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/products', label: 'Produk', icon: Package },
  { href: '/dashboard/receive', label: 'Terima Barang', icon: Scan },
  { href: '/dashboard/settings', label: 'Pengaturan', icon: Settings },
]

export function Header() {
  const { user, logout } = useAuth()
  const { pathname } = useLocation()
  const [open, setOpen] = useState(false)
  const isUMKM = user?.role?.toLowerCase() === 'umkm'

  const filteredNavItems = mobileNav.filter(item => {
    if (isUMKM) {
      return item.href === '/dashboard' || item.href === '/dashboard/products' || item.href === '/dashboard/receive' || item.href === '/dashboard/settings'
    } else {
      return item.href !== '/dashboard/receive'
    }
  })

  return (
    <header className="lg:hidden sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-batik-100">
      <div className="flex items-center justify-between px-4 h-14">
        <div className="flex items-center gap-2">
          <button onClick={() => setOpen(true)} className="text-batik-700 p-1">
            <Menu className="w-5 h-5" />
          </button>
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-batik-600 to-batik-800 flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-batik-900">BatikChain</span>
          </Link>
        </div>
        <div className="w-8 h-8 rounded-full bg-batik-200 flex items-center justify-center text-batik-700 text-xs font-bold">
          {user?.name?.charAt(0) || 'U'}
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/20" onClick={() => setOpen(false)} />
          <div className="relative w-64 bg-white h-full shadow-xl flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-batik-100">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-batik-700" />
                <span className="font-bold text-batik-900">BatikChain</span>
              </div>
              <button onClick={() => setOpen(false)} className="text-batik-400">
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="flex-1 p-3 space-y-1">
              {filteredNavItems.map(item => {
                const Icon = item.icon
                const isActive = pathname === item.href
                return (
                  <Link key={item.href} to={item.href} onClick={() => setOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive ? 'bg-batik-100 text-batik-800' : 'text-batik-600 hover:bg-batik-50'
                    }`}>
                    <Icon className="w-4.5 h-4.5" /> {item.label}
                  </Link>
                )
              })}
            </nav>
            <div className="p-4 border-t border-batik-100">
              <button onClick={logout}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-batik-600 border border-batik-200 hover:bg-batik-50">
                <LogOut className="w-4 h-4" /> Keluar
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
