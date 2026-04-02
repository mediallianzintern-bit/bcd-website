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

  const where = search
    ? {
        OR: [
          { email: { contains: search } },
          { fullName: { contains: search } },
        ],
      }
    : {}

  const ldEnrollment = (prisma as any).ldEnrollment

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        email: true,
        fullName: true,
        isAdmin: true,
        wpUserId: true,
        createdAt: true,
        _count: { select: { enrollments: true } },
      },
    }),
    prisma.user.count({ where }),
  ])

  // Add LD enrollment counts per user
  const userIds = users.map((u: any) => u.id)
  let ldCounts: any[] = []
  try {
    ldCounts = ldEnrollment
      ? await ldEnrollment.groupBy({ by: ["userId"], where: { userId: { in: userIds } }, _count: { userId: true } })
      : []
  } catch {}
  const ldCountMap = new Map(ldCounts.map((r: any) => [r.userId, r._count.userId]))

  const usersWithTotal = users.map((u: any) => ({
    ...u,
    _count: { enrollments: u._count.enrollments + (ldCountMap.get(u.id) ?? 0) },
  }))

  return NextResponse.json({ users: usersWithTotal, total, pages: Math.ceil(total / limit) })
}

export async function PATCH(request: Request) {
  const user = await getCurrentUser()
  if (!user?.isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id, isAdmin } = await request.json()
  const updated = await prisma.user.update({
    where: { id },
    data: { isAdmin },
    select: { id: true, email: true, isAdmin: true },
  })

  return NextResponse.json({ user: updated })
}
