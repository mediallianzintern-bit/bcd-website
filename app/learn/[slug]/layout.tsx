import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"
import { LearnLayoutClient } from "./learn-layout-client"
import { mapCourse } from "@/lib/map-course"
import { mapSection } from "@/lib/map-section"
import {
  getLDCourseBySlug,
  getLDCourseSteps,
  getLDLessonsForCourse,
  getLDQuizzesFromSteps,
  getLDUserProgress,
  mapLDCourse,
  buildLDSections,
  getVimeoDurationsForLessons,
  getLDTopicsForCourse,
  decodeHtml,
} from "@/lib/learndash"
import { COURSE_PRICES } from "@/lib/course-prices"
import type { Course } from "@/lib/types"

export default async function LearnSlugLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const user = await getCurrentUser()
  if (!user) redirect("/auth/login")

  // ── Local (crash/free) course ─────────────────────────────────────────────
  const localCourse = await prisma.course.findFirst({
    where: { slug, isPublished: true },
  })

  if (localCourse) {
    const sections = await prisma.section.findMany({
      where: { courseId: localCourse.id },
      include: { lessons: { orderBy: { orderIndex: "asc" } } },
      orderBy: { orderIndex: "asc" },
    })

    const allLessonIds = sections.flatMap((s) => s.lessons.map((l) => l.id))

    const progress = await prisma.lessonProgress.findMany({
      where: {
        userId: user.id,
        completed: true,
        lessonId: { in: allLessonIds.length > 0 ? allLessonIds : ["none"] },
      },
      select: { lessonId: true },
    })

    return (
      <LearnLayoutClient
        course={mapCourse(localCourse)}
        sections={sections.map(mapSection)}
        completedLessonIds={progress.map((p) => p.lessonId)}
        totalLessons={allLessonIds.length}
      >
        {children}
      </LearnLayoutClient>
    )
  }

  // ── LearnDash (premium) course ────────────────────────────────────────────
  const ldCourse = await getLDCourseBySlug(slug)
  if (!ldCourse) return <>{children}</>

  let steps: Awaited<ReturnType<typeof getLDCourseSteps>>
  let lessons: Awaited<ReturnType<typeof getLDLessonsForCourse>>
  let durationMap: Map<number, number>
  let quizzes: Awaited<ReturnType<typeof getLDQuizzesFromSteps>>
  let topics: Awaited<ReturnType<typeof getLDTopicsForCourse>>

  try {
    ;[steps, lessons] = await Promise.all([
      getLDCourseSteps(ldCourse.id),
      getLDLessonsForCourse(ldCourse.id),
    ])
    ;[durationMap, quizzes, topics] = await Promise.all([
      getVimeoDurationsForLessons(lessons),
      getLDQuizzesFromSteps(steps),
      getLDTopicsForCourse(ldCourse.id),
    ])
  } catch {
    steps = { h: {}, t: { "sfwd-lessons": [], "sfwd-topic": [], "sfwd-quiz": [] }, l: [], sections: [] }
    lessons = []
    durationMap = new Map()
    quizzes = []
    topics = []
  }

  const mappedCourse = mapLDCourse(ldCourse) as Course
  const priceInfo = COURSE_PRICES[ldCourse.id] || COURSE_PRICES[ldCourse.slug]
  if (priceInfo) {
    mappedCourse.price = priceInfo.price
    mappedCourse.original_price = priceInfo.originalPrice ?? null
  }
  mappedCourse.wp_id = ldCourse.id

  const mappedSections = buildLDSections(String(ldCourse.id), steps, lessons, durationMap, topics)

  let completedLessonIds: string[] = []
  if (user.wpUserId) {
    const progress = await getLDUserProgress(user.wpUserId, ldCourse.id)
    if (progress && progress.steps_completed > 0) {
      completedLessonIds = steps.t["sfwd-lessons"]
        .slice(0, progress.steps_completed)
        .map(String)
    }
  }

  const totalLessons = lessons.length

  return (
    <LearnLayoutClient
      course={mappedCourse}
      sections={mappedSections}
      completedLessonIds={completedLessonIds}
      totalLessons={totalLessons}
      quizzes={quizzes.map((q) => ({ id: q.id, title: decodeHtml(q.title.rendered) }))}
    >
      {children}
    </LearnLayoutClient>
  )
}
