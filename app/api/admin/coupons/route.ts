import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"

// In-memory coupon store (replace with DB table when ready)
// These match the VALID_COUPONS in course-detail-client.tsx
const COUPONS: Record<string, { discount: number; active: boolean }> = {
  "LEVELUP80": { discount: 80, active: true },
  "BASECAMP50": { discount: 50, active: true },
  "AI2024": { discount: 30, active: true },
  "LAUNCH20": { discount: 20, active: true },
}

export async function GET() {
  const user = await getCurrentUser()
  if (!user?.isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const coupons = Object.entries(COUPONS).map(([code, data]) => ({
    code,
    discount: data.discount,
    active: data.active,
  }))

  return NextResponse.json({ coupons })
}
