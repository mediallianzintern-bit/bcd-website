import { redirect } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { BookOpen, Clock, ArrowRight } from "lucide-react"
import {
  getLDAllUserEnrolledCourses,
  getLDCourseById,
  getLDLessonsForCourse,
  mapLDCourse,
} from "@/lib/learndash"

export const metadata = {
  title: "Dashboard - Basecamp Digital",
  description: "Your learning dashboard",
}

type DashboardCourse = {
  id: string
  title: string
  slug: string
  thumbnail_url: string | null
  total_duration_minutes: number
  totalLessons: number
  completedCount: number
  progressPercent: number
  enrolledAt: string
  source: "local" | "learndash"
}

export default async function DashboardPage() {
  const user = await getCurrentUser()
  if (!user) redirect("/auth/login")

  // ── Local (crash/free) enrollments ────────────────────────────────────────
  const localEnrollments = await prisma.enrollment.findMany({
    where: { userId: user.id },
    include: { course: true },
  })

  const localCourses: DashboardCourse[] = await Promise.all(
    localEnrollments.map(async (enrollment) => {
      const course = enrollment.course
      const lessons = await prisma.lesson.findMany({
        where: { section: { courseId: course.id } },
        select: { id: true },
      })
      const lessonIds = lessons.map((l) => l.id)
      const completedCount = await prisma.lessonProgress.count({
        where: {
          userId: user.id,
          completed: true,
          lessonId: { in: lessonIds.length > 0 ? lessonIds : ["none"] },
        },
      })
      const totalLessons = lessons.length
      return {
        id: course.id,
        title: course.title,
        slug: course.slug,
        thumbnail_url: course.thumbnailUrl,
        total_duration_minutes: course.totalDurationMinutes,
        totalLessons,
        completedCount,
        progressPercent: totalLessons > 0 ? (completedCount / totalLessons) * 100 : 0,
        enrolledAt: enrollment.enrolledAt.toISOString(),
        source: "local" as const,
      }
    })
  )

  // ── LearnDash (premium) enrollments ───────────────────────────────────────
  let ldCourses: DashboardCourse[] = []
  if (user.wpUserId) {
    const enrolledCourseIds = await getLDAllUserEnrolledCourses(user.wpUserId)
    const results = await Promise.all(
      enrolledCourseIds.map(async (courseId): Promise<DashboardCourse | null> => {
        const [ldCourse, lessons] = await Promise.all([
          getLDCourseById(courseId),
          getLDLessonsForCourse(courseId),
        ])
        if (!ldCourse) return null

        const mapped = mapLDCourse(ldCourse)
        const ldLessonIds = lessons.map((l) => String(l.id))
        const completedCount =
          ldLessonIds.length > 0
            ? await prisma.lessonProgress.count({
                where: {
                  userId: user.id,
                  completed: true,
                  lessonId: { in: ldLessonIds },
                },
              })
            : 0

        return {
          id: String(ldCourse.id),
          title: mapped.title,
          slug: ldCourse.slug,
          thumbnail_url: mapped.thumbnail_url,
          total_duration_minutes: 0,
          totalLessons: ldLessonIds.length,
          completedCount,
          progressPercent: ldLessonIds.length > 0 ? (completedCount / ldLessonIds.length) * 100 : 0,
          enrolledAt: new Date().toISOString(),
          source: "learndash",
        }
      })
    )
    ldCourses = results.filter((c): c is DashboardCourse => c !== null)
  }

  const allCourses: DashboardCourse[] = [...localCourses, ...ldCourses]

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar user={{ email: user.email }} />
      <main className="flex-1 py-8 md:py-12">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">My Learning</h1>
            <p className="mt-2 text-muted-foreground">
              Track your progress and continue learning
            </p>
          </div>

          {allCourses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {allCourses.map((course) => {
                const hours = Math.floor(course.total_duration_minutes / 60)
                const minutes = course.total_duration_minutes % 60
                const durationText = hours > 0 ? `${hours}h ${minutes}m` : minutes > 0 ? `${minutes}m` : null

                return (
                  <Card key={`${course.source}-${course.id}`} className="overflow-hidden">
                    {course.thumbnail_url && (
                      <div className="relative aspect-video">
                        <Image
                          src={course.thumbnail_url}
                          alt={course.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg line-clamp-2">{course.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-muted-foreground">Progress</span>
                          <span className="font-medium">
                            {course.completedCount}/{course.totalLessons} lessons
                          </span>
                        </div>
                        <Progress value={course.progressPercent} className="h-2" />
                      </div>
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        {durationText && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>{durationText}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <BookOpen className="h-4 w-4" />
                          <span>{course.totalLessons} lessons</span>
                        </div>
                      </div>
                      <Link href={`/learn/${course.slug}`}>
                        <Button className="w-full gap-2 bg-primary hover:bg-primary/90 text-white">
                          {course.completedCount > 0 ? "Continue" : "Start"} Learning
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          ) : (
            <Card className="text-center py-12">
              <CardContent>
                <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No courses yet</h3>
                <p className="text-muted-foreground mb-6">
                  You haven&apos;t enrolled in any courses yet. Browse our catalog to get started.
                </p>
                <Link href="/courses">
                  <Button>Browse Courses</Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
