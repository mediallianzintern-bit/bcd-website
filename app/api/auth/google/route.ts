import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import crypto from "crypto"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const next = searchParams.get("next") || "/"

  const state = crypto.randomBytes(16).toString("hex")
  const cookieStore = await cookies()
  cookieStore.set("oauth_state", state, { httpOnly: true, sameSite: "lax", maxAge: 600, path: "/" })
  cookieStore.set("oauth_next", next, { httpOnly: true, sameSite: "lax", maxAge: 600, path: "/" })

  const appUrl = process.env.AUTH_URL || "http://localhost:3000"
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID!,
    redirect_uri: `${appUrl}/api/auth/google/callback`,
    response_type: "code",
    scope: "openid email profile",
    state,
    access_type: "offline",
    prompt: "select_account",
  })

  return NextResponse.redirect(
    `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
  )
}
