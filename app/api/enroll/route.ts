import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"
import { enrollLDUser, findWPUserByEmail, createWPUser } from "@/lib/learndash"
import crypto from "crypto"

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

  // Local (Prisma) course
  try {
    await prisma.enrollment.create({
      data: { userId: user.id, courseId },
    })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "Already enrolled or invalid course" }, { status: 400 })
  }
}
