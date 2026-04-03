import { notFound, redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"
import { LearnPageWrapper } from "./learn-page-wrapper"
import { mapCourse } from "@/lib/map-course"
import { mapSection, mapLesson } from "@/lib/map-section"
import {
  getLDCourseBySlug,
  getLDCourseSteps,
  getLDLessonsForCourse,
  getLDLessonById,
  getLDTopicById,
  getLDTopicsForCourse,
  isLDUserEnrolled,
  getLDUserProgress,
  mapLDCourse,
  mapLDLesson,
  buildLDSections,
  type LDLesson,
} from "@/lib/learndash"
import { COURSE_PRICES } from "@/lib/course-prices"
import type { Course, Section } from "@/lib/types"

interface LearnPageProps {
  params: Promise<{ slug: string; lessonId: string }>
}

export async function generateMetadata({ params }: LearnPageProps) {
  const { lessonId } = await params

  // Local lesson
  const localLesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    select: { title: true },
  }).catch(() => null)
  if (localLesson) {
    return { title: `${localLesson.title} - Basecamp Digital` }
  }

  // LearnDash lesson
  const ldLessonId = parseInt(lessonId)
  if (!isNaN(ldLessonId)) {
    const lesson = await getLDLessonById(ldLessonId)
    if (lesson) {
      return { title: `${lesson.title.rendered} - Basecamp Digital` }
    }
  }

  return { title: "Learn - Basecamp Digital" }
}

export default async function LearnPage({ params }: LearnPageProps) {
  const { slug, lessonId } = await params
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

    const mappedSections = sections.map(mapSection)
    const currentLessonPrisma = await prisma.lesson.findUnique({ where: { id: lessonId } })
    if (!currentLessonPrisma) notFound()

    const currentLesson = mapLesson(currentLessonPrisma)

    const enrollment = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId: user.id, courseId: localCourse.id } },
    })
    if (!enrollment && !user.isAdmin && !currentLesson.is_preview) redirect(`/courses/${slug}`)

    const progress = await prisma.lessonProgress.findMany({
      where: { userId: user.id, completed: true },
      select: { lessonId: true },
    })
    const completedLessonIds = progress.map((p) => p.lessonId)

    const allLessons = mappedSections.flatMap((s) => s.lessons || [])
    const currentIndex = allLessons.findIndex((l) => l.id === lessonId)
    const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null
    const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null

    return (
      <LearnPageWrapper
        course={mapCourse(localCourse)}
        sections={mappedSections}
        currentLesson={currentLesson}
        completedLessonIds={completedLessonIds}
        prevLessonId={prevLesson?.id || null}
        nextLessonId={nextLesson?.id || null}
      />
    )
  }

  // ── LearnDash (premium) course ────────────────────────────────────────────
  const ldCourse = await getLDCourseBySlug(slug)
  if (!ldCourse) notFound()

  // Check enrollment — admins always have access
  const enrolled = user.isAdmin || (user.wpUserId
    ? await isLDUserEnrolled(ldCourse.id, user.wpUserId)
    : false)
  if (!enrolled) redirect(`/courses/${slug}`)

  const ldLessonId = parseInt(lessonId)
  if (isNaN(ldLessonId)) notFound()

  const [steps, lessons, topics] = await Promise.all([
    getLDCourseSteps(ldCourse.id),
    getLDLessonsForCourse(ldCourse.id),
    getLDTopicsForCourse(ldCourse.id),
  ])

  let currentLDLesson = lessons.find((l) => l.id === ldLessonId)
  let isTopic = false
  if (!currentLDLesson) {
    const topic = await getLDTopicById(ldLessonId)
    if (!topic) notFound()
    currentLDLesson = topic
    isTopic = true
  }

  const mappedCourse = mapLDCourse(ldCourse) as Course
  const priceInfo = COURSE_PRICES[ldCourse.id] || COURSE_PRICES[ldCourse.slug]
  if (priceInfo) {
    mappedCourse.price = priceInfo.price
    mappedCourse.original_price = priceInfo.originalPrice ?? null
  }
  mappedCourse.wp_id = ldCourse.id

  const mappedSections: Section[] = buildLDSections(String(ldCourse.id), steps, lessons, new Map(), topics)

  // Build topicsByLesson map from topic.lesson field (same approach as buildLDSections)
  const topicsByLesson = new Map<number, LDLesson[]>()
  for (const topic of topics) {
    if (topic.lesson != null) {
      const list = topicsByLesson.get(topic.lesson) ?? []
      list.push(topic)
      topicsByLesson.set(topic.lesson, list)
    }
  }
  for (const [, list] of topicsByLesson) {
    list.sort((a, b) => a.menu_order - b.menu_order)
  }

  // If this lesson has no video but has sub-topics, redirect to the first topic
  if (!isTopic) {
    const lessonTopics = topicsByLesson.get(ldLessonId) ?? []
    if (lessonTopics.length > 0 && !currentLDLesson.video_url) {
      redirect(`/learn/${slug}/${lessonTopics[0].id}`)
    }
  }

  // Build a virtual section id for the current lesson
  const sectionId = mappedSections[0]?.id || `ld-section-${ldCourse.id}-1`
  const currentLesson = mapLDLesson(currentLDLesson, sectionId, currentLDLesson.menu_order)

  // Progress — read from Prisma (same place /api/progress writes to)
  const progressRows = await prisma.lessonProgress.findMany({
    where: { userId: user.id, completed: true },
    select: { lessonId: true },
  })
  const completedLessonIds = progressRows.map((p) => p.lessonId)

  // Prev / next navigation — flat ordered list: lessons → topics → lesson quizzes → course quizzes
  const flatOrderedIds: string[] = []
  const addedQuizIds = new Set<number>()

  for (const lsnId of steps.t["sfwd-lessons"] ?? []) {
    flatOrderedIds.push(String(lsnId))

    // Sub-topics for this lesson
    const lessonTopics = topicsByLesson.get(lsnId) ?? []
    for (const t of lessonTopics) {
      flatOrderedIds.push(String(t.id))
    }

    // Quizzes attached to this specific lesson (from the course hierarchy)
    const lessonQuizIds: number[] =
      steps.h?.["sfwd-lessons"]?.[String(lsnId)]?.["sfwd-quiz"] ?? []
    for (const qId of lessonQuizIds) {
      flatOrderedIds.push(`quiz/${qId}`)
      addedQuizIds.add(qId)
    }
  }

  // Any course-level quizzes not already placed after a lesson
  for (const qId of steps.t["sfwd-quiz"] ?? []) {
    if (!addedQuizIds.has(qId)) {
      flatOrderedIds.push(`quiz/${qId}`)
    }
  }

  const currentIndex = flatOrderedIds.indexOf(String(ldLessonId))
  const prevLessonId = currentIndex > 0 ? flatOrderedIds[currentIndex - 1] : null

  let nextLessonId: string | null = null
  if (currentIndex >= 0 && currentIndex < flatOrderedIds.length - 1) {
    nextLessonId = flatOrderedIds[currentIndex + 1]
  }
  const nextIsQuiz = nextLessonId?.startsWith("quiz/") ?? false

  return (
    <LearnPageWrapper
      course={mappedCourse}
      sections={mappedSections}
      currentLesson={currentLesson}
      completedLessonIds={completedLessonIds}
      prevLessonId={prevLessonId}
      nextLessonId={nextLessonId}
      nextIsQuiz={nextIsQuiz}
    />
  )
}
