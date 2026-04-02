import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const user = await getCurrentUser()
  if (!user?.isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const ldEnrollment = (prisma as any).ldEnrollment

  const [totalUsers, totalCourses, localEnrollmentCount, ldEnrollmentCount, recentUsers, recentLocal, recentLd] = await Promise.all([
    prisma.user.count(),
    prisma.course.count(),
    prisma.enrollment.count(),
    ldEnrollment ? ldEnrollment.count() : Promise.resolve(0),
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, fullName: true, email: true, createdAt: true, isAdmin: true },
    }),
    prisma.enrollment.findMany({
      orderBy: { enrolledAt: "desc" },
      take: 8,
      include: {
        user: { select: { fullName: true, email: true } },
        course: { select: { title: true } },
      },
    }),
    ldEnrollment
      ? ldEnrollment.findMany({
          orderBy: { enrolledAt: "desc" },
          take: 8,
          include: { user: { select: { fullName: true, email: true } } },
        })
      : Promise.resolve([]),
  ])

  // Merge local + LD enrollments, sort by date, take top 5
  const recentEnrollments = [
    ...recentLocal.map((e: any) => ({
      id: e.id,
      enrolledAt: e.enrolledAt,
      user: e.user,
      course: { title: e.course.title },
    })),
    ...recentLd.map((e: any) => ({
      id: e.id,
      enrolledAt: e.enrolledAt,
      user: e.user,
      course: { title: e.courseTitle },
    })),
  ]
    .sort((a, b) => new Date(b.enrolledAt).getTime() - new Date(a.enrolledAt).getTime())
    .slice(0, 5)

  return NextResponse.json({
    stats: { totalUsers, totalCourses, totalEnrollments: localEnrollmentCount + ldEnrollmentCount },
    recentUsers,
    recentEnrollments,
  })
}
