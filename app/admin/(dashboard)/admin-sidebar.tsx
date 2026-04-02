"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import Image from "next/image"
import {
  LayoutDashboard, Users, BookOpen, GraduationCap,
  Tag, LogOut, ChevronRight
} from "lucide-react"
import { useAuthStore } from "@/lib/store/auth-store"

const navItems = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/courses", label: "Courses", icon: BookOpen },
  { href: "/admin/enrollments", label: "Enrollments", icon: GraduationCap },
  { href: "/admin/coupons", label: "Coupons", icon: Tag },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { logout } = useAuthStore()

  const handleLogout = async () => {
    await logout()
    router.push("/admin/login")
  }

  const isActive = (item: typeof navItems[0]) => {
    if (item.exact) return pathname === item.href
    return pathname.startsWith(item.href)
  }

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-neutral-900 border-r border-neutral-800 flex flex-col z-40">
      {/* Logo */}
      <div className="p-6 border-b border-neutral-800">
        <Link href="/admin" className="flex items-center gap-3">
          <Image
            src="/images/basecamp-logo.png"
            alt="Basecamp Digital"
            width={120}
            height={32}
            className="h-8 w-auto"
            style={{ filter: "brightness(0) saturate(100%) invert(58%) sepia(69%) saturate(400%) hue-rotate(95deg) brightness(95%) contrast(95%)" }}
          />
        </Link>
        <p className="text-xs text-neutral-500 mt-2 font-medium uppercase tracking-wider">Admin Panel</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const active = isActive(item)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors group ${
                active
                  ? "bg-primary/10 text-primary"
                  : "text-neutral-400 hover:text-white hover:bg-neutral-800"
              }`}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {item.label}
              {active && <ChevronRight className="h-3 w-3 ml-auto" />}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-neutral-800">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-neutral-400 hover:text-red-400 hover:bg-red-400/10 transition-colors w-full"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          Sign Out
        </button>
      </div>
    </aside>
  )
}
