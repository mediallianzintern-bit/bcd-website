import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { CourseDetailClient } from "./course-detail-client"
import { SocialProofToast } from "@/components/social-proof-toast"
import type { Metadata } from "next"
import { mapCourse } from "@/lib/map-course"
import { mapSection } from "@/lib/map-section"
import {
  getLDCourseBySlug,
  getLDCourseSteps,
  getLDLessonsForCourse,
  getLDTopicsForCourse,
  getLDQuizzesFromSteps,
  getLDMediaUrls,
  mapLDCourse,
  buildLDSections,
  getVimeoDurationsForLessons,
  decodeHtml,
} from "@/lib/learndash"
import { COURSE_PRICES } from "@/lib/course-prices"
import type { Course, Section } from "@/lib/types"
import { getCourseContentDefaults, type CourseContent } from "@/lib/course-content-defaults"

interface CoursePageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: CoursePageProps): Promise<Metadata> {
  const { slug } = await params

  // Check local first
  const localCourse = await prisma.course.findFirst({
    where: { slug, isPublished: true },
    select: { title: true, shortDescription: true },
  })
  if (localCourse) {
    return {
      title: `${localCourse.title} - Basecamp Digital`,
      description: localCourse.shortDescription,
    }
  }

  // Then LearnDash
  let ldCourse = null
  try { ldCourse = await getLDCourseBySlug(slug) } catch {}
  if (!ldCourse) return { title: "Course Not Found - Basecamp Digital" }

  return {
    title: `${ldCourse.title.rendered.replace(/&#038;/g, "&").replace(/&amp;/g, "&")} - Basecamp Digital`,
  }
}

