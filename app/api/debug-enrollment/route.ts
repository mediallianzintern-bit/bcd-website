import { NextResponse } from "next/server"
import { getLDCourseBySlug, getLDCourseSteps, getLDLessonsForCourse, getLDTopicsForCourse } from "@/lib/learndash"

export async function GET(request: Request) {
  const url = new URL(request.url)
  const slug = url.searchParams.get("slug") || "content-native-influencer-marketing-learning-pathway"

  let ldCourse = null
  try { ldCourse = await getLDCourseBySlug(slug) } catch (e) {
    return NextResponse.json({ error: String(e) })
  }
  if (!ldCourse) return NextResponse.json({ error: "course not found", slug })

  const [steps, lessons, topics] = await Promise.all([
    getLDCourseSteps(ldCourse.id).catch((e) => ({ error: String(e) })),
    getLDLessonsForCourse(ldCourse.id).catch(() => []),
    getLDTopicsForCourse(ldCourse.id).catch(() => []),
  ])

  return NextResponse.json({
    courseId: ldCourse.id,
    slug: ldCourse.slug,
    price: ldCourse.status,
    stepsRaw: steps,
    lessonsCount: Array.isArray(lessons) ? lessons.length : 0,
    lessonIds: Array.isArray(lessons) ? lessons.map((l) => l.id) : [],
    topicsCount: Array.isArray(topics) ? topics.length : 0,
    topicIds: Array.isArray(topics) ? topics.map((t) => ({ id: t.id, lesson: t.lesson })) : [],
  })
}
