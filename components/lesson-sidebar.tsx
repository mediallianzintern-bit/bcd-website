"use client"

import { useState } from "react"
import Link from "next/link"
import { PlayCircle, CheckCircle, ChevronLeft, ChevronDown, ChevronUp, ClipboardList, Circle } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import type { Section } from "@/lib/types"

interface LessonSidebarProps {
  courseSlug: string
  courseTitle: string
  sections: Section[]
  currentLessonId: string
  completedLessonIds: string[]
  quizzes?: { id: number; title: string }[]
}

export function LessonSidebar({
  courseSlug,
  courseTitle,
  sections,
  currentLessonId,
  completedLessonIds,
  quizzes,
}: LessonSidebarProps) {
  // Auto-open the section that contains the current lesson
  const initialOpen = new Set(
    sections
      .filter((s) =>
        s.lessons?.some(
          (l) =>
            l.id === currentLessonId ||
            l.sub_lessons?.some((t) => t.id === currentLessonId)
        )
      )
      .map((s) => s.id)
  )

  const [openSections, setOpenSections] = useState<Set<string>>(initialOpen)

  const toggle = (id: string) =>
    setOpenSections((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })

  return (
    <div className="flex flex-col h-full border-r bg-card">
      <div className="p-4 border-b">
        <Link href={`/courses/${courseSlug}`}>
          <Button variant="ghost" size="sm" className="gap-2 -ml-2 mb-2">
            <ChevronLeft className="h-4 w-4" />
            Back to Course
          </Button>
        </Link>
        <h2 className="font-semibold text-sm line-clamp-2">{courseTitle}</h2>
      </div>

      <ScrollArea className="flex-1">
        <div className="divide-y">
          {sections.map((section, sectionIndex) => {
            const isOpen = openSections.has(section.id)
            return (
              <div key={section.id}>
                {/* Section header — click to expand/collapse */}
                <button
                  onClick={() => toggle(section.id)}
                  className="w-full flex items-start justify-between gap-2 px-4 py-3 text-left hover:bg-accent/50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide leading-none mb-0.5">
                      Section {sectionIndex + 1}
                    </p>
                    <p className="text-sm font-medium line-clamp-2 leading-snug">
                      {section.title}
                    </p>
                  </div>
                  {isOpen ? (
                    <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0 mt-1" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0 mt-1" />
                  )}
                </button>

                {/* Lesson list — shown only when section is open */}
                {isOpen && (
                  <ul className="px-3 pb-3 space-y-0.5">
                    {section.lessons?.map((lesson, lessonIndex) => {
                      const isActive = lesson.id === currentLessonId
                      const isCompleted = completedLessonIds.includes(lesson.id)

                      return (
                        <li key={lesson.id}>
                          <Link
                            href={`/learn/${courseSlug}/${lesson.id}`}
                            className={`flex items-center gap-2 px-2 py-2 rounded-md text-sm transition-colors ${
                              isActive
                                ? "bg-primary text-primary-foreground"
                                : "hover:bg-accent"
                            }`}
                          >
                            {isCompleted ? (
                              <CheckCircle className={`h-4 w-4 shrink-0 ${isActive ? "" : "text-primary"}`} />
                            ) : (
                              <PlayCircle className="h-4 w-4 shrink-0 text-muted-foreground" />
                            )}
                            <span className="line-clamp-2 leading-snug">
                              {lessonIndex + 1}. {lesson.title}
                            </span>
                          </Link>

                          {/* Sub-topics */}
                          {lesson.sub_lessons && lesson.sub_lessons.length > 0 && (
                            <ul className="pl-6 mt-0.5 space-y-0.5">
                              {lesson.sub_lessons.map((topic) => {
                                const isTopicActive = topic.id === currentLessonId
                                const isTopicCompleted = completedLessonIds.includes(topic.id)
                                return (
                                  <li key={topic.id}>
                                    <Link
                                      href={`/learn/${courseSlug}/${topic.id}`}
                                      className={`flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-colors ${
                                        isTopicActive
                                          ? "bg-primary text-primary-foreground"
                                          : "hover:bg-accent"
                                      }`}
                                    >
                                      {isTopicCompleted ? (
                                        <CheckCircle className={`h-3 w-3 shrink-0 ${isTopicActive ? "" : "text-primary"}`} />
                                      ) : (
                                        <Circle className="h-3 w-3 shrink-0 text-muted-foreground" />
                                      )}
                                      <span className="line-clamp-2 leading-snug text-xs">{topic.title}</span>
                                    </Link>
                                  </li>
                                )
                              })}
                            </ul>
                          )}
                        </li>
                      )
                    })}
                  </ul>
                )}
              </div>
            )
          })}

          {/* Quizzes */}
          {quizzes && quizzes.length > 0 && (
            <div className="px-3 py-3">
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-2 px-1">
                Assessment
              </p>
              <ul className="space-y-0.5">
                {quizzes.map((quiz) => {
                  const isActive = currentLessonId === `quiz-${quiz.id}`
                  return (
                    <li key={quiz.id}>
                      <Link
                        href={`/learn/${courseSlug}/quiz/${quiz.id}`}
                        className={`flex items-center gap-2 px-2 py-2 rounded-md text-sm transition-colors ${
                          isActive
                            ? "bg-primary text-primary-foreground"
                            : "hover:bg-accent"
                        }`}
                      >
                        <ClipboardList className="h-4 w-4 shrink-0" />
                        <span className="line-clamp-1">{quiz.title}</span>
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
