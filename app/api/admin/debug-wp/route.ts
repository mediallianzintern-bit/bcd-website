import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { getCurrentUser } from "@/lib/auth"

export async function GET() {
  const cookieStore = await cookies()
  const accessToken = cookieStore.get("access_token")?.value
  const refreshToken = cookieStore.get("refresh_token")?.value
  const currentUser = await getCurrentUser()

  return NextResponse.json({
    hasAccessToken: !!accessToken,
    accessTokenLength: accessToken?.length ?? 0,
    hasRefreshToken: !!refreshToken,
    currentUser,
    allCookies: cookieStore.getAll().map(c => c.name),
  })
}
