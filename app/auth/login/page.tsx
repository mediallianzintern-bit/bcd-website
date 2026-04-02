"use client"

import { useAuthStore } from "@/lib/store/auth-store"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import Image from "next/image"
import { useRouter, useSearchParams } from "next/navigation"
import { useState, Suspense } from "react"
import { cn } from "@/lib/utils"
import { AuthRightPanel } from "@/components/auth-right-panel"
import { Eye, EyeOff } from "lucide-react"

/* ─── Aceternity-style helpers ─────────────────────────────────────────────── */

const BottomGradient = () => (
  <>
    <span className="absolute inset-x-0 -bottom-px block h-px w-full bg-gradient-to-r from-transparent via-emerald-500 to-transparent opacity-0 transition duration-500 group-hover/btn:opacity-100" />
    <span className="absolute inset-x-10 -bottom-px mx-auto block h-px w-1/2 bg-gradient-to-r from-transparent via-emerald-300 to-transparent opacity-0 blur-sm transition duration-500 group-hover/btn:opacity-100" />
  </>
)

const LabelInputContainer = ({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) => (
  <div className={cn("flex w-full flex-col space-y-2", className)}>
    {children}
  </div>
)

/* ─── Form ─────────────────────────────────────────────────────────────────── */

function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const next = searchParams.get("next") || "/"
  const { login, isLoading } = useAuthStore()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    const result = await login(email, password)
    if (result.error) {
      setError(result.error)
    } else {
      router.push(next)
      router.refresh()
    }
  }

  const socialParams = next && next !== "/" ? `?next=${encodeURIComponent(next)}` : ""

  return (
    <div className="flex min-h-screen w-full bg-neutral-950">
      {/* ── Left: Form ────────────────────────────────────────────────────── */}
      <div className="flex w-full flex-col px-6 py-8 lg:w-1/2 lg:px-16 xl:px-24">
        {/* Logo */}
        <Link href="/" className="mb-16">
          <Image
            src="/images/basecamp-logo.png"
            alt="Basecamp Digital"
            width={160}
            height={40}
            className="h-10 w-auto"
            style={{ filter: "brightness(0) saturate(100%) invert(58%) sepia(69%) saturate(400%) hue-rotate(95deg) brightness(95%) contrast(95%)" }}
          />
        </Link>

        <div className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center">
          <h1 className="text-4xl font-bold tracking-tight text-white">
            Welcome back!
          </h1>
          <p className="mt-3 text-base text-neutral-400">
            Sign in to continue your learning journey with Basecamp Digital
          </p>

          <form className="mt-10" onSubmit={handleLogin}>
            <LabelInputContainer className="mb-5">
              <Label htmlFor="email" className="text-sm font-medium text-neutral-300">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="youremail@yourdomain.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 rounded-lg border-neutral-800 bg-neutral-900 text-white placeholder:text-neutral-600 focus-visible:border-neutral-700 focus-visible:ring-neutral-700"
              />
            </LabelInputContainer>

            <LabelInputContainer className="mb-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-medium text-neutral-300">
                  Password
                </Label>
                <Link
                  href="/auth/forgot-password"
                  className="text-xs text-neutral-500 hover:text-white transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 rounded-lg border-neutral-800 bg-neutral-900 pr-11 text-white placeholder:text-neutral-600 focus-visible:border-neutral-700 focus-visible:ring-neutral-700"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                </button>
              </div>
            </LabelInputContainer>

            {error && (
              <p className="mt-3 text-sm text-red-400">{error}</p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="group/btn relative mt-8 flex h-12 w-full items-center justify-center rounded-lg bg-neutral-800 text-sm font-semibold text-white shadow-[0px_1px_0px_0px_#27272a_inset,0px_-1px_0px_0px_#27272a_inset] transition-all hover:bg-neutral-700 disabled:opacity-50"
            >
              {isLoading ? "Signing in..." : "Sign in"}
              <BottomGradient />
            </button>

            {/* Divider */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-neutral-800" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-neutral-950 px-4 text-sm text-neutral-600">or</span>
              </div>
            </div>

            {/* Social buttons — row */}
            <div className="grid grid-cols-3 gap-3">
              <a
                href={`/api/auth/google${socialParams}`}
                className="group/btn relative flex h-12 items-center justify-center gap-2 rounded-lg border border-neutral-800 bg-neutral-900 transition-colors hover:bg-neutral-800"
              >
                <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
                  <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4" />
                  <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853" />
                  <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05" />
                  <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335" />
                </svg>
                <span className="text-sm font-medium text-white">Google</span>
                <BottomGradient />
              </a>

              <a
                href={`/api/auth/facebook${socialParams}`}
                className="group/btn relative flex h-12 items-center justify-center gap-2 rounded-lg border border-neutral-800 bg-neutral-900 transition-colors hover:bg-neutral-800"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" fill="#1877F2">
                  <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.93-1.956 1.887v2.267h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z" />
                </svg>
                <span className="text-sm font-medium text-white">Facebook</span>
                <BottomGradient />
              </a>

              <a
                href={`/api/auth/linkedin${socialParams}`}
                className="group/btn relative flex h-12 items-center justify-center gap-2 rounded-lg border border-neutral-800 bg-neutral-900 transition-colors hover:bg-neutral-800"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" fill="#0A66C2">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
                <span className="text-sm font-medium text-white">LinkedIn</span>
                <BottomGradient />
              </a>
            </div>
          </form>

          <p className="mt-10 text-sm text-neutral-500">
            Don&apos;t have an account?{" "}
            <Link
              href={`/auth/sign-up${next !== "/" ? `?next=${encodeURIComponent(next)}` : ""}`}
              className="text-emerald-500 hover:text-emerald-400 transition-colors"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>

      {/* ── Right: Visual + Testimonial ───────────────────────────────────── */}
      <AuthRightPanel />
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}
