import { NextResponse, type NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"

async function requireAdmin() {
  const user = await getCurrentUser()
  if (!user?.isAdmin) return null
  return user
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const content = (await prisma.courseContent?.findUnique({ where: { slug } })) ?? null
  return NextResponse.json(content ?? null)
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const admin = await requireAdmin()
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const { slug } = await params
  const body = await req.json()

  const model = prisma.courseContent
  if (!model) {
    return NextResponse.json(
      { error: "Course content model unavailable. Run prisma generate." },
      { status: 503 }
    )
  }

  const data = {
    slug,
    whatYouWillLearn: body.whatYouWillLearn ?? [],
    courseIncludes: body.courseIncludes ?? [],
    whoThisCourseIsFor: body.whoThisCourseIsFor ?? [],
    requirements: body.requirements ?? [],
    descriptionExtra: body.descriptionExtra ?? null,
    breadcrumbItems: body.breadcrumbItems ?? [],
    breadcrumbHighlight: body.breadcrumbHighlight ?? null,
    thumbnailUrl: body.thumbnailUrl ?? null,
    rating: body.rating ?? null,
    reviewsCount: body.reviewsCount ?? null,
    studentsCount: body.studentsCount ?? null,
    lastUpdated: body.lastUpdated ?? null,
    language: body.language ?? null,
    subtitleLanguages: body.subtitleLanguages ?? null,
    price: (() => { const n = Number(String(body.price ?? "").replace(/[^0-9.]/g, "")); return isNaN(n) || n === 0 ? null : n })(),
    originalPrice: (() => { const n = Number(String(body.originalPrice ?? "").replace(/[^0-9.]/g, "")); return isNaN(n) || n === 0 ? null : n })(),
    instructorName: body.instructorName ?? null,
    instructorTitle: body.instructorTitle ?? null,
    instructorRating: body.instructorRating ?? null,
    instructorStudents: body.instructorStudents ?? null,
    instructorBio: body.instructorBio ?? null,
    instructorAvatar: body.instructorAvatar ?? null,
  }

  const content = await model.upsert({
    where: { slug },
    create: data,
    update: data,
  })

  return NextResponse.json(content)
}
