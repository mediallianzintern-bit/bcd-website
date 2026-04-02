import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import {
  generateAccessToken,
  generateRefreshToken,
  setAuthCookies,
} from "@/lib/auth"
import { createWPUser, findWPUserByEmail } from "@/lib/learndash"

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      )
    }

    const isValid = await bcrypt.compare(password, user.passwordHash)

    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      )
    }

    // Use stored WP user ID if already synced
    const wpUserId = user.wpUserId

    // If not synced yet, do it in the background — don't block login
    if (!wpUserId) {
      const userId = user.id
      const userName = user.fullName || email
      ;(async () => {
        try {
          const existing = await findWPUserByEmail(email)
          const id = existing?.id ?? (await createWPUser(email, password, userName))?.id
          if (id) await prisma.user.update({ where: { id: userId }, data: { wpUserId: id } })
        } catch {
          // Non-fatal — will retry on next login
        }
      })()
    }

    const tokenPayload = {
      id: user.id,
      email: user.email,
      name: user.fullName,
      isAdmin: user.isAdmin,
      wpUserId,
    }

    const accessToken = await generateAccessToken(tokenPayload)
    const refreshToken = await generateRefreshToken({ id: user.id })

    await setAuthCookies(accessToken, refreshToken)

    return NextResponse.json({ user: tokenPayload })
  } catch {
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    )
  }
}
