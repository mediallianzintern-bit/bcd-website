import { NextResponse, NextRequest } from "next/server"
import { clearAuthCookies } from "@/lib/auth"

export async function POST(request: NextRequest) {
  await clearAuthCookies()
  const origin = request.nextUrl.origin
  return NextResponse.redirect(new URL("/", origin))
}
