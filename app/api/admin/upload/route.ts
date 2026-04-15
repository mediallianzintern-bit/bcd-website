import { NextResponse, type NextRequest } from "next/server"
import { put } from "@vercel/blob"
import { getCurrentUser } from "@/lib/auth"

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

  // Generate unique filename
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg"
  const safeName = file.name
    .replace(/\.[^.]+$/, "")
    .replace(/[^a-z0-9]/gi, "-")
    .toLowerCase()
    .slice(0, 40)
  const filename = `uploads/${Date.now()}-${safeName}.${ext}`

  // Upload to Vercel Blob (persists across deployments)
  const blob = await put(filename, file, { access: "public" })

  return NextResponse.json({ url: blob.url })
}
