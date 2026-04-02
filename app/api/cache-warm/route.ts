import { NextResponse } from "next/server"
import {
  getLDCourses,
  getLDLessonCounts,
  getLDCourseSteps,
  getLDLessonsForCourse,
  getLDQuizzesForCourse,
} from "@/lib/learndash"

/**
 * GET /api/cache-warm
 *
 * Pre-populates the in-memory LearnDash cache so the first real user
 * gets a fast experience instead of waiting for WordPress.
 *
 * Protected by CACHE_WARM_SECRET env var. Call this once after the
 * server starts:
 *   curl http://localhost:3000/api/cache-warm?secret=YOUR_SECRET
 *
 * In production you can add this to your deployment script or a cron job.
 */
export async function GET(request: Request) {
  const secret = process.env.CACHE_WARM_SECRET
  const { searchParams } = new URL(request.url)

  if (secret && searchParams.get("secret") !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const start = Date.now()
  const results: Record<string, unknown> = {}

  try {
    // 1. Fetch courses list + lesson counts (the two heaviest calls on /courses)
    const [courses, lessonCounts] = await Promise.all([
      getLDCourses(),
      getLDLessonCounts(),
    ])
    results.courses = courses.length
    results.lessonCounts = lessonCounts.length

    // 2. For each published course, warm its steps + lessons + quizzes in parallel
    //    (these power /courses/[slug] and /learn/[slug] pages)
    const published = courses.filter((c) => c.status === "publish")
    const courseDetails = await Promise.allSettled(
      published.map((c) =>
        Promise.all([
          getLDCourseSteps(c.id),
          getLDLessonsForCourse(c.id),
          getLDQuizzesForCourse(c.id),
        ])
      )
    )

    const succeeded = courseDetails.filter((r) => r.status === "fulfilled").length
    const failed = courseDetails.filter((r) => r.status === "rejected").length
    results.courseDetails = { succeeded, failed }
  } catch (err) {
    return NextResponse.json(
      { error: "Cache warm failed", detail: String(err) },
      { status: 500 }
    )
  }

  const elapsed = ((Date.now() - start) / 1000).toFixed(1)
  return NextResponse.json({ ok: true, elapsed: `${elapsed}s`, ...results })
}
