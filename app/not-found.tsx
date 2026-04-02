import { Suspense } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col">
      <Suspense>
        <Navbar user={null} />
      </Suspense>
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
          <h2 className="text-2xl font-semibold mb-2">Page Not Found</h2>
          <p className="text-muted-foreground mb-8 max-w-md">
            The page you are looking for does not exist or has been moved.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/">
              <Button>Go Home</Button>
            </Link>
            <Link href="/courses">
              <Button variant="outline">Browse Courses</Button>
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
