import { Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, Package, ScrollText, Settings, LogOut, Shield,
  Users, FileSearch, Activity, Wallet, Scan
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useWeb3 } from '../../context/Web3Context'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/products', label: 'Produk', icon: Package },
  { href: '/dashboard/receive', label: 'Terima Barang', icon: Scan },
  { href: '/dashboard/settings', label: 'Pengaturan', icon: Settings },
]

const adminItems = [
  { href: '/dashboard/admin', label: 'Admin', icon: Activity },
  { href: '/dashboard/admin/users', label: 'Pengguna', icon: Users },
  { href: '/dashboard/admin/products', label: 'Semua Produk', icon: FileSearch },
]

export function Sidebar() {
  const { pathname } = useLocation()
  const { user, logout } = useAuth()
  const { account, isConnected, connectWallet, disconnectWallet } = useWeb3()
  const isAdmin = user?.role?.toLowerCase() === 'admin'
  const isUMKM = user?.role?.toLowerCase() === 'umkm'

  const filteredNavItems = navItems.filter(item => {
    if (isUMKM) {
      return item.href === '/dashboard' || item.href === '/dashboard/products' || item.href === '/dashboard/receive' || item.href === '/dashboard/settings'
    } else {
      return item.href !== '/dashboard/receive'
    }
  })

  return (
    <aside className="hidden lg:flex lg:w-64 flex-col bg-white border-r border-batik-100 min-h-screen">
      <div className="p-5 border-b border-batik-100">
        <Link to="/dashboard" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-batik-600 to-batik-800 flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold text-batik-900 leading-tight">BatikChain</h1>
            <p className="text-[9px] text-batik-500 tracking-widest uppercase">Indonesia</p>
          </div>
        </Link>
      </div>
      <nav className="flex-1 p-3 space-y-1">
        <p className="px-3 text-xs font-semibold text-batik-400 uppercase tracking-wider">Umum</p>
        {filteredNavItems.map(item => {
          const Icon = item.icon
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
          return (
            <Link key={item.href} to={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive ? 'bg-batik-100 text-batik-800' : 'text-batik-600 hover:bg-batik-50 hover:text-batik-800'
              }`}>
              <Icon className="w-4.5 h-4.5" />
              {item.label}
            </Link>
          )
        })}
        {isAdmin && (
          <>
            <p className="px-3 pt-3 text-xs font-semibold text-batik-400 uppercase tracking-wider">Admin</p>
            {adminItems.map(item => {
              const Icon = item.icon
              const isActive = pathname === item.href || pathname.startsWith(item.href)
              return (
                <Link key={item.href} to={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive ? 'bg-batik-100 text-batik-800' : 'text-batik-600 hover:bg-batik-50 hover:text-batik-800'
                  }`}>
                  <Icon className="w-4.5 h-4.5" />
                  {item.label}
                </Link>
              )
            })}
          </>
        )}
      </nav>
      <div className="p-4 border-t border-batik-100 space-y-4">
        {/* Wallet Connection */}
        <div className="px-1">
          {isConnected ? (
            <div className="flex items-center justify-between p-2 rounded-lg bg-green-50 border border-green-200 text-xs">
              <div className="flex items-center gap-1.5 text-green-700 font-semibold truncate relative">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-ping"></div>
                <div className="w-2 h-2 rounded-full bg-green-500 absolute"></div>
                <span className="font-mono ml-3.5">{account?.substring(0, 6)}...{account?.substring(account.length - 4)}</span>
              </div>
              <button onClick={disconnectWallet} className="text-batik-500 hover:text-red-600 font-bold ml-2">
                Disconnect
              </button>
            </div>
          ) : (
            <button onClick={connectWallet}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-white bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 transition-all shadow-sm">
              <Wallet className="w-4 h-4" /> Hubungkan MetaMask
            </button>
          )}
        </div>

        <div className="flex items-center gap-3 px-1">
          <div className="w-8 h-8 rounded-full bg-batik-200 flex items-center justify-center text-batik-700 text-sm font-bold shrink-0">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-batik-900 truncate">{user?.umkmName || user?.name}</p>
            <p className="text-xs text-batik-500 truncate">{user?.email}</p>
          </div>
        </div>
        <button onClick={logout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-batik-600 border border-batik-200 hover:bg-batik-50 transition-colors">
          <LogOut className="w-4 h-4" /> Keluar
        </button>
      </div>
    </aside>
  )
}
