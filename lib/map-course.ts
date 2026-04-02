import type { Course } from "@/lib/types"
import type { Course as PrismaCourse } from "@prisma/client"

export function mapCourse(c: PrismaCourse): Course {
  return {
    id: c.id,
    title: c.title,
    slug: c.slug,
    description: c.description,
    short_description: c.shortDescription,
    thumbnail_url: c.thumbnailUrl,
    instructor_name: c.instructorName,
    instructor_title: c.instructorTitle,
    instructor_avatar: c.instructorAvatar,
    price: c.price,
    original_price: c.originalPrice,
    is_published: c.isPublished,
    total_duration_minutes: c.totalDurationMinutes,
    total_lessons: c.totalLessons,
    brochure_url: c.brochureUrl,
    created_at: c.createdAt.toISOString(),
    updated_at: c.updatedAt.toISOString(),
  }
}
