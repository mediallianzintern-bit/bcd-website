import type { Metadata } from "next"

export const metadata: Metadata = { title: "Admin — Basecamp Digital" }

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
