import Link from "next/link"
import Image from "next/image"
import { AlertCircle } from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface ErrorPageProps {
  searchParams: Promise<{ error?: string }>
}

export default async function AuthErrorPage({ searchParams }: ErrorPageProps) {
  const params = await searchParams

  return (
    <div className="min-h-screen flex flex-col">
      <header className="flex items-center justify-between p-4">
        <Link href="/">
          <Image
            src="/images/basecamp-logo.png"
            alt="Basecamp Digital"
            width={150}
            height={38}
            className="h-9 w-auto"
          />
        </Link>
      </header>
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <Card className="text-center">
            <CardHeader>
              <div className="mx-auto w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
                <AlertCircle className="h-6 w-6 text-destructive" />
              </div>
              <CardTitle className="text-2xl">Something went wrong</CardTitle>
              <CardDescription>
                We encountered an error during authentication
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {params?.error && (
                <p className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
                  Error: {params.error}
                </p>
              )}
              <div className="flex flex-col gap-2">
                <Link href="/auth/login">
                  <Button className="w-full">Try Again</Button>
                </Link>
                <Link href="/">
                  <Button variant="outline" className="w-full">
                    Go Home
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
