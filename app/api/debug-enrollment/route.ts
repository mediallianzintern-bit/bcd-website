import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getLDCourseBySlug } from "@/lib/learndash"

export async function GET(request: Request) {
  const url = new URL(request.url)
  const slug = url.searchParams.get("slug") || "content-native-influencer-marketing"

  const user = await getCurrentUser()

  // Check if local course exists
  let localCourse = null
  try {
    localCourse = await prisma.course.findFirst({
      where: { slug, isPublished: true },
      select: { id: true, slug: true, title: true },
    })
  } catch (e: unknown) {
    return NextResponse.json({ error: "DB error on local course", detail: String(e) })
  }

  // Check LD course
  let ldCourse = null
  try {
    ldCourse = await getLDCourseBySlug(slug)
  } catch {}

  const result: Record<string, unknown> = {
    user: user ? { id: user.id, email: user.email, isAdmin: user.isAdmin } : null,
    localCourseFound: !!localCourse,
    localCourse,
    ldCourseFound: !!ldCourse,
    ldCourseId: ldCourse?.id ?? null,
    path: localCourse ? "LOCAL" : ldCourse ? "LEARNDASH" : "NOT_FOUND",
  }

  if (localCourse && user) {
    result.wouldCheckEnrollmentTable = true
    result.isAdminCheckInLocalPath = "NOT IMPLEMENTED — this is the bug"
  }

  if (!localCourse && ldCourse && user) {
    result.isAdminFromJWT = user.isAdmin
    result.wouldSetIsEnrolled = !!user.isAdmin
  }

  return NextResponse.json(result)
}
