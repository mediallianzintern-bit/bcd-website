import { PrismaClient } from "@prisma/client"
import { createClient } from "@supabase/supabase-js"

const prisma = new PrismaClient()

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

async function main() {
  console.log("Fetching data from Supabase...")

  // 1. Fetch all courses
  const { data: courses, error: coursesErr } = await supabase
    .from("courses")
    .select("*")
    .order("created_at", { ascending: true })

  if (coursesErr) throw coursesErr
  console.log(`Found ${courses.length} courses`)

  for (const c of courses) {
    await prisma.course.upsert({
      where: { slug: c.slug },
      update: {
        title: c.title,
        description: c.description,
        shortDescription: c.short_description,
        thumbnailUrl: c.thumbnail_url,
        instructorName: c.instructor_name,
        instructorTitle: c.instructor_title,
        instructorAvatar: c.instructor_avatar,
        price: c.price || 0,
        originalPrice: c.original_price,
        isPublished: c.is_published,
        totalDurationMinutes: c.total_duration_minutes || 0,
        totalLessons: c.total_lessons || 0,
        brochureUrl: c.brochure_url,
      },
      create: {
        title: c.title,
        slug: c.slug,
        description: c.description,
        shortDescription: c.short_description,
        thumbnailUrl: c.thumbnail_url,
        instructorName: c.instructor_name,
        instructorTitle: c.instructor_title,
        instructorAvatar: c.instructor_avatar,
        price: c.price || 0,
        originalPrice: c.original_price,
        isPublished: c.is_published,
        totalDurationMinutes: c.total_duration_minutes || 0,
        totalLessons: c.total_lessons || 0,
        brochureUrl: c.brochure_url,
      },
    })
    console.log(`  ✓ Course: ${c.title}`)
  }

  // 2. Fetch all sections
  const { data: sections, error: sectionsErr } = await supabase
    .from("sections")
    .select("*")
    .order("order_index", { ascending: true })

  if (sectionsErr) throw sectionsErr
  console.log(`Found ${sections.length} sections`)

  // We need to map Supabase course IDs to Prisma course IDs
  const courseIdMap = new Map<string, string>()
  for (const c of courses) {
    const prismaC = await prisma.course.findUnique({ where: { slug: c.slug } })
    if (prismaC) courseIdMap.set(c.id, prismaC.id)
  }

  const sectionIdMap = new Map<string, string>()
  for (const s of sections) {
    const prismaCourseId = courseIdMap.get(s.course_id)
    if (!prismaCourseId) {
      console.log(`  ⚠ Skipping section "${s.title}" — course not found`)
      continue
    }
    const created = await prisma.section.create({
      data: {
        courseId: prismaCourseId,
        title: s.title,
        description: s.description,
        orderIndex: s.order_index ?? s.position ?? 0,
      },
    })
    sectionIdMap.set(s.id, created.id)
    console.log(`  ✓ Section: ${s.title}`)
  }

  // 3. Fetch all lessons
  const { data: lessons, error: lessonsErr } = await supabase
    .from("lessons")
    .select("*")
    .order("order_index", { ascending: true })

  if (lessonsErr) throw lessonsErr
  console.log(`Found ${lessons.length} lessons`)

  for (const l of lessons) {
    const prismaSectionId = sectionIdMap.get(l.section_id)
    if (!prismaSectionId) {
      console.log(`  ⚠ Skipping lesson "${l.title}" — section not found`)
      continue
    }
    await prisma.lesson.create({
      data: {
        sectionId: prismaSectionId,
        title: l.title,
        description: l.description,
        vimeoVideoId: l.vimeo_video_id,
        durationMinutes: l.duration_minutes || 0,
        orderIndex: l.order_index ?? l.position ?? 0,
        isPreview: l.is_preview ?? l.is_free ?? false,
      },
    })
    console.log(`  ✓ Lesson: ${l.title}`)
  }

  // 4. Fetch enrollments (if any exist)
  // Note: We can't migrate users from Supabase Auth (passwords are hashed with their system)
  // Users will need to re-register. But we log the count for reference.
  const { data: enrollments } = await supabase.from("enrollments").select("*")
  console.log(`\nFound ${enrollments?.length || 0} enrollments (users will need to re-register)`)

  const { data: profiles } = await supabase.from("profiles").select("*")
  console.log(`Found ${profiles?.length || 0} user profiles in Supabase`)

  console.log("\n✅ Migration from Supabase → MySQL complete!")
  console.log("Note: Users cannot be migrated (Supabase Auth passwords). They will need to sign up again.")
}

main()
  .catch((e) => {
    console.error("Migration failed:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
