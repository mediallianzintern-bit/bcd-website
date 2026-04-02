"use client"

import { useState, useEffect, useRef } from "react"
import {
  BrainCircuit,
  Search,
  Share2,
  FileText,
  BarChart3,
  Smartphone,
  LineChart,
  Zap,
} from "lucide-react"

/* ─── Course data ─────────────────────────────────────────────────────────── */

const courses = [
  { icon: BrainCircuit, title: "AI for Marketers",  color: "#10b981" },
  { icon: Search,       title: "SEO Mastery",       color: "#3b82f6" },
  { icon: FileText,     title: "Content Marketing", color: "#8b5cf6" },
  { icon: Share2,       title: "Social Media",      color: "#ec4899" },
  { icon: BarChart3,    title: "Google Analytics",  color: "#06b6d4" },
  { icon: LineChart,    title: "Media Planning",    color: "#6366f1" },
  { icon: Zap,          title: "Automation",        color: "#eab308" },
  { icon: Smartphone,   title: "Mobile Marketing",  color: "#14b8a6" },
]

// 8 cards in an organic scatter — 3 rows (3 / 3 / 2), bottom row peeks behind testimonial
const cardPositions = [
  // Row 1
  { x:  4, y:  4, rotation: -6, scale: 1.05, size: 148 },
  { x: 38, y:  2, rotation:  4, scale: 0.93, size: 136 },
  { x: 70, y:  6, rotation: -3, scale: 0.88, size: 130 },
  // Row 2
  { x:  2, y: 32, rotation:  5, scale: 0.97, size: 138 },
  { x: 37, y: 28, rotation: -5, scale: 1.02, size: 144 },
  { x: 68, y: 33, rotation:  7, scale: 0.91, size: 132 },
  // Row 3 — partially behind testimonial gradient
  { x:  8, y: 60, rotation: -4, scale: 0.95, size: 140 },
  { x: 46, y: 57, rotation:  3, scale: 1.00, size: 136 },
]

const floatClasses = ["animate-float-1", "animate-float-2", "animate-float-3", "animate-float-4"]

/* ─── Testimonials ────────────────────────────────────────────────────────── */

const testimonials = [
  {
    text: "It was an absolute privilege to attend these digital marketing training sessions under the guidance of Pritesh Patel. The sessions for Content and Native Advertising were very informative, and I got a clear differentiation perspective between both of them.",
    name: "Akhilesh Garde",
    role: "",
    company: "Economic Times",
  },
  {
    text: "Pritesh's session was an eye opener for every sales person. His rich sales background brought in real sales scenarios and gave deep insight on how we could utilise these to our advantage and improve our overall sales performance.",
    name: "Bandana Modi",
    role: "National Lead – Key Agencies",
    company: "Zirca Digital Solutions",
  },
  {
    text: "The training has had a significant impact on the way I will be preparing for meetings in the future. I have picked up a lot of factual information regarding the sources of information.",
    name: "Brahmanand Pandey",
    role: "Manager",
    company: "Zirca Digital Solutions",
  },
  {
    text: "A real eye-opener — the session was immense both in its depth of information and quality. A definite difference maker on what separates a great salesman from a good salesman.",
    name: "Vivek Nair",
    role: "Executive",
    company: "Zirca Digital Solutions",
  },
  {
    text: "Pritesh is a great mentor with an excellent understanding of the digital landscape. In just four short weeks, we gained good digital insights that I will imbibe now and in the months to come. I highly recommend it.",
    name: "Shaily Chhabra",
    role: "",
    company: "",
  },
  {
    text: "Undoubtedly one of the best digital learning and interactive sessions. Pritesh Patel is the most experienced person in the digital marketing space — the sharing of case studies and teaching by real-life examples made it exceptional.",
    name: "Shafi Gujrati",
    role: "Sr. Manager Sales",
    company: "",
  },
]

const FADE_MS = 350

/* ─── Component ───────────────────────────────────────────────────────────── */

