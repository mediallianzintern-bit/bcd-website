import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { prisma } from "@/lib/prisma"
import { generateAccessToken, generateRefreshToken, setAuthCookies } from "@/lib/auth"
import { createWPUser, findWPUserByEmail } from "@/lib/learndash"
import bcrypt from "bcryptjs"
import crypto from "crypto"

export async function GET(request: Request) {
  const appUrl = process.env.AUTH_URL || "http://localhost:3000"
  const { searchParams } = new URL(request.url)
  const code = searchParams.get("code")
  const state = searchParams.get("state")
  const error = searchParams.get("error")

  if (error || !code) {
    return NextResponse.redirect(`${appUrl}/auth/login?error=oauth_cancelled`)
  }

  const cookieStore = await cookies()
  const savedState = cookieStore.get("oauth_state")?.value
  const next = cookieStore.get("oauth_next")?.value || "/"
  cookieStore.delete("oauth_state")
  cookieStore.delete("oauth_next")

  if (!savedState || state !== savedState) {
    return NextResponse.redirect(`${appUrl}/auth/login?error=invalid_state`)
  }

  // Exchange code for access token
  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      redirect_uri: `${appUrl}/api/auth/google/callback`,
      grant_type: "authorization_code",
    }),
    cache: "no-store",
  })

  if (!tokenRes.ok) {
    return NextResponse.redirect(`${appUrl}/auth/login?error=google_token_failed`)
  }

  const { access_token } = await tokenRes.json()

  // Fetch Google profile
  const profileRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
    headers: { Authorization: `Bearer ${access_token}` },
    cache: "no-store",
  })

  if (!profileRes.ok) {
    return NextResponse.redirect(`${appUrl}/auth/login?error=google_profile_failed`)
  }

  const profile = await profileRes.json()
  const { email, name, picture } = profile

  if (!email) {
    return NextResponse.redirect(`${appUrl}/auth/login?error=no_email`)
  }

  // Find existing user or create a new one (linked by email)
  let user = await prisma.user.findUnique({ where: { email } })
  if (!user) {
    // OAuth users get a random unhashable password — they log in via OAuth only
    const passwordHash = await bcrypt.hash(crypto.randomBytes(32).toString("hex"), 10)
    user = await prisma.user.create({
      data: {
        email,
        fullName: name || email.split("@")[0],
        avatarUrl: picture || null,
        passwordHash,
      },
    })
  }

  // Sync WP user if missing (non-blocking)
  if (!user.wpUserId) {
    try {
      const existing = await findWPUserByEmail(email)
      const wpUser = existing ?? await createWPUser(email, crypto.randomBytes(16).toString("hex"), user.fullName || email)
      if (wpUser) {
        await prisma.user.update({ where: { id: user.id }, data: { wpUserId: wpUser.id } })
        user = { ...user, wpUserId: wpUser.id }
      }
    } catch {}
  }

  // Same JWT flow as email/password login
  const tokenPayload = {
    id: user.id,
    email: user.email,
    name: user.fullName,
    isAdmin: user.isAdmin,
    wpUserId: user.wpUserId ?? null,
  }

  const accessToken = await generateAccessToken(tokenPayload)
  const refreshToken = await generateRefreshToken({ id: user.id })
  await setAuthCookies(accessToken, refreshToken)

  return NextResponse.redirect(`${appUrl}${next}`)
}
