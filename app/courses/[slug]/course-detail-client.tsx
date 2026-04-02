"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import {
  Users, Award, Star, CheckCircle, Play,
  Globe, Tag, AlertCircle, Video, FileText, Download,
  Smartphone, Trophy, Infinity, Lock
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { CurriculumAccordion } from "@/components/curriculum-accordion"
import { ClipboardList } from "lucide-react"
import type { Course, Section } from "@/lib/types"
import { VimeoPlayer } from "@/components/vimeo-player"
import { getCourseContentDefaults, type CourseContent } from "@/lib/course-content-defaults"

interface CourseDetailClientProps {
  course: Course
  sections: Section[]
  isEnrolled: boolean
  isLoggedIn: boolean
  completedLessonIds: string[]
  quizzes?: { id: number; title: string }[]
  content?: CourseContent
}

const VALID_COUPONS: Record<string, number> = {
  "LEVELUP80": 80,
  "BASECAMP50": 50,
  "AI2024": 30,
  "LAUNCH20": 20,
}

export function CourseDetailClient({
  course,
  sections,
  isEnrolled,
  isLoggedIn,
  completedLessonIds,
  quizzes,
  content: contentProp,
}: CourseDetailClientProps) {
  const router = useRouter()
  const [enrolling, setEnrolling] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [isIndia, setIsIndia] = useState(true)
  const [couponCode, setCouponCode] = useState("")
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null)
  const [couponError, setCouponError] = useState("")
  const [discount, setDiscount] = useState(0)
  const [showVideoModal, setShowVideoModal] = useState(false)
  const [previewModal, setPreviewModal] = useState<"auth" | "register" | "buy" | null>(null)

  const handlePreviewEnded = () => {
    setShowVideoModal(false)
    if (!isLoggedIn) {
      setPreviewModal("auth")
    } else if (isFree) {
      setPreviewModal("register")
    } else {
      setPreviewModal("buy")
    }
  }

  const handlePreviewClick = () => {
    if (!isLoggedIn) {
      setPreviewModal("auth")
    } else {
      setShowVideoModal(true)
    }
  }

  // Use the first lesson's video as the preview for all unenrolled users
  const firstLesson = sections.flatMap(s => s.lessons || [])[0]
  const previewVimeoId = firstLesson?.vimeo_video_id ?? null
  const previewYouTubeId = firstLesson?.youtube_video_id ?? null
  const previewSrc = previewVimeoId
    ? `https://player.vimeo.com/video/${previewVimeoId}?autoplay=1&title=0&byline=0&portrait=0&badge=0&sidedock=0&share=0`
    : previewYouTubeId
    ? `https://www.youtube.com/embed/${previewYouTubeId}?autoplay=1&rel=0&modestbranding=1`
    : null
  // Preview only for paid courses — crash courses are always price 0 so this excludes them
  const hasPreview = !!previewSrc && !isEnrolled && course.price > 0

  // Course-specific content — use DB-sourced prop, fall back to defaults
  const content = contentProp ?? getCourseContentDefaults(course.slug)
  const whatYouWillLearn = content.whatYouWillLearn
  const whoThisCourseIsFor = content.whoThisCourseIsFor
  const courseDescriptionExtra = content.descriptionExtra
  const requirements = content.requirements
  const breadcrumb = { items: content.breadcrumbItems, highlight: content.breadcrumbHighlight }
  const courseIncludes = content.courseIncludes
  // thumbnail: DB override first, then course prop
  const thumbnailUrl = content.thumbnailUrl || course.thumbnail_url

  // Prices — use actual course price from database
  const isFree = course.price === 0
  const currency = isIndia ? "₹" : "$"
  const basePrice = isIndia ? course.price : Math.round(course.price / 80)
  const origPrice = course.original_price || course.price
  const originalPrice = isIndia ? origPrice : Math.round(origPrice / 80)
  const discountedPrice = basePrice - (basePrice * discount / 100)

  useEffect(() => {
    setIsVisible(true)
    // Detect user's country (simplified - in production use a geo-IP service)
    const detectCountry = async () => {
      try {
        const res = await fetch('https://ipapi.co/json/')
        const data = await res.json()
        setIsIndia(data.country_code === 'IN')
      } catch {
        // Default to India if detection fails
        setIsIndia(true)
      }
    }
    detectCountry()
  }, [])

  const totalLessons = sections.reduce((acc, s) => acc + (s.lessons?.length || 0), 0)
  const courseLessonIds = new Set(sections.flatMap(s => s.lessons?.map(l => l.id) || []))
  const uniqueCompletedIds = [...new Set(completedLessonIds)]
  const completedCount = uniqueCompletedIds.filter(id => courseLessonIds.has(id)).length
  const progressPercent = totalLessons > 0 ? (completedCount / totalLessons) * 100 : 0

  const hours = Math.floor(course.total_duration_minutes / 60)
  const minutes = course.total_duration_minutes % 60
  const durationText = course.total_duration_minutes > 0
    ? (hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`)
    : null

  const applyCoupon = () => {
    setCouponError("")
    const code = couponCode.trim().toUpperCase()
    
    if (!code) {
      setCouponError("Please enter a coupon code")
      return
    }

    if (VALID_COUPONS[code]) {
      setAppliedCoupon(code)
      setDiscount(VALID_COUPONS[code])
      setCouponError("")
    } else {
      setCouponError("Invalid coupon code")
      setAppliedCoupon(null)
      setDiscount(0)
    }
  }

  const removeCoupon = () => {
    setAppliedCoupon(null)
    setDiscount(0)
    setCouponCode("")
  }

  const handleEnroll = async () => {
    if (!isLoggedIn) {
      router.push(`/auth/login?next=${encodeURIComponent(`/courses/${course.slug}`)}`)
      return
    }

    setEnrolling(true)
    try {
      const res = await fetch("/api/enroll", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId: course.id, courseTitle: course.title }),
      })
      if (res.ok) {
        router.refresh()
      }
    } catch {
      // silent
    }
    setEnrolling(false)
  }

  const handleBuyNow = () => {
    // Redirect to Razorpay (UI only - not integrated)
    alert(`Redirecting to Razorpay...\n\nAmount: ${currency}${discountedPrice.toFixed(2)}\n\nNote: This is a demo. Razorpay integration is not active.`)
  }

  const handleLessonClick = (lessonId: string) => {
    router.push(`/learn/${course.slug}/${lessonId}`)
  }

  const handleStartLearning = () => {
    const allLessons = sections.flatMap(s => s.lessons || [])
    const nextLesson = allLessons.find(l => !uniqueCompletedIds.includes(l.id)) || allLessons[0]
    if (nextLesson) {
      router.push(`/learn/${course.slug}/${nextLesson.id}`)
    }
  }

  return (
    <>
      {/* Full-screen Preview Modal — looks like the learn page */}
      {showVideoModal && (
        <div className="fixed inset-0 z-50 flex flex-col bg-background">
          {/* Top bar */}
          <div className="flex items-center justify-between px-4 py-3 border-b bg-background shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              <span className="font-semibold text-sm truncate">{course.title}</span>
              <span className="text-xs bg-primary/10 text-primary font-medium px-2 py-0.5 rounded shrink-0">Preview</span>
            </div>
            <button
              onClick={() => setShowVideoModal(false)}
              className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors shrink-0 ml-4"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
              Close
            </button>
          </div>

          {/* Body */}
          <div className="flex flex-1 overflow-hidden">
            {/* Left sidebar */}
            <aside className="hidden md:flex flex-col w-72 border-r overflow-y-auto shrink-0 bg-background">
              <div className="p-4 border-b">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Course content</p>
              </div>
              {sections.map((section, si) => (
                <div key={section.id}>
                  <div className="px-4 py-3 bg-muted/40 border-b">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Section {si + 1}</p>
                    <p className="text-sm font-semibold mt-0.5">{section.title}</p>
                  </div>
                  {(section.lessons || []).map((lesson, li) => {
                    const isFirst = si === 0 && li === 0
                    return (
                      <div
                        key={lesson.id}
                        className={`flex items-center gap-3 px-4 py-3 border-b text-sm ${isFirst ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
                      >
                        <div className="shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center text-xs">
                          {isFirst ? <Play className="w-2.5 h-2.5 fill-current" /> : <Lock className="w-2.5 h-2.5" />}
                        </div>
                        <span className="flex-1 truncate">{li + 1}. {lesson.title}</span>
                      </div>
                    )
                  })}
                </div>
              ))}
            </aside>

            {/* Main content */}
            <div className="flex-1 overflow-y-auto">
              {/* Video */}
              <div className="bg-black">
                {previewVimeoId ? (
                  <VimeoPlayer videoId={previewVimeoId} onEnded={handlePreviewEnded} />
                ) : previewYouTubeId ? (
                  <div className="relative aspect-video">
                    <iframe
                      src={`https://www.youtube.com/embed/${previewYouTubeId}?autoplay=1&rel=0&modestbranding=1`}
                      className="absolute inset-0 w-full h-full"
                      allow="autoplay; fullscreen; picture-in-picture"
                      allowFullScreen
                      title="Course preview"
                    />
                  </div>
                ) : null}
              </div>

              {/* Lesson info */}
              <div className="p-6 max-w-3xl">
                <h2 className="text-xl font-bold mb-2">{firstLesson?.title}</h2>
                {firstLesson?.description && (() => {
                  const plain = firstLesson.description.replace(/<[^>]*>/g, "").trim()
                  return plain ? <p className="text-muted-foreground text-sm mb-6">{plain}</p> : null
                })()}

                {/* CTA instead of Mark as Complete */}
                <div className="flex items-center gap-4 pt-4 border-t">
                  {isFree ? (
                    <Button onClick={() => { setShowVideoModal(false); handleEnroll() }} disabled={enrolling}>
                      {enrolling ? "Enrolling..." : "Enrol for Free — Get Full Access"}
                    </Button>
                  ) : (
                    <Button onClick={() => { setShowVideoModal(false); handleBuyNow() }}>
                      Buy Now to Continue Learning
                    </Button>
                  )}
                  <button
                    onClick={() => setShowVideoModal(false)}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Close preview
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <PreviewGateModal
        type={previewModal}
        slug={course.slug}
        currency={currency}
        discountedPrice={discountedPrice}
        onClose={() => setPreviewModal(null)}
        onEnroll={handleEnroll}
        onBuy={handleBuyNow}
        enrolling={enrolling}
      />
      {/* Dark Hero Section - Udemy Style */}
      <section className="bg-[#1c1d1f] text-white py-6 md:py-12 relative overflow-hidden">
        {/* Hero Image - uses course thumbnail, falls back to default */}
        <div className="hidden lg:block absolute top-0 right-0 w-[36%] h-full">
          <Image
            src={thumbnailUrl || "/Gemini_Generated_Image_auzbk3auzbk3auzb_cleanup.png"}
            alt={course.title}
            fill
            className="object-contain"
            style={{ objectPosition: "center right" }}
          />
        </div>
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Course Info */}
            <div className={`lg:col-span-2 transition-all duration-700 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}>
              {/* Breadcrumb */}
              <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
                {breadcrumb.items.map((item, i) => (
                  <span key={i}>
                    <span className="hover:text-primary cursor-pointer">{item}</span>
                    <span className="ml-2">{">"}</span>
                  </span>
                ))}
                <span className="text-primary">{breadcrumb.highlight}</span>
              </div>

              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold leading-tight mb-4">
                {course.title}
              </h1>
              
              <p className="text-lg text-gray-300 mb-4 leading-relaxed">
                {course.short_description}
              </p>

              <div className="flex flex-wrap items-center gap-3 mb-4">
                <Badge className="bg-yellow-500 text-black font-bold px-2">Bestseller</Badge>
                <div className="flex items-center gap-1">
                  <span className="font-bold text-yellow-400">{content.rating}</span>
                  <div className="flex">
                    {[1,2,3,4,5].map((i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <span className="text-sm text-gray-400">({content.reviewsCount} ratings)</span>
                </div>
                <span className="text-sm text-gray-400">{content.studentsCount} students</span>
              </div>

              <p className="text-sm text-gray-400 mb-2">
                Created by <span className="text-primary underline cursor-pointer">{content.instructorName || course.instructor_name}</span>
              </p>

              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
                <div className="flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  <span>Last updated {content.lastUpdated}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Globe className="h-4 w-4" />
                  <span>{content.language}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span>{content.subtitleLanguages}</span>
                </div>
              </div>
            </div>

            {/* Price Card - Desktop Hidden, Mobile Visible */}
            <div className="lg:hidden">
              <Card className="bg-white text-foreground shadow-xl">
                <CardContent className="p-0">
                  {(thumbnailUrl || hasPreview) && (
                    <div className="rounded-t-xl overflow-hidden">
                      <div className="relative aspect-video bg-gradient-to-br from-neutral-800 to-neutral-950">
                        {thumbnailUrl && (
                          <Image
                            src={thumbnailUrl}
                            alt={course.title}
                            fill
                            className="object-cover"
                          />
                        )}
                        {hasPreview && (
                          <button
                            onClick={handlePreviewClick}
                            className="absolute inset-0 flex flex-col items-center justify-center gap-2"
                          >
                            <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center">
                              <Play className="w-6 h-6 fill-white text-white ml-1" />
                            </div>
                            <span className="bg-black/60 text-white text-xs px-3 py-1.5 rounded-full">Preview this course</span>
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                  <div className="p-5">
                    <PriceSection
                      isFree={isFree}
                      isEnrolled={isEnrolled}
                      isLoggedIn={isLoggedIn}
                      currency={currency}
                      discountedPrice={discountedPrice}
                      originalPrice={originalPrice}
                      discount={discount}
                      appliedCoupon={appliedCoupon}
                      couponCode={couponCode}
                      setCouponCode={setCouponCode}
                      couponError={couponError}
                      applyCoupon={applyCoupon}
                      removeCoupon={removeCoupon}
                      handleBuyNow={handleBuyNow}
                      handleEnroll={handleEnroll}
                      handleStartLearning={handleStartLearning}
                      enrolling={enrolling}
                      progressPercent={progressPercent}
                      completedCount={completedCount}
                      totalLessons={totalLessons}
                      brochureUrl={course.brochure_url}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* What you'll learn */}
            <Card className="border-2">
              <CardContent className="p-6">
                <h2 className="text-xl font-bold mb-4">What you{"'"}ll learn</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {whatYouWillLearn.map((item, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span className="text-sm">{item}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Course Content */}
            <div>
              <h2 className="text-xl font-bold mb-2">Course content</h2>
              <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground mb-4">
                <span>{sections.length} sections</span>
                <span>•</span>
                <span>{totalLessons} lectures</span>
                {durationText && (
                  <>
                    <span>•</span>
                    <span>{durationText} total length</span>
                  </>
                )}
              </div>
              <CurriculumAccordion
                sections={sections}
                isEnrolled={isEnrolled}
                completedLessonIds={uniqueCompletedIds}
                onLessonClick={handleLessonClick}
                onPreviewClick={hasPreview ? handlePreviewClick : undefined}
              />

              {/* Quizzes / Assessments */}
              {quizzes && quizzes.length > 0 && (
                <div className="mt-3 border rounded-lg overflow-hidden">
                  <div className="px-4 py-3 bg-muted/50 flex items-center justify-between">
                    <span className="font-semibold text-sm">Assessment</span>
                  </div>
                  <ul className="divide-y divide-border">
                    {quizzes.map((quiz) => (
                      <li key={quiz.id}>
                        <button
                          onClick={() => isEnrolled && handleLessonClick(`quiz/${quiz.id}`)}
                          disabled={!isEnrolled}
                          className={`w-full flex items-center gap-4 px-4 py-3 text-left text-sm transition-colors ${
                            isEnrolled ? "hover:bg-accent/50 cursor-pointer" : "cursor-not-allowed opacity-60"
                          }`}
                        >
                          <ClipboardList className="h-4 w-4 shrink-0 text-muted-foreground" />
                          <span className="flex-1">{quiz.title}</span>
                          {!isEnrolled && <Lock className="h-4 w-4 text-muted-foreground" />}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Requirements */}
            <div>
              <h2 className="text-xl font-bold mb-4">Requirements</h2>
              <ul className="space-y-2">
                {requirements.map((req, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span className="text-sm text-muted-foreground">{req}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Description */}
            <div>
              <h2 className="text-xl font-bold mb-4">Description</h2>
              <div className="prose prose-sm max-w-none text-muted-foreground">
                {/* course.description intentionally hidden — will be updated per course */}
                <p className="mb-4">{courseDescriptionExtra}</p>
                <h3 className="text-foreground font-semibold mt-6 mb-2">Who this course is for:</h3>
                <ul className="space-y-1">
                  {whoThisCourseIsFor.map((item, i) => (
                    <li key={i}>• {item}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Instructor */}
            <div>
              <h2 className="text-xl font-bold mb-4">Instructor</h2>
              <div className="flex items-start gap-4">
                <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center shrink-0 overflow-hidden">
                  {content.instructorAvatar ? (
                    <Image src={content.instructorAvatar} alt={content.instructorName || ""} width={96} height={96} className="object-cover w-full h-full" />
                  ) : (
                    <Award className="h-12 w-12 text-primary" />
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-primary underline cursor-pointer">
                    {content.instructorName || course.instructor_name}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-2">{content.instructorTitle || course.instructor_title}</p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4" />
                      <span>{content.instructorRating} Instructor Rating</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>{content.instructorStudents} Students</span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">{content.instructorBio}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Sidebar - Desktop Price Card */}
          <div className="hidden lg:block">
            <div className="sticky top-20">
              <Card className="shadow-xl border-0 overflow-hidden">
                <CardContent className="p-0">
                  {(thumbnailUrl || hasPreview) && (
                    <div className="overflow-hidden">
                      <div className="relative aspect-video bg-gradient-to-br from-neutral-800 to-neutral-950">
                        {thumbnailUrl && (
                          <Image
                            src={thumbnailUrl}
                            alt={course.title}
                            fill
                            className="object-cover"
                          />
                        )}
                        {hasPreview && (
                          <button
                            onClick={handlePreviewClick}
                            className="absolute inset-0 flex flex-col items-center justify-center gap-2"
                          >
                            <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center">
                              <Play className="w-7 h-7 fill-white text-white ml-1" />
                            </div>
                            <span className="bg-black/60 text-white text-sm px-3 py-1.5 rounded-full">Preview this course</span>
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                  <div className="p-6">
                    <PriceSection
                      isFree={isFree}
                      isEnrolled={isEnrolled}
                      isLoggedIn={isLoggedIn}
                      currency={currency}
                      discountedPrice={discountedPrice}
                      originalPrice={originalPrice}
                      discount={discount}
                      appliedCoupon={appliedCoupon}
                      couponCode={couponCode}
                      setCouponCode={setCouponCode}
                      couponError={couponError}
                      applyCoupon={applyCoupon}
                      removeCoupon={removeCoupon}
                      handleBuyNow={handleBuyNow}
                      handleEnroll={handleEnroll}
                      handleStartLearning={handleStartLearning}
                      enrolling={enrolling}
                      progressPercent={progressPercent}
                      completedCount={completedCount}
                      totalLessons={totalLessons}
                      brochureUrl={course.brochure_url}
                    />

                    <Separator className="my-6" />

                    <div>
                      <p className="font-semibold text-sm mb-4">This course includes:</p>
                      <ul className="space-y-3">
                        {courseIncludes.map((text, index) => {
                          const icons = [Video, FileText, Download, Smartphone, Infinity, Trophy]
                          const Icon = icons[index] ?? CheckCircle
                          return (
                            <li key={index} className="flex items-center gap-3 text-sm text-muted-foreground">
                              <Icon className="h-4 w-4 shrink-0" />
                              <span>{text}</span>
                            </li>
                          )
                        })}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

function PreviewGateModal({
  type,
  slug,
  currency,
  discountedPrice,
  onClose,
  onEnroll,
  onBuy,
  enrolling,
}: {
  type: "auth" | "register" | "buy" | null
  slug: string
  currency: string
  discountedPrice: number
  onClose: () => void
  onEnroll: () => void
  onBuy: () => void
  enrolling: boolean
}) {
  if (!type) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative bg-background rounded-2xl border shadow-2xl w-full max-w-sm p-6 space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {type === "auth" && (
          <>
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <Lock className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-bold">Sign in to watch the preview</h3>
              <p className="text-sm text-muted-foreground">Create a free account to watch the course preview and access our content.</p>
            </div>
            <div className="space-y-3">
              <a href="/auth/sign-up" className="block">
                <Button className="w-full" size="lg">Sign Up — It&apos;s Free</Button>
              </a>
              <a href={`/auth/login?next=/courses/${slug}`} className="block">
                <Button variant="outline" className="w-full" size="lg">Log In</Button>
              </a>
            </div>
          </>
        )}

        {type === "register" && (
          <>
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <Play className="w-6 h-6 text-primary fill-primary" />
              </div>
              <h3 className="text-lg font-bold">Enjoying the preview?</h3>
              <p className="text-sm text-muted-foreground">Register for free to get full access to this course.</p>
            </div>
            <Button onClick={() => { onClose(); onEnroll() }} className="w-full" size="lg" disabled={enrolling}>
              {enrolling ? "Registering..." : "Register for Free"}
            </Button>
          </>
        )}

        {type === "buy" && (
          <>
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                <Play className="w-6 h-6 text-primary fill-primary" />
              </div>
              <h3 className="text-lg font-bold">Want to keep learning?</h3>
              <p className="text-sm text-muted-foreground">Get full access to this course and continue your journey.</p>
            </div>
            <div className="text-center py-1">
              <span className="text-3xl font-bold">{currency}{discountedPrice.toFixed(2)}</span>
            </div>
            <Button onClick={() => { onClose(); onBuy() }} className="w-full" size="lg">
              Buy Now — Go to Razorpay
            </Button>
          </>
        )}
      </div>
    </div>
  )
}

// Price Section Component
function PriceSection({
  isFree,
  isEnrolled,
  isLoggedIn,
  currency,
  discountedPrice,
  originalPrice,
  discount,
  appliedCoupon,
  couponCode,
  setCouponCode,
  couponError,
  applyCoupon,
  removeCoupon,
  handleBuyNow,
  handleEnroll,
  handleStartLearning,
  enrolling,
  progressPercent,
  completedCount,
  totalLessons,
  brochureUrl,
}: {
  isFree: boolean
  isEnrolled: boolean
  isLoggedIn: boolean
  currency: string
  discountedPrice: number
  originalPrice: number
  discount: number
  appliedCoupon: string | null
  couponCode: string
  setCouponCode: (v: string) => void
  couponError: string
  applyCoupon: () => void
  removeCoupon: () => void
  handleBuyNow: () => void
  handleEnroll: () => void
  handleStartLearning: () => void
  enrolling: boolean
  progressPercent: number
  completedCount: number
  totalLessons: number
  brochureUrl: string | null
}) {
  if (isFree && !isEnrolled && !isLoggedIn) {
    return (
      <div className="space-y-4">
        <div className="text-center p-4 rounded-xl bg-primary/10 border border-primary/20">
          <p className="text-2xl font-extrabold text-primary mb-1">FREE</p>
          <p className="text-sm text-muted-foreground">No credit card required</p>
        </div>
        <a href="/auth/sign-up">
          <Button className="w-full" size="lg">Sign Up to Access</Button>
        </a>
        <a href="/auth/login">
          <Button variant="outline" className="w-full" size="lg">Already have an account? Log In</Button>
        </a>
      </div>
    )
  }

  if (isFree && !isEnrolled && isLoggedIn) {
    return (
      <div className="space-y-4">
        <div className="text-center p-4 rounded-xl bg-primary/10 border border-primary/20">
          <p className="text-2xl font-extrabold text-primary mb-1">FREE</p>
          <p className="text-sm text-muted-foreground">No credit card required</p>
        </div>
        <Button onClick={handleEnroll} className="w-full" size="lg" disabled={enrolling}>
          {enrolling ? "Registering..." : "Register for Free"}
        </Button>
      </div>
    )
  }

  if (isEnrolled) {
    return (
      <div className="space-y-4">
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-muted-foreground">Your progress</span>
            <span className="font-medium">{Math.round(progressPercent)}%</span>
          </div>
          <Progress value={progressPercent} className="h-2" />
          <p className="text-xs text-muted-foreground mt-2">
            {completedCount} of {totalLessons} lessons completed
          </p>
        </div>
        <Button onClick={handleStartLearning} className="w-full gap-2" size="lg">
          <Play className="h-4 w-4" />
          {completedCount > 0 ? "Continue Learning" : "Start Learning"}
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Price Display */}
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-bold">{currency}{discountedPrice.toFixed(2)}</span>
        <span className="text-lg text-muted-foreground line-through">{currency}{originalPrice.toFixed(2)}</span>
        <Badge variant="destructive" className="ml-2">
          {Math.round(((originalPrice - discountedPrice) / originalPrice) * 100)}% off
        </Badge>
      </div>

      {appliedCoupon && (
        <div className="flex items-center justify-between bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 px-3 py-2 rounded-lg text-sm">
          <div className="flex items-center gap-2">
            <Tag className="h-4 w-4" />
            <span><strong>{appliedCoupon}</strong> applied - {discount}% off!</span>
          </div>
          <button onClick={removeCoupon} className="text-xs underline hover:no-underline">
            Remove
          </button>
        </div>
      )}

      {/* Coupon Input */}
      {!appliedCoupon && (
        <div className="space-y-2">
          <div className="flex gap-2">
            <Input
              placeholder="Enter coupon code"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
              className="flex-1"
            />
            <Button variant="outline" onClick={applyCoupon}>
              Apply
            </Button>
          </div>
          {couponError && (
            <p className="text-sm text-destructive">{couponError}</p>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <Button 
        onClick={handleBuyNow} 
        className="w-full bg-primary hover:bg-primary/90" 
        size="lg"
      >
        Buy Now - Go to Razorpay
      </Button>

      {!isLoggedIn && (
        <p className="text-xs text-center text-muted-foreground">
          You will need to sign in to purchase
        </p>
      )}

      <p className="text-xs text-center text-muted-foreground">
        30-Day Money-Back Guarantee
      </p>

      {!isEnrolled && (
        brochureUrl ? (
          <BrochureButton brochureUrl={brochureUrl} isLoggedIn={isLoggedIn} />
        ) : (
          <Button variant="outline" className="w-full gap-2" disabled>
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Download the brochure
          </Button>
        )
      )}
    </div>
  )
}

function BrochureButton({ brochureUrl, isLoggedIn }: { brochureUrl: string; isLoggedIn: boolean }) {
  const [showModal, setShowModal] = useState(false)

  const DownloadIcon = () => (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  )

  return (
    <>
      {isLoggedIn ? (
        <a href={brochureUrl} download target="_blank" rel="noopener noreferrer">
          <Button className="w-full gap-2 bg-primary hover:bg-primary/90 text-white">
            <DownloadIcon />
            Download the brochure
          </Button>
        </a>
      ) : (
        <Button className="w-full gap-2 bg-primary hover:bg-primary/90 text-white" onClick={() => setShowModal(true)}>
          <DownloadIcon />
          Download the brochure
        </Button>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div
            className="relative bg-background rounded-2xl border shadow-xl w-full max-w-sm p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>

            <div className="text-center space-y-1">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <svg className="w-6 h-6 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold">Access the Brochure</h3>
              <p className="text-sm text-muted-foreground">To access the brochure, please log in or sign up.</p>
            </div>

            <div className="space-y-2 pt-1">
              <a href={`/auth/login?next=${encodeURIComponent(typeof window !== "undefined" ? window.location.pathname : "")}`} className="block">
                <Button className="w-full" size="lg">Log In</Button>
              </a>
              <a href="/auth/sign-up" className="block">
                <Button variant="outline" className="w-full" size="lg">Create a Free Account</Button>
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
