"use client"

import { useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { LessonSidebar } from "@/components/lesson-sidebar"
import { ThemeToggle } from "@/components/theme-toggle"
import { ProgressProvider, useProgress } from "./progress-context"
import type { Course, Section } from "@/lib/types"

interface LearnLayoutClientProps {
  children: React.ReactNode
  course: Course
  sections: Section[]
  completedLessonIds: string[]
  totalLessons: number
  quizzes?: { id: number; title: string }[]
}

function LearnLayoutInner({
  children,
  course,
  sections,
  totalLessons,
  quizzes,
}: Omit<LearnLayoutClientProps, "completedLessonIds">) {
  const params = useParams()
  const currentLessonId = params.lessonId as string
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { completedLessonIds } = useProgress()

  const completedCount = completedLessonIds.length
  const progressPercent = totalLessons > 0 ? (completedCount / totalLessons) * 100 : 0

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
        <div className="flex items-center justify-between h-14 px-4">
          <div className="flex items-center gap-3">
            <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle sidebar</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-80">
                <LessonSidebar
                  courseSlug={course.slug}
                  courseTitle={course.title}
                  sections={sections}
                  currentLessonId={currentLessonId}
                  completedLessonIds={completedLessonIds}
                  quizzes={quizzes}
                />
              </SheetContent>
            </Sheet>
            <Link
              href={`/courses/${course.slug}`}
              className="text-sm font-medium hover:text-primary truncate max-w-[160px] sm:max-w-xs"
            >
              {course.title}
            </Link>
          </div>

          {/* Progress bar */}
          <div className="hidden sm:flex flex-col items-center gap-0.5 flex-1 mx-6">
            <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
              <span>{Math.round(progressPercent)}% COMPLETE</span>
              <span>{completedCount}/{totalLessons} Steps</span>
            </div>
            <div className="w-full max-w-xs h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="flex-1 flex">
        <aside className="hidden lg:block w-80 shrink-0">
          <div className="sticky top-14 h-[calc(100vh-3.5rem)]">
            <LessonSidebar
              courseSlug={course.slug}
              courseTitle={course.title}
              sections={sections}
              currentLessonId={currentLessonId}
              completedLessonIds={completedLessonIds}
              quizzes={quizzes}
            />
          </div>
        </aside>
        <main className="flex-1 min-w-0">
          {children}
        </main>
      </div>
    </div>
  )
}

export function LearnLayoutClient({
  children,
  course,
  sections,
  completedLessonIds,
  totalLessons,
  quizzes,
}: LearnLayoutClientProps) {
  return (
    <ProgressProvider initialCompletedIds={completedLessonIds}>
      <LearnLayoutInner course={course} sections={sections} totalLessons={totalLessons} quizzes={quizzes}>
        {children}
      </LearnLayoutInner>
    </ProgressProvider>
  )
}
