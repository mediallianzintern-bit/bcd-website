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
  const tokenRes = await fetch(
    `https://graph.facebook.com/v19.0/oauth/access_token?` +
      new URLSearchParams({
        client_id: process.env.FACEBOOK_APP_ID!,
        client_secret: process.env.FACEBOOK_APP_SECRET!,
        redirect_uri: `${appUrl}/api/auth/facebook/callback`,
        code,
      }),
    { cache: "no-store" }
  )

  if (!tokenRes.ok) {
    return NextResponse.redirect(`${appUrl}/auth/login?error=facebook_token_failed`)
  }

  const { access_token } = await tokenRes.json()

  // Fetch Facebook profile (email requires app review for non-test users in production)
  const profileRes = await fetch(
    `https://graph.facebook.com/me?fields=id,name,email,picture.type(large)&access_token=${access_token}`,
    { cache: "no-store" }
  )

  if (!profileRes.ok) {
    return NextResponse.redirect(`${appUrl}/auth/login?error=facebook_profile_failed`)
  }

  const profile = await profileRes.json()
  const { name, email, picture } = profile

  if (!email) {
    // Facebook may not return email if user's account has no email or permission was denied
    return NextResponse.redirect(`${appUrl}/auth/login?error=no_email`)
  }

  // Find existing user or create a new one (linked by email)
  let user = await prisma.user.findUnique({ where: { email } })
  if (!user) {
    const passwordHash = await bcrypt.hash(crypto.randomBytes(32).toString("hex"), 10)
    user = await prisma.user.create({
      data: {
        email,
        fullName: name || email.split("@")[0],
        avatarUrl: picture?.data?.url || null,
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
