import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  const user = await getCurrentUser()
  if (!user?.isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const search = searchParams.get("search") || ""
  const page = parseInt(searchParams.get("page") || "1")
  const limit = 20

  const ldEnrollment = (prisma as any).ldEnrollment

  const localWhere = search
    ? {
        OR: [
          { user: { email: { contains: search } } },
          { user: { fullName: { contains: search } } },
          { course: { title: { contains: search } } },
        ],
      }
    : {}

  const ldWhere = search
    ? {
        OR: [
          { user: { email: { contains: search } } },
          { user: { fullName: { contains: search } } },
          { courseTitle: { contains: search } },
        ],
      }
    : {}

  const [localRows, ldRows] = await Promise.all([
    prisma.enrollment.findMany({
      where: localWhere,
      orderBy: { enrolledAt: "desc" },
      include: {
        user: { select: { id: true, fullName: true, email: true } },
        course: { select: { id: true, title: true, price: true } },
      },
    }),
    ldEnrollment
      ? ldEnrollment.findMany({
          where: ldWhere,
          orderBy: { enrolledAt: "desc" },
          include: { user: { select: { id: true, fullName: true, email: true } } },
        })
      : Promise.resolve([]),
  ])

  const allEnrollments = [
    ...localRows.map((e: any) => ({
      id: e.id,
      enrolledAt: e.enrolledAt,
      user: e.user,
      course: { id: e.course.id, title: e.course.title, price: e.course.price },
      type: "local",
    })),
    ...ldRows.map((e: any) => ({
      id: e.id,
      enrolledAt: e.enrolledAt,
      user: e.user,
      course: { id: null, title: e.courseTitle, price: null },
      type: "ld",
    })),
  ].sort((a, b) => new Date(b.enrolledAt).getTime() - new Date(a.enrolledAt).getTime())

  const total = allEnrollments.length
  const enrollments = allEnrollments.slice((page - 1) * limit, page * limit)

  return NextResponse.json({ enrollments, total, pages: Math.ceil(total / limit) })
}

export async function POST(request: Request) {
  const user = await getCurrentUser()
  if (!user?.isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { userId, courseId } = await request.json()
  const enrollment = await prisma.enrollment.create({
    data: { userId, courseId },
    include: {
      user: { select: { fullName: true, email: true } },
      course: { select: { title: true } },
    },
  })

  return NextResponse.json({ enrollment })
}

export async function DELETE(request: Request) {
  const user = await getCurrentUser()
  if (!user?.isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id, type } = await request.json()
  if (type === "ld") {
    await (prisma as any).ldEnrollment?.delete({ where: { id } })
  } else {
    await prisma.enrollment.delete({ where: { id } })
  }
  return NextResponse.json({ success: true })
}
