"use client"

import { useEffect, useState, useCallback } from "react"
import { Search, Trash2 } from "lucide-react"

interface Enrollment {
  id: string
  enrolledAt: string
  user: { id: string; fullName: string | null; email: string }
  course: { id: string | null; title: string; price: number | null }
  type: "local" | "ld"
}

export default function AdminEnrollmentsPage() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [total, setTotal] = useState(0)
  const [pages, setPages] = useState(1)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const fetchEnrollments = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams({ page: String(page), search })
    const res = await fetch(`/api/admin/enrollments?${params}`)
    const data = await res.json()
    setEnrollments(data.enrollments)
    setTotal(data.total)
    setPages(data.pages)
    setLoading(false)
  }, [page, search])

  useEffect(() => {
    const t = setTimeout(fetchEnrollments, 300)
    return () => clearTimeout(t)
  }, [fetchEnrollments])

  const handleDelete = async (id: string, type: "local" | "ld") => {
    if (!confirm("Remove this enrollment?")) return
    setDeletingId(id)
    await fetch("/api/admin/enrollments", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, type }),
    })
    await fetchEnrollments()
    setDeletingId(null)
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Enrollments</h1>
        <p className="text-neutral-400 text-sm mt-1">{total} total enrollments</p>
      </div>

      {/* Search */}
      <div className="relative mb-5">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
        <input
          type="text"
          placeholder="Search by student name, email, or course..."
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
              <th className="text-left px-4 py-3 text-neutral-400 font-medium">Student</th>
              <th className="text-left px-4 py-3 text-neutral-400 font-medium">Course</th>
              <th className="text-left px-4 py-3 text-neutral-400 font-medium">Course Price</th>
              <th className="text-left px-4 py-3 text-neutral-400 font-medium">Enrolled On</th>
              <th className="text-left px-4 py-3 text-neutral-400 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800">
            {loading ? (
              [...Array(6)].map((_, i) => (
                <tr key={i}>
                  {[...Array(5)].map((_, j) => (
                    <td key={j} className="px-4 py-3">
                      <div className="h-4 bg-neutral-800 rounded animate-pulse" />
                    </td>
                  ))}
                </tr>
              ))
            ) : enrollments.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-neutral-500">No enrollments found</td>
              </tr>
            ) : (
              enrollments.map((e) => (
                <tr key={e.id} className="hover:bg-neutral-800/50 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-medium text-white">{e.user.fullName || "—"}</p>
                    <p className="text-xs text-neutral-500">{e.user.email}</p>
                  </td>
                  <td className="px-4 py-3 max-w-xs">
                    <p className="text-neutral-300 truncate">{e.course.title}</p>
                    {e.type === "ld" && (
                      <span className="text-xs text-blue-400">LearnDash</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {e.course.price == null ? (
                      <span className="text-xs bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded-full">LearnDash</span>
                    ) : e.course.price === 0 ? (
                      <span className="text-xs bg-green-500/10 text-green-400 px-2 py-0.5 rounded-full">Free</span>
                    ) : (
                      <span className="text-neutral-300">₹{e.course.price}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-neutral-400 text-xs">
                    {new Date(e.enrolledAt).toLocaleDateString("en-IN", {
                      day: "numeric", month: "short", year: "numeric",
                    })}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleDelete(e.id, e.type)}
                      disabled={deletingId === e.id}
                      title="Remove enrollment"
                      className="p-1.5 rounded-lg hover:bg-red-400/10 text-neutral-500 hover:text-red-400 transition-colors disabled:opacity-50"
                    >
                      <Trash2 className="w-4 h-4" />
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
