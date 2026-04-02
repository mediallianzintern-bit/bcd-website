import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getLDCourses } from "@/lib/learndash"

export async function GET() {
  const user = await getCurrentUser()
  if (!user?.isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const [localCourses, ldCourses] = await Promise.allSettled([
    prisma.course.findMany({
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { enrollments: true, sections: true } } },
    }),
    getLDCourses(),
  ])

  return NextResponse.json({
    localCourses: localCourses.status === "fulfilled" ? localCourses.value : [],
    ldCourses: ldCourses.status === "fulfilled" ? ldCourses.value : [],
  })
}
