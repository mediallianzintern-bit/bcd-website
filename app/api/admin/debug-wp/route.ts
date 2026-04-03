import { NextResponse } from "next/server"

export async function GET() {
  const user = process.env.WP_APP_USER || "Administrator"
  const pass = process.env.WP_APP_PASSWORD || ""
  const auth = "Basic " + Buffer.from(`${user}:${pass}`).toString("base64")
  const url = `${process.env.NEXT_PUBLIC_WP_BASE_URL || "https://basecampdigital.co"}/wp-json/ldlms/v2/sfwd-courses?per_page=1`

  try {
    const res = await fetch(url, {
      headers: { Authorization: auth, "Content-Type": "application/json" },
      cache: "no-store",
      signal: AbortSignal.timeout(15000),
    })
    const text = await res.text()
    return NextResponse.json({ status: res.status, user, passLength: pass.length, body: text.slice(0, 500) })
  } catch (err: unknown) {
    return NextResponse.json({ error: String(err), user, passLength: pass.length })
  }
}
