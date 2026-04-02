"use client"

import { useEffect } from "react"
import { useAuthStore, startTokenRefresh, stopTokenRefresh } from "@/lib/store/auth-store"

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const initialize = useAuthStore((s) => s.initialize)
  const user = useAuthStore((s) => s.user)

  useEffect(() => {
    initialize()
  }, [initialize])

  useEffect(() => {
    if (user) {
      startTokenRefresh()
    } else {
      stopTokenRefresh()
    }
    return () => stopTokenRefresh()
  }, [user])

  return <>{children}</>
}
