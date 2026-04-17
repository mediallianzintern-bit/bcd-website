import { getCurrentUser } from "@/lib/auth"
import { Navbar } from "@/components/navbar"
import { HeroSection } from "@/components/hero-section"
import { FeaturedCoursesCarousel } from "@/components/featured-courses-carousel"
import { Footer } from "@/components/footer"
import { Testimonials } from "@/components/testimonials"
import { StatsCounter } from "@/components/stats-counter"
import { CorporateLogos } from "@/components/corporate-logos"
import { FeaturesSection } from "@/components/features-section"
import { AboutFounder } from "@/components/about-founder"
import { CTASection } from "@/components/cta-section"
import { getLDCourses, getLDLessonCounts, getLDAllUserEnrolledCourses, getLDMediaUrls, mapLDCourse, type LDCourse } from "@/lib/learndash"
import { COURSE_PRICES } from "@/lib/course-prices"
import { prisma } from "@/lib/prisma"
import type { Course } from "@/lib/types"

export default async function HomePage() {
  const user = await getCurrentUser()

  // Fetch DB overrides from admin panel
  let dbPriceOverrides: Array<{ slug: string; price: number | null; originalPrice: number | null; thumbnailUrl: string | null }> = []
  try {
    dbPriceOverrides = await prisma.courseContent.findMany({
      select: { slug: true, price: true, originalPrice: true, thumbnailUrl: true },
    })
  } catch {
    // DB unreachable — skip overrides
  }
  const dbPriceMap = new Map(dbPriceOverrides.map((r) => [r.slug, r]))

  // Fetch LearnDash premium courses only
  let mappedCourses: Course[] = []
  let enrolledCourseIds: string[] = []

  try {
    const [ldCourses, allLessons] = await Promise.all([
      getLDCourses(),
      getLDLessonCounts().catch(() => [] as Array<{ id: number; course: number }>),
    ])
    const published = ldCourses.filter((c: LDCourse) => c.status === "publish")

    const lessonCountByCourse = new Map<number, number>()
    for (const l of allLessons) {
      lessonCountByCourse.set(l.course, (lessonCountByCourse.get(l.course) ?? 0) + 1)
    }

    // Fetch missing thumbnails via media API
    const missingMediaIds = published
      .filter((c: LDCourse) => c.featured_media > 0 && !c._embedded?.["wp:featuredmedia"]?.[0]?.source_url)
      .map((c: LDCourse) => c.featured_media)
    const mediaUrlMap = await getLDMediaUrls(missingMediaIds)

    mappedCourses = published
      .map((c: LDCourse) => {
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
        // DB override wins (admin panel changes)
        const dbPrice = dbPriceMap.get(c.slug)
        if (dbPrice?.price != null) mapped.price = dbPrice.price
        if (dbPrice?.originalPrice != null) mapped.original_price = dbPrice.originalPrice
        if (dbPrice?.thumbnailUrl) mapped.thumbnail_url = dbPrice.thumbnailUrl
        return mapped
      })
      // Only paid courses in Featured section
      .filter((c: Course) => c.price > 0)
  } catch {
    // WordPress unreachable — show empty state
  }

  // Admin has access to all courses; otherwise check WP enrollment
  if (user?.isAdmin) {
    enrolledCourseIds = mappedCourses.map((c) => c.id)
  } else if (user?.wpUserId) {
    try {
      const enrolled = await getLDAllUserEnrolledCourses(user.wpUserId)
      enrolledCourseIds = enrolled.map(String)
    } catch {
      // silent
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar user={user ? { email: user.email, name: user.name || undefined } : null} />
      <main className="flex-1">
        <HeroSection />

        <CorporateLogos />

        <section className="py-16 md:py-24 bg-secondary/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-balance">Featured Courses</h2>
              <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
                Explore our curated collection of courses designed to help you master
                the most in-demand digital skills.
              </p>
            </div>

            {mappedCourses.length > 0 ? (
              <FeaturedCoursesCarousel
                courses={mappedCourses}
                enrolledCourseIds={enrolledCourseIds}
                isLoggedIn={!!user}
              />
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No courses available yet. Check back soon!</p>
              </div>
            )}
          </div>
        </section>

        <FeaturesSection />

        <StatsCounter />

        <AboutFounder />

        <Testimonials />

        <CTASection />
      </main>
      <Footer />
    </div>
  )
}
