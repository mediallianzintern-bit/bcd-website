import { NextResponse, type NextRequest } from "next/server"
import { writeFile } from "fs/promises"
import { join } from "path"
import { getCurrentUser } from "@/lib/auth"

export const config = {
  api: { bodyParser: { sizeLimit: "7mb" } },
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser()
  if (!user?.isAdmin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const formData = await req.formData()
  const file = formData.get("file") as File | null

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 })
  }

  // Validate file type
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"]
  if (!allowedTypes.includes(file.type)) {
    return NextResponse.json({ error: "Only JPEG, PNG, WebP, and GIF images are allowed" }, { status: 400 })
  }

  // Max 7MB
  if (file.size > 7 * 1024 * 1024) {
    return NextResponse.json({ error: "File too large (max 7MB)" }, { status: 400 })
  }

  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)

  // Generate unique filename: timestamp + original name (sanitized)
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg"
  const safeName = file.name
    .replace(/\.[^.]+$/, "")
    .replace(/[^a-z0-9]/gi, "-")
    .toLowerCase()
    .slice(0, 40)
  const filename = `${Date.now()}-${safeName}.${ext}`

  const uploadDir = join(process.cwd(), "public", "uploads")
  await writeFile(join(uploadDir, filename), buffer)

  return NextResponse.json({ url: `/uploads/${filename}` })
}
