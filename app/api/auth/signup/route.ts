import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import {
  generateAccessToken,
  generateRefreshToken,
  setAuthCookies,
} from "@/lib/auth"
import { createWPUser } from "@/lib/learndash"

export async function POST(request: Request) {
  try {
    const { email, password, fullName } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      )
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 }
      )
    }

    const passwordHash = await bcrypt.hash(password, 12)

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        fullName: fullName || null,
      },
    })

    // Create WordPress user for LearnDash enrollment (non-blocking)
    let wpUserId: number | null = null
    try {
      const wpUser = await createWPUser(email, password, fullName || email)
      if (wpUser) {
        wpUserId = wpUser.id
        await prisma.user.update({
          where: { id: user.id },
          data: { wpUserId },
        })
      }
    } catch (e) {
      console.error("WP user creation failed (non-fatal):", e)
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
