import { useState, useEffect } from 'react'
import { Users, Mail, Shield, Store, MapPin } from 'lucide-react'
import { getUsers, updateUser } from '../../lib/api'
import type { User } from '../../types'

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getUsers().then(u => { setUsers(u); setLoading(false) })
  }, [])

  async function handleRoleChange(userId: string, newRole: string) {
    await updateUser(userId, { role: newRole as User['role'] })
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole as User['role'] } : u))
  }

  const roleColors: Record<string, string> = {
    admin: 'bg-red-100 text-red-700',
    umkm: 'bg-green-100 text-green-700',
    verificator: 'bg-blue-100 text-blue-700',
    visitor: 'bg-gray-100 text-gray-600',
  }

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin w-6 h-6 border-2 border-batik-600 border-t-transparent rounded-full" /></div>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-batik-950">Kelola Pengguna</h1>
        <p className="text-batik-500 text-sm mt-1">Total {users.length} pengguna terdaftar</p>
      </div>

      <div className="bg-white rounded-xl border border-batik-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-batik-100 bg-batik-50/50">
                <th className="text-left px-5 py-3 font-semibold text-batik-700">Nama</th>
                <th className="text-left px-5 py-3 font-semibold text-batik-700">Email</th>
                <th className="text-left px-5 py-3 font-semibold text-batik-700">Role</th>
                <th className="text-left px-5 py-3 font-semibold text-batik-700">UMKM</th>
                <th className="text-left px-5 py-3 font-semibold text-batik-700">Daerah</th>
                <th className="text-left px-5 py-3 font-semibold text-batik-700">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} className="border-b border-batik-50 hover:bg-batik-50/30">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-batik-200 flex items-center justify-center text-xs font-bold text-batik-700">
                        {u.name?.charAt(0) || '?'}
                      </div>
                      <span className="font-medium text-batik-900">{u.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-batik-600">{u.email}</td>
                  <td className="px-5 py-3">
                    <select value={u.role} onChange={e => handleRoleChange(u.id, e.target.value)}
                      className={`text-xs font-medium px-2 py-1 rounded-full border-0 ${roleColors[u.role] || 'bg-gray-100 text-gray-600'} cursor-pointer`}>
                      <option value="visitor">Visitor</option>
                      <option value="umkm">UMKM</option>
                      <option value="verificator">Verificator</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td className="px-5 py-3 text-batik-600">{u.umkmName || '-'}</td>
                  <td className="px-5 py-3 text-batik-600">{u.city ? `${u.city}, ${u.province || ''}` : '-'}</td>
                  <td className="px-5 py-3">
                    <button onClick={() => handleRoleChange(u.id, u.role)}
                      className="text-xs text-batik-600 hover:text-batik-800 font-medium">Simpan</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
