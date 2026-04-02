"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CourseCard } from "@/components/course-card"
import type { Course } from "@/lib/types"

interface FeaturedCoursesCarouselProps {
  courses: Course[]
  enrolledCourseIds: string[]
  isLoggedIn?: boolean
}

function useVisibleCount() {
  const [count, setCount] = useState(3)
  useEffect(() => {
    const update = () => {
      if (window.innerWidth < 640) setCount(1)
      else if (window.innerWidth < 1024) setCount(2)
      else setCount(3)
    }
    update()
    window.addEventListener("resize", update)
    return () => window.removeEventListener("resize", update)
  }, [])
  return count
}

export function FeaturedCoursesCarousel({ courses, enrolledCourseIds, isLoggedIn }: FeaturedCoursesCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const visibleCount = useVisibleCount()
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const touchStartX = useRef<number | null>(null)

  const maxIndex = Math.max(0, courses.length - visibleCount)

  // Clamp currentIndex when visibleCount changes (e.g., on resize)
  useEffect(() => {
    setCurrentIndex((prev) => Math.min(prev, maxIndex))
  }, [maxIndex])

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1))
    }, 5000)
  }, [maxIndex])

  useEffect(() => {
    resetTimer()
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [resetTimer])

  const goTo = (index: number) => {
    if (index < 0) index = maxIndex
    if (index > maxIndex) index = 0
    setCurrentIndex(index)
    resetTimer()
  }

  const prev = () => goTo(currentIndex - 1)
  const next = () => goTo(currentIndex + 1)

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }

  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return
    const delta = touchStartX.current - e.changedTouches[0].clientX
    if (Math.abs(delta) > 40) {
      delta > 0 ? next() : prev()
    }
    touchStartX.current = null
  }

  // If courses fit without scrolling, just show a responsive grid
  if (courses.length <= visibleCount) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
          <CourseCard
            key={course.id}
            course={course}
            isEnrolled={enrolledCourseIds.includes(course.id)}
            isLoggedIn={isLoggedIn}
          />
        ))}
      </div>
    )
  }

  const cardWidthPct = 100 / visibleCount

  return (
    <div className="relative">
      {/* Prev arrow */}
      <Button
        variant="outline"
        size="icon"
        className="absolute -left-3 md:-left-5 top-1/2 -translate-y-8 z-10 h-9 w-9 rounded-full bg-background/90 backdrop-blur-sm shadow-lg border-primary/20"
        onClick={prev}
        aria-label="Previous"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      {/* Next arrow */}
      <Button
        variant="outline"
        size="icon"
        className="absolute -right-3 md:-right-5 top-1/2 -translate-y-8 z-10 h-9 w-9 rounded-full bg-background/90 backdrop-blur-sm shadow-lg border-primary/20"
        onClick={next}
        aria-label="Next"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>

      {/* Track */}
      <div
        className="overflow-hidden"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <div
          className="flex transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${currentIndex * cardWidthPct}%)` }}
        >
          {courses.map((course) => (
            <div
              key={course.id}
              className="flex-shrink-0 px-3"
              style={{ width: `${cardWidthPct}%` }}
            >
              <CourseCard
                course={course}
                isEnrolled={enrolledCourseIds.includes(course.id)}
                isLoggedIn={isLoggedIn}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Dots */}
      <div className="flex justify-center gap-2 mt-6">
        {Array.from({ length: maxIndex + 1 }, (_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            aria-label={`Go to slide ${i + 1}`}
            className={`h-2 rounded-full transition-all duration-300 ${
              i === currentIndex
                ? "w-6 bg-primary"
                : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50"
            }`}
          />
        ))}
      </div>
    </div>
  )
}
