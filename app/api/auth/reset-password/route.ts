import { NextResponse } from "next/server"
import { jwtVerify } from "jose"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"

const RESET_TOKEN_SECRET = new TextEncoder().encode(
  (process.env.AUTH_SECRET || "fallback-secret-change-me") + "-reset"
)

export async function POST(request: Request) {
  try {
    const { token, password } = await request.json()

    if (!token || !password) {
      return NextResponse.json(
        { error: "Token and password are required" },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      )
    }

    // Verify reset token
    let payload
    try {
      const result = await jwtVerify(token, RESET_TOKEN_SECRET)
      payload = result.payload
    } catch {
      return NextResponse.json(
        { error: "Invalid or expired reset link. Please request a new one." },
        { status: 400 }
      )
    }

    const userId = payload.id as string

    // Hash new password and update
    const passwordHash = await bcrypt.hash(password, 12)

    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    )
  }
}