export default async function CoursePage({ params }: CoursePageProps) {
  const { slug } = await params
  const user = await getCurrentUser()

  // ── Fetch editable course content (DB overrides defaults) ────────────────
  let dbContent = null
  try {
    dbContent = await prisma.courseContent.findUnique({ where: { slug } })
  } catch {
    // DB unreachable — use defaults
  }
  const defaults = getCourseContentDefaults(slug)
  const courseContent: CourseContent = dbContent
    ? {
        whatYouWillLearn: dbContent.whatYouWillLearn as string[],
        courseIncludes: dbContent.courseIncludes as string[],
        whoThisCourseIsFor: dbContent.whoThisCourseIsFor as string[],
        requirements: dbContent.requirements as string[],
        descriptionExtra: dbContent.descriptionExtra ?? defaults.descriptionExtra,
        breadcrumbItems: dbContent.breadcrumbItems as string[],
        breadcrumbHighlight: dbContent.breadcrumbHighlight ?? defaults.breadcrumbHighlight,
        thumbnailUrl: dbContent.thumbnailUrl ?? null,
        rating: dbContent.rating ?? defaults.rating,
        reviewsCount: dbContent.reviewsCount ?? defaults.reviewsCount,
        studentsCount: dbContent.studentsCount ?? defaults.studentsCount,
        lastUpdated: dbContent.lastUpdated ?? defaults.lastUpdated,
        language: dbContent.language ?? defaults.language,
        subtitleLanguages: dbContent.subtitleLanguages ?? defaults.subtitleLanguages,
        instructorName: dbContent.instructorName ?? defaults.instructorName,
        instructorTitle: dbContent.instructorTitle ?? defaults.instructorTitle,
        instructorRating: dbContent.instructorRating ?? defaults.instructorRating,
        instructorStudents: dbContent.instructorStudents ?? defaults.instructorStudents,
        instructorBio: dbContent.instructorBio ?? defaults.instructorBio,
        instructorAvatar: dbContent.instructorAvatar ?? null,
      }
    : defaults

  // ── Try local (crash/free) course first ──────────────────────────────────
  const localCourse = await prisma.course.findFirst({
    where: { slug, isPublished: true },
  })

  if (localCourse) {
    const sections = await prisma.section.findMany({
      where: { courseId: localCourse.id },
      include: { lessons: { orderBy: { orderIndex: "asc" } } },
      orderBy: { orderIndex: "asc" },
    })

    const mappedCourse = mapCourse(localCourse)
    // Override brochure URL from course-prices config if available (DB may have stale value)
    const localPriceInfo = COURSE_PRICES[localCourse.slug]
    if (localPriceInfo?.brochureUrl) {
      mappedCourse.brochure_url = localPriceInfo.brochureUrl
    }
    // DB price overrides (admin panel wins)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const _dbLocal = dbContent as any
    if (_dbLocal?.price != null) mappedCourse.price = _dbLocal.price
    if (_dbLocal?.originalPrice != null) mappedCourse.original_price = _dbLocal.originalPrice
    const mappedSections = sections.map(mapSection)

    let isEnrolled = false
    let completedLessonIds: string[] = []

    if (user) {
      const enrollment = await prisma.enrollment.findUnique({
        where: { userId_courseId: { userId: user.id, courseId: localCourse.id } },
      })
      isEnrolled = !!enrollment

      if (isEnrolled) {
        const lessonIds = sections.flatMap((s) => s.lessons.map((l) => l.id))
        const progress = await prisma.lessonProgress.findMany({
          where: {
            userId: user.id,
            completed: true,
            lessonId: { in: lessonIds.length > 0 ? lessonIds : ["none"] },
          },
          select: { lessonId: true },
        })
        completedLessonIds = progress.map((p) => p.lessonId)
      }
    }

    return (
      <div className="min-h-screen flex flex-col">
        <Navbar user={user ? { email: user.email, name: user.name || undefined } : null} isCrashCourse={mappedCourse.price === 0} />
        <main className="flex-1">
          <CourseDetailClient
            course={mappedCourse}
            sections={mappedSections}
            isEnrolled={isEnrolled}
            isLoggedIn={!!user}
            completedLessonIds={completedLessonIds}
            content={courseContent}
          />
        </main>
        <Footer />
        <SocialProofToast isFree={mappedCourse.price === 0} isEnrolled={isEnrolled} />
      </div>
    )
  }

  // ── Try LearnDash (premium) course ───────────────────────────────────────
  // Start wpUserId + isAdmin DB lookup in parallel with the LearnDash course fetch

  let ldCourse = null
  try { ldCourse = await getLDCourseBySlug(slug) } catch {}
  if (!ldCourse) notFound()

  let steps: Awaited<ReturnType<typeof getLDCourseSteps>>
  let lessons: Awaited<ReturnType<typeof getLDLessonsForCourse>>
  let durationMap: Map<number, number>
  let quizzes: Awaited<ReturnType<typeof getLDQuizzesFromSteps>>

  try {
    ;[steps, lessons] = await Promise.all([
      getLDCourseSteps(ldCourse.id),
      getLDLessonsForCourse(ldCourse.id),
    ])
    ;[durationMap, quizzes] = await Promise.all([
      getVimeoDurationsForLessons(lessons),
      getLDQuizzesFromSteps(steps),
    ])
  } catch {
    // WordPress temporarily unreachable — show course shell with no content
    steps = { h: {}, t: { "sfwd-lessons": [], "sfwd-topic": [], "sfwd-quiz": [] }, l: [], sections: [] }
    lessons = []
    durationMap = new Map()
    quizzes = []
  }

  const priceInfo = COURSE_PRICES[ldCourse.id] || COURSE_PRICES[ldCourse.slug]

  // Priority: WP embedded → WP media API → config thumbnailUrl
  const embeddedThumb = ldCourse._embedded?.["wp:featuredmedia"]?.[0]?.source_url
  let thumbnailUrl: string | undefined = embeddedThumb
  if (!embeddedThumb && ldCourse.featured_media > 0) {
    const mediaMap = await getLDMediaUrls([ldCourse.featured_media])
    thumbnailUrl = mediaMap.get(ldCourse.featured_media)
  }
  if (!thumbnailUrl && priceInfo?.thumbnailUrl) {
    thumbnailUrl = priceInfo.thumbnailUrl
  }

  const mappedCourse = mapLDCourse(ldCourse, thumbnailUrl) as Course
  if (priceInfo) {
    mappedCourse.price = priceInfo.price
    mappedCourse.original_price = priceInfo.originalPrice ?? null
    mappedCourse.brochure_url = priceInfo.brochureUrl ?? null
  }
  // DB price overrides static config (admin panel wins)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const _db = dbContent as any
  if (_db?.price != null) mappedCourse.price = _db.price
  if (_db?.originalPrice != null) mappedCourse.original_price = _db.originalPrice
  mappedCourse.total_lessons = lessons.length
  mappedCourse.wp_id = ldCourse.id

  // Fetch topics only for free learning pathways (price === 0)
  const isFreeLD = mappedCourse.price === 0
  const topics = isFreeLD ? await getLDTopicsForCourse(ldCourse.id) : []

  const mappedSections: Section[] = buildLDSections(String(ldCourse.id), steps, lessons, durationMap, topics)

  let isEnrolled = false
  let completedLessonIds: string[] = []

  if (user) {
    const [localEnrollment, progressRows] = await Promise.all([
      prisma.ldEnrollment.findUnique({
        where: { userId_wpCourseId: { userId: user.id, wpCourseId: ldCourse.id } },
      }).catch(() => null),
      prisma.lessonProgress.findMany({
        where: { userId: user.id, completed: true },
        select: { lessonId: true },
      }),
    ])
    isEnrolled = !!user.isAdmin || !!localEnrollment
    completedLessonIds = progressRows.map((p) => p.lessonId)
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar user={user ? { email: user.email, name: user.name || undefined } : null} />
      <main className="flex-1">
        <CourseDetailClient
          course={mappedCourse}
          sections={mappedSections}
          quizzes={quizzes.map((q) => ({ id: q.id, title: decodeHtml(q.title.rendered) }))}
          isEnrolled={isEnrolled}
          isLoggedIn={!!user}
          completedLessonIds={completedLessonIds}
          content={courseContent}
        />
      </main>
      <Footer />
      <SocialProofToast isFree={false} isEnrolled={isEnrolled} />
    </div>
  )
}
