import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import {
  verifyRefreshToken,
  generateAccessToken,
  generateRefreshToken,
  setAuthCookies,
  getAuthCookies,
} from "@/lib/auth"

export async function POST() {
  try {
    const { refreshToken } = await getAuthCookies()

    if (!refreshToken) {
      return NextResponse.json(
        { error: "No refresh token" },
        { status: 401 }
      )
    }

    const payload = await verifyRefreshToken(refreshToken)

    if (!payload) {
      return NextResponse.json(
        { error: "Invalid refresh token" },
        { status: 401 }
      )
    }

    // Fetch fresh user data
    const user = await prisma.user.findUnique({
      where: { id: payload.id },
    })

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 401 }
      )
    }

    const tokenPayload = {
      id: user.id,
      email: user.email,
      name: user.fullName,
      isAdmin: user.isAdmin,
      wpUserId: user.wpUserId ?? null,
    }

    // Rotate both tokens
    const newAccessToken = await generateAccessToken(tokenPayload)
    const newRefreshToken = await generateRefreshToken({ id: user.id })

    await setAuthCookies(newAccessToken, newRefreshToken)

    return NextResponse.json({
      user: tokenPayload,
    })
  } catch {
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    )
  }
}
