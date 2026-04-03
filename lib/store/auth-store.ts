import { create } from "zustand"

interface AuthUser {
  id: string
  email: string
  name: string | null
  isAdmin: boolean
  wpUserId: number | null
}

interface AuthState {
  user: AuthUser | null
  isLoading: boolean
  isInitialized: boolean

  // Actions
  initialize: () => Promise<void>
  login: (email: string, password: string) => Promise<{ error?: string }>
  signup: (email: string, password: string, fullName: string) => Promise<{ error?: string }>
  logout: () => Promise<void>
  refresh: () => Promise<boolean>
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: false,
  isInitialized: false,

  initialize: async () => {
    if (get().isInitialized) return

    set({ isLoading: true })
    try {
      const res = await fetch("/api/auth/me")
      if (res.ok) {
        const data = await res.json()
        set({ user: data.user })
      } else {
        // Try refresh
        const refreshed = await get().refresh()
        if (!refreshed) {
          set({ user: null })
        }
      }
    } catch {
      set({ user: null })
    } finally {
      set({ isLoading: false, isInitialized: true })
    }
  },

  login: async (email, password) => {
    set({ isLoading: true })
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        set({ isLoading: false })
        return { error: data.error || "Login failed" }
      }

      set({ user: data.user, isLoading: false })
      return {}
    } catch {
      set({ isLoading: false })
      return { error: "An error occurred" }
    }
  },

  signup: async (email, password, fullName) => {
    set({ isLoading: true })
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, fullName }),
      })

      const data = await res.json()

      if (!res.ok) {
        set({ isLoading: false })
        return { error: data.error || "Signup failed" }
      }

      set({ user: data.user, isLoading: false })
      return {}
    } catch {
      set({ isLoading: false })
      return { error: "An error occurred" }
    }
  },

  logout: async () => {
    set({ isLoading: true })
    try {
      await fetch("/api/auth/logout", { method: "POST" })
    } catch {
      // silent
    }
    set({ user: null, isLoading: false })
  },

  refresh: async () => {
    try {
      const res = await fetch("/api/auth/refresh", { method: "POST" })
      if (res.ok) {
        const data = await res.json()
        set({ user: data.user })
        return true
      }
      return false
    } catch {
      return false
    }
  },
}))

// Auto-refresh: refresh access token every 6 days (before 7d expiry)
let refreshInterval: ReturnType<typeof setInterval> | null = null

export function startTokenRefresh() {
  if (refreshInterval) return
  refreshInterval = setInterval(() => {
    const { user, refresh } = useAuthStore.getState()
    if (user) refresh()
  }, 6 * 24 * 60 * 60 * 1000)
}

export function stopTokenRefresh() {
  if (refreshInterval) {
    clearInterval(refreshInterval)
    refreshInterval = null
  }
}
