"use client"

import dynamic from "next/dynamic"
import type { Course, Section, Lesson } from "@/lib/types"

const LearnPageClient = dynamic(
  () => import("./learn-page-client").then(m => ({ default: m.LearnPageClient })),
  { ssr: false }
)

interface LearnPageWrapperProps {
  course: Course
  sections: Section[]
  currentLesson: Lesson
  completedLessonIds: string[]
  prevLessonId: string | null
  nextLessonId: string | null
  nextIsQuiz?: boolean
}

export function LearnPageWrapper(props: LearnPageWrapperProps) {
  return <LearnPageClient {...props} />
}
