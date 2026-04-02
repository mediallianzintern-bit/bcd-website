import { NextRequest, NextResponse } from "next/server"
import { generateCertificatePDF } from "@/lib/generate-certificate"

export async function POST(req: NextRequest) {
  const { name, courseTitle, completedAt } = await req.json()
  if (!name || !courseTitle) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 })
  }
  const pdfBuffer = await generateCertificatePDF(
    name,
    courseTitle,
    completedAt || new Date().toISOString()
  )
  const safeName = name.replace(/[^a-z0-9_\-]/gi, "_")
  return new NextResponse(pdfBuffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${safeName}-Certificate-Basecamp-Digital.pdf"`,
    },
  })
}
