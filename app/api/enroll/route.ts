import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"
import { enrollLDUser, findWPUserByEmail, createWPUser } from "@/lib/learndash"
import crypto from "crypto"
import nodemailer from "nodemailer"

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_APP_PASSWORD },
})

async function sendEnrollmentEmail(name: string, email: string, courseTitle: string) {
  await transporter.sendMail({
    from: `"Basecamp Digital" <${process.env.GMAIL_USER}>`,
    to: email,
    subject: `You're now enrolled in ${courseTitle}!`,
    html: `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/></head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:40px 20px;">
    <tr><td align="center">
      <table width="620" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.10);">
        <tr>
          <td style="background:linear-gradient(135deg,#1a7a3c 0%,#22a94f 100%);padding:36px 48px;text-align:center;">
            <p style="margin:0;color:rgba(255,255,255,0.85);font-size:13px;letter-spacing:3px;text-transform:uppercase;font-weight:600;">Basecamp Digital</p>
            <p style="margin:12px 0 0;color:#ffffff;font-size:26px;font-weight:800;">You're In! 🎉</p>
          </td>
        </tr>
        <tr>
          <td style="padding:40px 48px 32px;">
            <p style="margin:0 0 16px;color:#333;font-size:16px;">Hello ${name},</p>
            <p style="margin:0 0 16px;color:#555;font-size:15px;line-height:1.7;">
              You have successfully enrolled in <strong>${courseTitle}</strong>. You can now access all the lessons for free.
            </p>
            <p style="margin:0 0 32px;color:#555;font-size:15px;line-height:1.7;">
              Complete all lessons and pass the quiz to earn your certificate of completion. Good luck!
            </p>
            <table cellpadding="0" cellspacing="0">
              <tr>
                <td style="background:#22a94f;border-radius:8px;">
                  <a href="https://bcd-website-psi.vercel.app/dashboard" style="display:inline-block;padding:14px 32px;color:#ffffff;font-size:15px;font-weight:700;text-decoration:none;">Start Learning →</a>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding:0 48px 32px;">
            <p style="margin:0 0 4px;color:#555;font-size:14px;">Regards,</p>
            <p style="margin:0;font-weight:700;color:#1a1a1a;font-size:14px;">Pritesh Patel</p>
            <p style="margin:0;color:#888;font-size:13px;">Head Coach, Basecamp Digital</p>
          </td>
        </tr>
        <tr>
          <td style="background:#1a1a1a;padding:20px 48px;text-align:center;">
            <p style="margin:0;color:#aaa;font-size:11px;">© 2026 Basecamp Digital. All Rights Reserved.</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
  })
}

export async function POST(request: Request) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { courseId, courseTitle } = await request.json()

  if (!courseId) {
    return NextResponse.json({ error: "courseId is required" }, { status: 400 })
  }

  // LearnDash courses have numeric IDs; Prisma courses use CUIDs (alphanumeric)
  const wpCourseId = Number(courseId)
  const isLearnDash = !isNaN(wpCourseId) && wpCourseId > 0

  if (isLearnDash) {
    // Always read wpUserId fresh from DB (JWT may be stale)
    let wpUserId = user.wpUserId
    if (!wpUserId) {
      const dbUser = await prisma.user.findUnique({
        where: { id: user.id },
        select: { wpUserId: true, email: true, fullName: true },
      })
      wpUserId = dbUser?.wpUserId ?? null

      // Still missing — sync WP user on-demand right now
      if (!wpUserId && dbUser) {
        const existing = await findWPUserByEmail(dbUser.email)
        if (existing) {
          wpUserId = existing.id
        } else {
          const created = await createWPUser(
            dbUser.email,
            crypto.randomBytes(16).toString("hex"),
            dbUser.fullName || dbUser.email
          )
          if (created) {
            wpUserId = created.id
          } else {
            // createWPUser may fail with "existing_user_email" if findWPUserByEmail
            // missed them — retry the lookup as a last resort
            const retry = await findWPUserByEmail(dbUser.email)
            wpUserId = retry?.id ?? null
          }
        }
        if (wpUserId) {
          await prisma.user.update({ where: { id: user.id }, data: { wpUserId } })
        }
      }
    }

    if (!wpUserId) {
      return NextResponse.json({ error: "Could not sync account with learning platform" }, { status: 500 })
    }

    try {
      await enrollLDUser(wpCourseId, wpUserId)
      // Track LD enrollment locally so admin panel can show it
      await (prisma as any).ldEnrollment?.upsert({
        where: { userId_wpCourseId: { userId: user.id, wpCourseId } },
        create: { userId: user.id, wpCourseId, courseTitle: courseTitle || `Course #${wpCourseId}` },
        update: {},
      }).catch(() => {})
      return NextResponse.json({ success: true })
    } catch (e) {
      const msg = e instanceof Error ? e.message : ""
      // Treat "already enrolled" as success
      if (msg.includes("already") || msg.includes("400")) {
        await (prisma as any).ldEnrollment?.upsert({
          where: { userId_wpCourseId: { userId: user.id, wpCourseId } },
          create: { userId: user.id, wpCourseId, courseTitle: courseTitle || `Course #${wpCourseId}` },
          update: {},
        }).catch(() => {})
        return NextResponse.json({ success: true })
      }
      return NextResponse.json({ error: "Enrollment failed" }, { status: 500 })
    }
  }

  // Local (Prisma / crash) course
  try {
    await prisma.enrollment.create({
      data: { userId: user.id, courseId },
    })
    // Send welcome email — fire and forget
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { fullName: true, email: true },
    }).catch(() => null)
    if (dbUser) {
      sendEnrollmentEmail(dbUser.fullName || dbUser.email, dbUser.email, courseTitle || "your course").catch(() => {})
    }
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Already enrolled or invalid course" }, { status: 400 })
  }
}
