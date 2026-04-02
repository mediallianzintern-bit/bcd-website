"use client"

import { useState } from "react"
import Image from "next/image"
import { Mail } from "lucide-react"

/* ─── WorldMap ────────────────────────────────────────────────────────────── */

interface WorldMapProps {
  className?: string
}

export function WorldMap({ className }: WorldMapProps) {
  return (
    <Image
      src="/world.svg"
      alt="World Map"
      aria-hidden="true"
      fill
      priority
      className={className}
    />
  )
}

/* ─── LocationIndicator ───────────────────────────────────────────────────── */

interface LocationIndicatorProps {
  label: string
}

export function LocationIndicator({ label }: LocationIndicatorProps) {
  return (
    <div className="flex flex-col items-center">
      {/* Badge */}
      <div className="whitespace-nowrap rounded-full border border-border bg-background/90 px-3 py-1.5 text-xs text-foreground backdrop-blur-sm dark:border-neutral-700 dark:bg-neutral-900/90 dark:text-neutral-200">
        {label}
      </div>

      {/* Vertical beam */}
      <div className="h-14 w-px bg-gradient-to-b from-green-400/0 via-green-400 to-green-400" />

      {/* Glowing dot */}
      <div className="relative flex items-center justify-center">
        <span className="absolute h-5 w-5 animate-ping rounded-full bg-green-500/40" />
        <span
          className="relative h-2 w-2 rounded-full bg-green-400"
          style={{ boxShadow: "0 0 14px 5px rgba(74,222,128,0.9)" }}
        />
      </div>
    </div>
  )
}

/* ─── ContactSection ──────────────────────────────────────────────────────── */

interface FormState {
  name: string
  email: string
  company: string
  message: string
}

export default function ContactSection() {
  const [form, setForm] = useState<FormState>({
    name: "",
    email: "",
    company: "",
    message: "",
  })
  const [submitted, setSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const submitForm = async () => {
    setIsSubmitting(true)
    // TODO: replace with real API call
    // await fetch('/api/contact', { method: 'POST', body: JSON.stringify(form) })
    setTimeout(() => {
      setIsSubmitting(false)
      setSubmitted(true)
    }, 1000)
  }

  const inputClass =
    "w-full rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-ring transition-colors dark:border-neutral-800 dark:bg-neutral-950/50"

  return (
    <section className="bg-background px-4 py-20 text-foreground">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-20">

          {/* ── Left column ──────────────────────────────────────────────── */}
          <div>
            {/* Mail icon box */}
            <div className="mb-6 inline-flex flex-col items-center gap-1">
              <div className="flex h-10 w-10 items-center justify-center rounded-md border border-border bg-muted dark:border-neutral-800 dark:bg-neutral-900">
                <Mail className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="h-px w-8" style={{ background: "linear-gradient(to right, transparent, oklch(0.55 0.2 145), transparent)" }} />
            </div>

            <h2 className="text-4xl font-bold tracking-tight text-foreground">
              Contact Basecamp Digital
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
              Have questions about our courses ? Reach out
              and our team will get back to you shortly.
            </p>

            {/* Contact details */}
            
            <p className="mt-4 text-sm text-muted-foreground">
              contact@basecampdigital.co&nbsp;&bull;&nbsp;Mumbai, India
            </p>

            {/* Map container — no overflow-hidden so Canada badge can bleed above */}
            <div
              className="relative mt-16 w-full"
              style={{ aspectRatio: "2000 / 857" }}
            >
              {/* Inner clip — keeps map + overlays inside rounded border */}
              <div className="absolute inset-0 overflow-hidden rounded-xl border border-border bg-white dark:border-neutral-800 dark:bg-neutral-950">
                <WorldMap className="pointer-events-none object-cover opacity-60 invert dark:invert-0" />

                {/* Edge vignette — adapts to light/dark */}
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_50%,rgba(255,255,255,0.75)_100%)] dark:bg-[radial-gradient(ellipse_at_center,transparent_50%,rgba(10,10,10,0.85)_100%)]" />
              </div>

              {/* Canada — dot lands at ~24.5% left, ~20.4% top */}
              <div
                className="absolute z-10"
                style={{ left: "24.5%", top: "20.4%", transform: "translate(-50%, -100%)" }}
              >
                <LocationIndicator label="Toronto, Canada" />
              </div>

              {/* India — dot lands at ~72.3% left, ~44.3% top */}
              <div
                className="absolute z-10"
                style={{ left: "69.5%", top: "43.8%", transform: "translate(-50%, -100%)" }}
              >
                <LocationIndicator label="Mumbai, India" />
              </div>
            </div>
          </div>

          {/* ── Right column: Form ───────────────────────────────────────── */}
          <div>
            <div className="rounded-2xl border border-border bg-muted/40 p-8 dark:border-neutral-800 dark:bg-neutral-900">
              {submitted ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="mb-4 text-4xl text-green-500">✓</div>
                  <h3 className="text-xl font-semibold text-foreground">Message sent!</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    We&apos;ll get back to you as soon as possible.
                  </p>
                </div>
              ) : (
                <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); submitForm() }}>
                  <div>
                    <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-foreground">
                      Full name
                    </label>
                    <input
                      id="name" name="name" type="text" required
                      placeholder="Jane Doe"
                      value={form.name} onChange={handleChange}
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-foreground">
                      Email Address
                    </label>
                    <input
                      id="email" name="email" type="email" required
                      placeholder="jane@example.com"
                      value={form.email} onChange={handleChange}
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label htmlFor="message" className="mb-1.5 block text-sm font-medium text-foreground">
                      Message
                    </label>
                    <textarea
                      id="message" name="message" rows={5} required
                      placeholder="How can we help you?"
                      value={form.message} onChange={handleChange}
                      className={`${inputClass} resize-none`}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full rounded-md bg-green-600 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-green-700 disabled:opacity-50"
                  >
                    {isSubmitting ? "Sending..." : "Send Message"}
                  </button>
                </form>
              )}
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
