import { SignJWT, jwtVerify } from "jose"
import { cookies } from "next/headers"

const ACCESS_TOKEN_SECRET = new TextEncoder().encode(
  process.env.AUTH_SECRET || "fallback-secret-change-me"
)
const REFRESH_TOKEN_SECRET = new TextEncoder().encode(
  (process.env.AUTH_SECRET || "fallback-secret-change-me") + "-refresh"
)

const ACCESS_TOKEN_EXPIRY = "15m"
const REFRESH_TOKEN_EXPIRY = "7d"

export interface TokenPayload {
  id: string
  email: string
  name: string | null
  isAdmin: boolean
  wpUserId: number | null
}

// --- Token generation ---

export async function generateAccessToken(payload: TokenPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(ACCESS_TOKEN_EXPIRY)
    .sign(ACCESS_TOKEN_SECRET)
}

export async function generateRefreshToken(payload: { id: string }): Promise<string> {
  return new SignJWT({ id: payload.id })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(REFRESH_TOKEN_EXPIRY)
    .sign(REFRESH_TOKEN_SECRET)
}

// --- Token verification ---

export async function verifyAccessToken(token: string): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, ACCESS_TOKEN_SECRET)
    return payload as unknown as TokenPayload
  } catch {
    return null
  }
}

export async function verifyRefreshToken(token: string): Promise<{ id: string } | null> {
  try {
    const { payload } = await jwtVerify(token, REFRESH_TOKEN_SECRET)
    return { id: payload.id as string }
  } catch {
    return null
  }
}

// --- Cookie management ---

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
}

export async function setAuthCookies(accessToken: string, refreshToken: string) {
  const cookieStore = await cookies()

  cookieStore.set("access_token", accessToken, {
    ...COOKIE_OPTIONS,
    maxAge: 15 * 60, // 15 minutes
  })

  cookieStore.set("refresh_token", refreshToken, {
    ...COOKIE_OPTIONS,
    maxAge: 7 * 24 * 60 * 60, // 7 days
  })
}

export async function clearAuthCookies() {
  const cookieStore = await cookies()
  cookieStore.delete("access_token")
  cookieStore.delete("refresh_token")
}

export async function getAuthCookies() {
  const cookieStore = await cookies()
  return {
    accessToken: cookieStore.get("access_token")?.value || null,
    refreshToken: cookieStore.get("refresh_token")?.value || null,
  }
}

// --- Helper: get current user from cookies (for server components) ---

export async function getCurrentUser(): Promise<TokenPayload | null> {
  const { accessToken } = await getAuthCookies()
  if (!accessToken) return null
  return verifyAccessToken(accessToken)
}
