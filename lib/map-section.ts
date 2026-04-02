import type { Section, Lesson } from "@/lib/types"
import type {
  Section as PrismaSection,
  Lesson as PrismaLesson,
} from "@prisma/client"

export function mapLesson(l: PrismaLesson): Lesson {
  return {
    id: l.id,
    section_id: l.sectionId,
    title: l.title,
    description: l.description,
    vimeo_video_id: l.vimeoVideoId,
    youtube_video_id: null,
    duration_minutes: l.durationMinutes,
    order_index: l.orderIndex,
    is_preview: l.isPreview,
    created_at: l.createdAt.toISOString(),
  }
}

export function mapSection(
  s: PrismaSection & { lessons?: PrismaLesson[] }
): Section {
  return {
    id: s.id,
    course_id: s.courseId,
    title: s.title,
    description: s.description,
    order_index: s.orderIndex,
    created_at: s.createdAt.toISOString(),
    lessons: s.lessons?.map(mapLesson),
  }
}
