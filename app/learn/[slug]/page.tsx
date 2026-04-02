import { redirect, notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"
import {
  getLDCourseBySlug,
  getLDUserProgress,
  getLDCourseSteps,
} from "@/lib/learndash"

export default async function LearnSlugRedirect({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const user = await getCurrentUser()
  if (!user) redirect(`/auth/login?next=/courses/${slug}`)

  // ── 1. Try local (free/crash) course ────────────────────────────────────
  const course = await prisma.course.findFirst({
    where: { slug },
    select: { id: true },
  })

  if (course) {
    const sections = await prisma.section.findMany({
      where: { courseId: course.id },
      select: { id: true },
      orderBy: { orderIndex: "asc" },
    })

    const sectionIds = sections.map((s) => s.id)

    const lessons = await prisma.lesson.findMany({
      where: { sectionId: { in: sectionIds } },
      select: { id: true },
      orderBy: { orderIndex: "asc" },
    })

    if (lessons.length === 0) notFound()

    const progress = await prisma.lessonProgress.findMany({
      where: { userId: user.id, completed: true },
      select: { lessonId: true },
    })

    const completedIds = new Set(progress.map((p) => p.lessonId))
    const nextLesson = lessons.find((l) => !completedIds.has(l.id)) ?? lessons[0]

    redirect(`/learn/${slug}/${nextLesson.id}`)
  }

  // ── 2. Fall back to LearnDash (premium) course ───────────────────────────
  const ldCourse = await getLDCourseBySlug(slug)
  if (!ldCourse) notFound()

  // Use last_step from progress to resume; otherwise take the first lesson
  let resumeStepId: number | null = null

  if (user.wpUserId) {
    const ldProgress = await getLDUserProgress(user.wpUserId, ldCourse.id)
    if (ldProgress?.last_step) resumeStepId = ldProgress.last_step
  }

  if (!resumeStepId) {
    const steps = await getLDCourseSteps(ldCourse.id)
    const lessonIds = steps.t["sfwd-lessons"] ?? []
    resumeStepId = lessonIds[0] ?? null
  }

  if (!resumeStepId) notFound()

  redirect(`/learn/${slug}/${resumeStepId}`)
}
