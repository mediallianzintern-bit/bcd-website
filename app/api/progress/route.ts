import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"

export async function POST(request: Request) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { lessonId, completed } = await request.json()

  if (!lessonId) {
    return NextResponse.json({ error: "lessonId is required" }, { status: 400 })
  }

  if (completed) {
    await prisma.lessonProgress.upsert({
      where: { userId_lessonId: { userId: user.id, lessonId } },
      create: {
        userId: user.id,
        lessonId,
        completed: true,
        completedAt: new Date(),
      },
      update: {
        completed: true,
        completedAt: new Date(),
      },
    })
  } else {
    await prisma.lessonProgress.deleteMany({
      where: { userId: user.id, lessonId },
    })
  }

  return NextResponse.json({ success: true })
}
