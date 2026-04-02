import { NextResponse, type NextRequest } from "next/server"
import { jwtVerify } from "jose"

const ACCESS_TOKEN_SECRET = new TextEncoder().encode(
  process.env.AUTH_SECRET || "fallback-secret-change-me"
)

async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, ACCESS_TOKEN_SECRET)
    return payload
  } catch {
    return null
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // ── Admin routes ─────────────────────────────────────────────────────────
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    const token = request.cookies.get("access_token")?.value
    if (!token) {
      const url = request.nextUrl.clone()
      url.pathname = "/admin/login"
      return NextResponse.redirect(url)
    }
    const payload = await verifyToken(token)
    if (!payload || !payload.isAdmin) {
      const url = request.nextUrl.clone()
      url.pathname = payload ? "/" : "/admin/login"
      return NextResponse.redirect(url)
    }
    return NextResponse.next()
  }

  // ── Protected user routes ─────────────────────────────────────────────────
  const protectedPaths = ["/learn", "/dashboard"]
  const isProtected = protectedPaths.some((p) => pathname.startsWith(p))

  if (!isProtected) {
    return NextResponse.next()
  }

  const accessToken = request.cookies.get("access_token")?.value

  if (!accessToken) {
    const url = request.nextUrl.clone()
    url.pathname = "/auth/login"
    url.searchParams.set("next", pathname)
    return NextResponse.redirect(url)
  }

  const payload = await verifyToken(accessToken)

  if (!payload) {
    const refreshToken = request.cookies.get("refresh_token")?.value
    if (!refreshToken) {
      const url = request.nextUrl.clone()
      url.pathname = "/auth/login"
      url.searchParams.set("next", pathname)
      return NextResponse.redirect(url)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
