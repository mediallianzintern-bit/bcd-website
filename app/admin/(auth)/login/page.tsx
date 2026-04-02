"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { useAuthStore } from "@/lib/store/auth-store"

export default function AdminLoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const { login, isLoading } = useAuthStore()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    const result = await login(email, password)
    if (result.error) {
      setError(result.error)
      return
    }
    // Verify admin access
    const me = await fetch("/api/auth/me")
    const data = await me.json()
    if (!data.user?.isAdmin) {
      setError("You do not have admin access.")
      return
    }
    router.push("/admin")
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <Image
            src="/images/basecamp-logo.png"
            alt="Basecamp Digital"
            width={160}
            height={40}
            className="h-10 w-auto"
            style={{ filter: "brightness(0) saturate(100%) invert(58%) sepia(69%) saturate(400%) hue-rotate(95deg) brightness(95%) contrast(95%)" }}
          />
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-8">
          <h1 className="text-2xl font-bold text-white mb-1">Admin Panel</h1>
          <p className="text-neutral-400 text-sm mb-8">Sign in with your admin credentials</p>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-1.5">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-11 rounded-lg bg-neutral-800 border border-neutral-700 text-white px-4 text-sm placeholder:text-neutral-500 focus:outline-none focus:border-primary"
                placeholder="admin@basecampdigital.co"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-1.5">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-11 rounded-lg bg-neutral-800 border border-neutral-700 text-white px-4 text-sm placeholder:text-neutral-500 focus:outline-none focus:border-primary"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <p className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-4 py-3">{error}</p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 rounded-lg bg-primary text-black font-semibold text-sm hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {isLoading ? "Signing in..." : "Sign in to Admin"}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