export function AuthRightPanel() {
  const [mounted, setMounted] = useState(false)
  const [current, setCurrent] = useState(0)
  const [visible, setVisible] = useState(true)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false)
      timerRef.current = setTimeout(() => {
        setCurrent((p) => (p + 1) % testimonials.length)
        setVisible(true)
      }, FADE_MS)
    }, 5000)
    return () => {
      clearInterval(interval)
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  return (
    <div className="hidden lg:block lg:w-1/2 relative overflow-hidden">

      {/* Background */}
      <div
        className="absolute inset-0"
        style={{ background: "linear-gradient(135deg, #0a0f0a 0%, #0d1810 50%, #0a0f0a 100%)" }}
      />

      {/* Green grid pattern */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            "linear-gradient(rgba(34,197,94,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(34,197,94,0.1) 1px, transparent 1px)",
          backgroundSize: "50px 50px",
        }}
      />

      {/* Central glow */}
      <div
        className="absolute top-[38%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full blur-3xl animate-pulse pointer-events-none"
        style={{ backgroundColor: "rgba(34,197,94,0.06)" }}
      />

      {/* ── Floating cards ─────────────────────────────────────────────────
           Outer div: only left/top position + float animation (translateY/X)
           Inner div: rotate + scale (separate so they don't override each other)
      ─────────────────────────────────────────────────────────────────────── */}
      {mounted && courses.map((course, i) => {
        const Icon = course.icon
        const pos = cardPositions[i]
        return (
          <div
            key={course.title}
            className={`absolute ${floatClasses[i % 4]}`}
            style={{
              left: `${pos.x}%`,
              top: `${pos.y}%`,
              animationDelay: `${i * 0.28}s`,
              zIndex: i < 9 ? 2 : 1,
            }}
          >
            {/* Inner: rotation + scale — separate from animation transform */}
            <div
              className="transition-all duration-300 hover:scale-105"
              style={{ transform: `rotate(${pos.rotation}deg) scale(${pos.scale})` }}
            >
              <div
                className="rounded-xl p-4 backdrop-blur-sm flex flex-col items-center text-center"
                style={{
                  width: `${pos.size}px`,
                  backgroundColor: "rgba(13,20,13,0.88)",
                  border: "1px solid rgba(42,63,42,0.55)",
                  boxShadow: `0 0 28px ${course.color}14, 0 8px 28px rgba(0,0,0,0.45)`,
                }}
              >
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mb-2.5"
                  style={{
                    backgroundColor: `${course.color}1a`,
                    border: `1px solid ${course.color}38`,
                  }}
                >
                  <Icon className="w-8 h-8" style={{ color: course.color }} />
                </div>
                <p
                  className="text-[11px] font-medium leading-snug"
                  style={{ color: "rgba(255,255,255,0.88)" }}
                >
                  {course.title}
                </p>
              </div>
            </div>
          </div>
        )
      })}

      {/* Gradient that fades cards into testimonial */}
      <div
        className="absolute bottom-0 left-0 right-0 h-56 pointer-events-none z-10"
        style={{ background: "linear-gradient(to bottom, transparent 0%, rgba(10,15,10,0.9) 65%, rgba(10,15,10,1) 100%)" }}
      />

      {/* ── Testimonial overlay ── */}
      <div className="absolute bottom-0 left-0 right-0 z-20 p-5">
        <div
          className="rounded-2xl p-5 backdrop-blur-md"
          style={{
            backgroundColor: "rgba(13,20,13,0.95)",
            border: "1px solid rgba(42,63,42,0.6)",
          }}
        >
          {/* Tags */}
          <div className="flex gap-2 mb-3">
            <span
              className="px-2.5 py-0.5 text-[10px] font-medium rounded-full"
              style={{ backgroundColor: "rgba(34,197,94,0.12)", color: "#4ade80", border: "1px solid rgba(34,197,94,0.3)" }}
            >
              Digital Marketing
            </span>
            <span
              className="px-2.5 py-0.5 text-[10px] font-medium rounded-full"
              style={{ backgroundColor: "rgba(59,130,246,0.12)", color: "#60a5fa", border: "1px solid rgba(59,130,246,0.3)" }}
            >
              Online Learning
            </span>
          </div>

          {/* Fade-animated body */}
          <div
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? "translateY(0)" : "translateY(5px)",
              transition: `opacity ${FADE_MS}ms ease, transform ${FADE_MS}ms ease`,
            }}
          >
            <div className="relative mb-3">
              <span
                className="absolute -left-1 -top-3 text-3xl font-serif leading-none select-none"
                style={{ color: "rgba(34,197,94,0.4)" }}
              >
                &ldquo;
              </span>
              <p
                className="text-[12px] leading-relaxed pl-4"
                style={{ color: "rgba(255,255,255,0.78)" }}
              >
                {testimonials[current].text}
              </p>
            </div>

            <div
              className="pt-3 flex items-center justify-between"
              style={{ borderTop: "1px solid rgba(42,63,42,0.5)" }}
            >
              <div>
                <p className="text-sm font-semibold text-white leading-tight">
                  {testimonials[current].name}
                </p>
                <p className="text-[11px] mt-0.5" style={{ color: "rgba(255,255,255,0.45)" }}>
                  {testimonials[current].role && `${testimonials[current].role}`}
                  {testimonials[current].role && testimonials[current].company && ", "}
                  {testimonials[current].company && (
                    <span style={{ color: "#4ade80" }}>{testimonials[current].company}</span>
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  )
}
