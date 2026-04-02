import { NextResponse } from "next/server"
import { SignJWT } from "jose"
import { prisma } from "@/lib/prisma"
import nodemailer from "nodemailer"

const RESET_TOKEN_SECRET = new TextEncoder().encode(
  (process.env.AUTH_SECRET || "fallback-secret-change-me") + "-reset"
)

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    const user = await prisma.user.findUnique({ where: { email } })

    // Always return success to prevent email enumeration
    if (!user) {
      return NextResponse.json({ success: true })
    }

    // Generate a reset token (valid for 1 hour)
    const resetToken = await new SignJWT({ id: user.id, email: user.email })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("1h")
      .sign(RESET_TOKEN_SECRET)

    const baseUrl = process.env.AUTH_URL || "http://localhost:3000"
    const resetUrl = `${baseUrl}/auth/reset-password?token=${resetToken}`

    // Send email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    })

    await transporter.sendMail({
      from: `"Basecamp Digital" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: "Reset your password - Basecamp Digital",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
          <h2 style="color: #333;">Reset your password</h2>
          <p style="color: #666; line-height: 1.6;">
            We received a request to reset your password. Click the button below to set a new password.
          </p>
          <a href="${resetUrl}" style="display: inline-block; background: #16a34a; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 16px 0;">
            Reset Password
          </a>
          <p style="color: #999; font-size: 13px; margin-top: 24px;">
            This link expires in 1 hour. If you didn't request this, you can safely ignore this email.
          </p>
        </div>
      `,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Forgot password error:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}
