"use client"

import Link from "next/link"
import Image from "next/image"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ArrowRight, Play, CheckCircle } from "lucide-react"

const highlights = [
  "Industry Expert Instructors",
  "Hands-on Projects",
  "Lifetime Access",
]

const PHOTOS = [
  "/Copy of Copy of DSC00261.JPG",
  "/Copy of DSC00247.JPG",
  "/Copy of DSC00250.JPG",
  "/Copy of DSC00279.JPG",
  "/Copy of IMG_20180413_120516_HDR.jpg",
  "/Copy of IMG_20180421_100015_HDR.jpg",
]

function PhotoCarousel() {
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    const id = setInterval(() => {
      setCurrent((prev) => (prev + 1) % PHOTOS.length)
    }, 3500)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="relative rounded-3xl shadow-2xl overflow-hidden">
      {PHOTOS.map((src, i) => (
        <div
          key={i}
          className="transition-opacity duration-1000"
          style={{
            opacity: i === current ? 1 : 0,
            // Photo 0 stays in flow and sets container height; others overlay it
            position: i === 0 ? "relative" : "absolute",
            top: 0, left: 0, right: 0, bottom: 0,
          }}
        >
          <Image
            src={src}
            alt="Basecamp Digital training session"
            width={1200}
            height={900}
            className="w-full h-auto block"
            sizes="(max-width: 1024px) 384px, 512px"
            priority={i === 0}
          />
        </div>
      ))}
    </div>
  )
}

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-linear-to-b from-secondary/50 to-background">
      {/* Background glows */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 size-96 bg-primary/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 size-96 bg-primary/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>
      <div className="absolute inset-0 bg-radial-[ellipse_at_top] from-primary/10 via-transparent to-transparent pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10 py-16 md:py-24 lg:py-28">

        {/* ── Top: text left + photo stack right ─────────────────────── */}
        <div className="flex flex-col-reverse items-center gap-12 lg:flex-row lg:items-center lg:gap-16">

          {/* Left: text */}
          <div className="flex-1 text-center lg:text-left">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-balance animate-fade-in-up">
              Master the Skills of Tomorrow with{" "}
              <span className="text-primary relative inline-block">
                Basecamp Digital
                <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 300 12" fill="none">
                  <path
                    d="M2 10C50 4 100 2 150 6C200 10 250 4 298 8"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    className="animate-draw"
                  />
                </svg>
              </span>
            </h1>

            <p className="mt-6 text-lg md:text-xl text-muted-foreground text-pretty max-w-xl animate-fade-in-up delay-200">
              Learn from practitioners, not just trainers. Trusted by industry leaders like
              Times of India, Marico, OLX, Network18, Conde Nast, and more.
            </p>

            <div className="mt-6 flex flex-wrap justify-center gap-4 lg:justify-start animate-fade-in-up delay-300">
              {highlights.map((h) => (
                <div key={h} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle className="size-4 text-primary shrink-0" />
                  <span>{h}</span>
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start animate-fade-in-up delay-400">
              <Link href="/courses">
                <Button size="lg" className="gap-2 w-full sm:w-auto group">
                  Explore Courses
                  <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/auth/sign-up">
                <Button size="lg" variant="outline" className="w-full sm:w-auto gap-2 group">
                  <Play className="size-4 group-hover:scale-110 transition-transform" />
                  Get Started Free
                </Button>
              </Link>
            </div>
          </div>

          {/* Right: stacked photo cards */}
          <div className="w-full max-w-sm lg:max-w-md xl:max-w-lg shrink-0 animate-fade-in-up delay-300">
            <PhotoCarousel />
          </div>

        </div>

        {/* ── Bottom: stats centered ──────────────────────────────────── */}
        <div className="mt-16 flex flex-col sm:flex-row items-center justify-center gap-8 sm:gap-14 animate-fade-in-up delay-500">
          <div className="text-center">
            <div className="text-4xl md:text-5xl font-extrabold text-primary">8000+</div>
            <div className="mt-1 text-base md:text-lg font-semibold text-foreground">Students</div>
          </div>
          <div className="hidden sm:block w-px h-12 bg-border" />
          <div className="text-center">
            <div className="text-4xl md:text-5xl font-extrabold text-primary">4000+</div>
            <div className="mt-1 text-base md:text-lg font-semibold text-foreground">Professionals</div>
          </div>
          <div className="hidden sm:block w-px h-12 bg-border" />
          <div className="text-center">
            <div className="text-4xl md:text-5xl font-extrabold text-primary">25+</div>
            <div className="mt-1 text-base md:text-lg font-semibold text-foreground">CXOs Trained</div>
          </div>
        </div>

      </div>
    </section>
  )
}
