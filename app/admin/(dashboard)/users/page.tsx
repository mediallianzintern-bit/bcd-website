"use client"

import { useEffect, useState, useCallback } from "react"
import { Search, Shield, ShieldOff, User } from "lucide-react"

interface AdminUser {
  id: string
  email: string
  fullName: string | null
  isAdmin: boolean
  wpUserId: number | null
  createdAt: string
  _count: { enrollments: number }
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [total, setTotal] = useState(0)
  const [pages, setPages] = useState(1)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const [togglingId, setTogglingId] = useState<string | null>(null)

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams({ page: String(page), search })
    const res = await fetch(`/api/admin/users?${params}`)
    const data = await res.json()
    setUsers(data.users ?? [])
    setTotal(data.total ?? 0)
    setPages(data.pages ?? 1)
    setLoading(false)
  }, [page, search])

  useEffect(() => {
    const t = setTimeout(fetchUsers, 300)
    return () => clearTimeout(t)
  }, [fetchUsers])

  // Auto-refresh every 30s
  useEffect(() => {
    const interval = setInterval(fetchUsers, 30_000)
    return () => clearInterval(interval)
  }, [fetchUsers])

  const toggleAdmin = async (user: AdminUser) => {
    setTogglingId(user.id)
    await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: user.id, isAdmin: !user.isAdmin }),
    })
    await fetchUsers()
    setTogglingId(null)
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Users</h1>
        <p className="text-neutral-400 text-sm mt-1">{total} total users</p>
      </div>

      {/* Search */}
      <div className="relative mb-5">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          className="w-full max-w-sm h-10 pl-9 pr-4 bg-neutral-900 border border-neutral-800 rounded-lg text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:border-neutral-600"
        />
      </div>

      {/* Table */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-800">
              <th className="text-left px-4 py-3 text-neutral-400 font-medium">User</th>
              <th className="text-left px-4 py-3 text-neutral-400 font-medium">Enrollments</th>
              <th className="text-left px-4 py-3 text-neutral-400 font-medium">WP User</th>
              <th className="text-left px-4 py-3 text-neutral-400 font-medium">Joined</th>
              <th className="text-left px-4 py-3 text-neutral-400 font-medium">Role</th>
              <th className="text-left px-4 py-3 text-neutral-400 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800">
            {loading ? (
              [...Array(6)].map((_, i) => (
                <tr key={i}>
                  {[...Array(6)].map((_, j) => (
                    <td key={j} className="px-4 py-3">
                      <div className="h-4 bg-neutral-800 rounded animate-pulse" />
                    </td>
                  ))}
                </tr>
              ))
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-neutral-500">No users found</td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id} className="hover:bg-neutral-800/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-neutral-700 flex items-center justify-center shrink-0">
                        <User className="w-4 h-4 text-neutral-400" />
                      </div>
                      <div>
                        <p className="font-medium text-white">{user.fullName || "—"}</p>
                        <p className="text-xs text-neutral-500">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-neutral-300">{user._count.enrollments}</td>
                  <td className="px-4 py-3">
                    {user.wpUserId ? (
                      <span className="text-xs bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded-full">#{user.wpUserId}</span>
                    ) : (
                      <span className="text-neutral-600 text-xs">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-neutral-400 text-xs">{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    {user.isAdmin ? (
                      <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">Admin</span>
                    ) : (
                      <span className="text-xs bg-neutral-800 text-neutral-400 px-2 py-0.5 rounded-full">User</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleAdmin(user)}
                      disabled={togglingId === user.id}
                      title={user.isAdmin ? "Remove admin" : "Make admin"}
                      className={`p-1.5 rounded-lg transition-colors disabled:opacity-50 ${
                        user.isAdmin
                          ? "hover:bg-red-400/10 text-neutral-400 hover:text-red-400"
                          : "hover:bg-primary/10 text-neutral-400 hover:text-primary"
                      }`}
                    >
                      {user.isAdmin ? <ShieldOff className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-xs text-neutral-500">Page {page} of {pages}</p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 text-xs bg-neutral-900 border border-neutral-800 rounded-lg text-neutral-300 hover:border-neutral-600 disabled:opacity-40 transition-colors"
            >
              Previous
            </button>
            <button
              onClick={() => setPage((p) => Math.min(pages, p + 1))}
              disabled={page === pages}
              className="px-3 py-1.5 text-xs bg-neutral-900 border border-neutral-800 rounded-lg text-neutral-300 hover:border-neutral-600 disabled:opacity-40 transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
