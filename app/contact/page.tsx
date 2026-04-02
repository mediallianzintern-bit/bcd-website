import type { Metadata } from "next"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { getCurrentUser } from "@/lib/auth"
import ContactSection from "@/components/contact-section"

export const metadata: Metadata = {
  title: "Contact Us - Basecamp Digital",
  description: "Get in touch with Basecamp Digital. We're here to help with any questions about our courses.",
}

export default async function ContactPage() {
  const user = await getCurrentUser()

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar user={user ? { email: user.email, name: user.name || undefined } : null} />
      <main className="flex-1">
        <ContactSection />
      </main>
      <Footer />
    </div>
  )
}
