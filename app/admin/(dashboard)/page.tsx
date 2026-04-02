"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Users, BookOpen, GraduationCap, TrendingUp } from "lucide-react"

interface Stats {
  totalUsers: number
  totalCourses: number
  totalEnrollments: number
}

interface RecentUser {
  id: string
  fullName: string | null
  email: string
  createdAt: string
  isAdmin: boolean
}

interface RecentEnrollment {
  id: string
  enrolledAt: string
  user: { fullName: string | null; email: string }
  course: { title: string }
}


export default function AdminOverviewPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([])
  const [recentEnrollments, setRecentEnrollments] = useState<RecentEnrollment[]>([])
const [loading, setLoading] = useState(true)

  const loadStats = () => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then((data) => {
        setStats(data.stats)
        setRecentUsers(data.recentUsers)
        setRecentEnrollments(data.recentEnrollments)
        setLoading(false)
      })
  }

  useEffect(() => {
    loadStats()
    const interval = setInterval(loadStats, 30_000)
    return () => clearInterval(interval)
  }, [])

  const statCards = [
    { label: "Total Users", value: stats?.totalUsers, icon: Users, href: "/admin/users", color: "text-blue-400" },
    { label: "Total Courses", value: stats?.totalCourses, icon: BookOpen, href: "/admin/courses", color: "text-green-400" },
    { label: "Total Enrollments", value: stats?.totalEnrollments, icon: GraduationCap, href: "/admin/enrollments", color: "text-purple-400" },
    { label: "Conversion Rate", value: stats ? `${stats.totalUsers > 0 ? Math.round((stats.totalEnrollments / stats.totalUsers) * 100) : 0}%` : null, icon: TrendingUp, href: "/admin/enrollments", color: "text-yellow-400" },
  ]

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Overview</h1>
        <p className="text-neutral-400 text-sm mt-1">Welcome to the Basecamp Digital admin panel</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 hover:border-neutral-700 transition-colors"
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-neutral-400">{card.label}</p>
              <card.icon className={`h-4 w-4 ${card.color}`} />
            </div>
            <p className="text-3xl font-bold text-white">
              {loading ? <span className="animate-pulse bg-neutral-700 rounded h-8 w-16 inline-block" /> : card.value ?? "—"}
            </p>
          </Link>
        ))}
      </div>


<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Users */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-white">Recent Users</h2>
            <Link href="/admin/users" className="text-xs text-primary hover:underline">View all</Link>
          </div>
          {loading ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-10 bg-neutral-800 rounded animate-pulse" />
              ))}
            </div>
          ) : recentUsers.length === 0 ? (
            <p className="text-neutral-500 text-sm">No users yet</p>
          ) : (
            <div className="space-y-3">
              {recentUsers.map((u) => (
                <div key={u.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white font-medium">{u.fullName || "—"}</p>
                    <p className="text-xs text-neutral-500">{u.email}</p>
                  </div>
                  <div className="text-right">
                    {u.isAdmin && (
                      <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">Admin</span>
                    )}
                    <p className="text-xs text-neutral-500 mt-1">{new Date(u.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Enrollments */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-white">Recent Enrollments</h2>
            <Link href="/admin/enrollments" className="text-xs text-primary hover:underline">View all</Link>
          </div>
          {loading ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-10 bg-neutral-800 rounded animate-pulse" />
              ))}
            </div>
          ) : recentEnrollments.length === 0 ? (
            <p className="text-neutral-500 text-sm">No enrollments yet</p>
          ) : (
            <div className="space-y-3">
              {recentEnrollments.map((e) => (
                <div key={e.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white font-medium">{e.user.fullName || e.user.email}</p>
                    <p className="text-xs text-neutral-500">{e.course.title}</p>
                  </div>
                  <p className="text-xs text-neutral-500">{new Date(e.enrolledAt).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
