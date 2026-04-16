import type { Metadata } from "next"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import type { Course } from "@/lib/types"
import { mapCourse } from "@/lib/map-course"
import { getLDCourses, getLDLessonCounts, getLDAllUserEnrolledCourses, getLDMediaUrls, mapLDCourse, type LDCourse } from "@/lib/learndash"
import { COURSE_PRICES } from "@/lib/course-prices"
import { CourseListClient } from "@/components/course-list-client"
import { CoursesFaq } from "@/components/courses-faq"

interface CoursesPageProps {
  searchParams: Promise<{ type?: string }>
}

export async function generateMetadata({ searchParams }: CoursesPageProps): Promise<Metadata> {
  const { type } = await searchParams
  const isCrash = type === "crash"
  return {
    title: isCrash ? "Crash Courses - Basecamp Digital" : "Courses - Basecamp Digital",
    description: isCrash
      ? "Free crash courses to quickly master in-demand skills"
      : "Browse all paid courses available on Basecamp Digital",
  }
}

export default async function CoursesPage({ searchParams }: CoursesPageProps) {
  const { type } = await searchParams
  const isCrash = type === "crash"

  const user = await getCurrentUser()

  let allCourses: Course[] = []
  let enrolledCourseIds: string[] = []

  // Fetch all DB overrides upfront (price + thumbnail, keyed by slug)
  const dbPriceOverrides = await prisma.courseContent?.findMany({
    select: { slug: true, price: true, originalPrice: true, thumbnailUrl: true },
  }) ?? []
  const dbPriceMap = new Map(dbPriceOverrides.map((r) => [r.slug, r]))

  if (isCrash) {
    // Crash courses: only from MySQL
    const localCourses = await prisma.course.findMany({
      where: { isPublished: true, price: 0 },
      include: {
        sections: { include: { lessons: { select: { id: true } } } },
      },
      orderBy: { createdAt: "desc" },
    })
    allCourses = localCourses.map((c) => {
      const mapped = mapCourse(c)
      // Count only actual lessons from sections — excludes any test/quiz items
      mapped.total_lessons = c.sections.reduce((sum, s) => sum + s.lessons.length, 0)
      const dbPrice = dbPriceMap.get(c.slug)
      if (dbPrice?.price != null) mapped.price = dbPrice.price
      if (dbPrice?.originalPrice != null) mapped.original_price = dbPrice.originalPrice
      return mapped
    })

    if (user) {
      if (user.isAdmin) {
        enrolledCourseIds = allCourses.map((c) => c.id)
      } else {
        const enrollments = await prisma.enrollment.findMany({
          where: { userId: user.id },
          select: { courseId: true },
        })
        enrolledCourseIds = enrollments.map((e) => e.courseId)
      }
    }
  } else {
    // Premium courses: from LearnDash
    let ldCourses: LDCourse[] = []

    const enrolledCoursesPromise = user?.wpUserId
      ? getLDAllUserEnrolledCourses(user.wpUserId).catch(() => [] as number[])
      : Promise.resolve([] as number[])

    try {
      ldCourses = await getLDCourses()
    } catch {
      // WordPress temporarily unreachable — show empty state rather than crash
    }

    // Fetch featured image URLs for courses that have one but _embed didn't return it
    const published = ldCourses.filter((c: LDCourse) => c.status === "publish")
    const missingThumbnailIds = published
      .filter((c: LDCourse) => c.featured_media > 0 && !c._embedded?.["wp:featuredmedia"]?.[0]?.source_url)
      .map((c: LDCourse) => c.featured_media)

    // Fetch lesson counts via single bulk call (avoids N parallel requests timing out)
    const allLessons = await getLDLessonCounts().catch(() => [] as Array<{ id: number; course: number }>)
    const lessonCountByCourse = new Map<number, number>()
    for (const l of allLessons) {
      lessonCountByCourse.set(l.course, (lessonCountByCourse.get(l.course) ?? 0) + 1)
    }

    const mediaUrlMap = await getLDMediaUrls(missingThumbnailIds)

    allCourses = published.map((c: LDCourse) => {
      const priceInfo = COURSE_PRICES[c.id] || COURSE_PRICES[c.slug]
      const thumbnailUrl =
        c._embedded?.["wp:featuredmedia"]?.[0]?.source_url ||
        mediaUrlMap.get(c.featured_media) ||
        priceInfo?.thumbnailUrl ||
        null
      const mapped = mapLDCourse(c, thumbnailUrl ?? undefined) as Course
      mapped.total_lessons = lessonCountByCourse.get(c.id) ?? 0
      if (priceInfo) {
        mapped.price = priceInfo.price
        mapped.original_price = priceInfo.originalPrice ?? null
        mapped.brochure_url = priceInfo.brochureUrl ?? null
      }
      // DB overrides static config (admin panel wins)
      const dbPrice = dbPriceMap.get(c.slug)
      if (dbPrice?.price != null) mapped.price = dbPrice.price
      if (dbPrice?.originalPrice != null) mapped.original_price = dbPrice.originalPrice
      if (dbPrice?.thumbnailUrl) mapped.thumbnail_url = dbPrice.thumbnailUrl
      return mapped
    })

    if (user?.isAdmin) {
      enrolledCourseIds = allCourses.map((c) => c.id)
    } else {
      const enrolled = await enrolledCoursesPromise
      enrolledCourseIds = enrolled.map(String)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar user={user ? { email: user.email, name: user.name || undefined } : null} />
      <main className="flex-1">
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4">
            <div className="mb-10">
              {isCrash ? (
                <>
                  <h1 className="text-3xl md:text-4xl font-bold">Crash Courses</h1>
                  <p className="mt-3 text-muted-foreground">
                    Short, focused, and completely free. Get up to speed fast with our crash courses.
                  </p>
                </>
              ) : (
                <>
                  <h1 className="text-3xl md:text-4xl font-bold">All Courses</h1>
                  <p className="mt-3 text-muted-foreground">
                    Explore our comprehensive collection of courses to boost your skills.
                  </p>
                </>
              )}
            </div>

            <CourseListClient
              courses={allCourses}
              enrolledCourseIds={enrolledCourseIds}
              isLoggedIn={!!user}
              searchOnly={isCrash}
            />
          </div>
        </section>
      </main>
      {!isCrash && <CoursesFaq />}
      <Footer />
    </div>
  )
}
