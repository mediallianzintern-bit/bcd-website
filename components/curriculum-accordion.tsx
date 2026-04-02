"use client"

import { PlayCircle, Lock, CheckCircle } from "lucide-react"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import type { Section } from "@/lib/types"

interface CurriculumAccordionProps {
  sections: Section[]
  isEnrolled: boolean
  completedLessonIds?: string[]
  onLessonClick?: (lessonId: string) => void
  onPreviewClick?: () => void
}

export function CurriculumAccordion({
  sections,
  isEnrolled,
  completedLessonIds = [],
  onLessonClick,
  onPreviewClick,
}: CurriculumAccordionProps) {
  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes}:00`
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}:${mins.toString().padStart(2, '0')}:00`
  }

  const formatSectionDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes}min`
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return mins > 0 ? `${hours}hr ${mins}min` : `${hours}hr`
  }

  // Track the absolute index across all sections to identify the very first lesson
  let globalLessonIndex = 0

  return (
    <Accordion type="multiple" defaultValue={[sections[0]?.id]} className="w-full border rounded-lg overflow-hidden">
      {sections.map((section) => {
        const sectionLessons = section.lessons || []
        const completedInSection = sectionLessons.filter(l => completedLessonIds.includes(l.id)).length
        const totalDuration = sectionLessons.reduce((acc, l) => acc + l.duration_minutes, 0)

        return (
          <AccordionItem
            key={section.id}
            value={section.id}
            className="border-b last:border-b-0"
          >
            <AccordionTrigger className="hover:no-underline px-4 py-4 bg-muted/50 hover:bg-muted/70 transition-colors data-[state=open]:bg-muted/70">
              <div className="flex items-center justify-between w-full pr-4">
                <div className="flex items-center gap-3 text-left">
                  <span className="font-semibold text-sm">
                    {section.title}
                  </span>
                  {isEnrolled && completedInSection === sectionLessons.length && sectionLessons.length > 0 && (
                    <CheckCircle className="h-4 w-4 text-primary" />
                  )}
                </div>
                <div className="text-xs text-muted-foreground flex items-center gap-2">
                  <span>{sectionLessons.length} lectures</span>
                  {totalDuration > 0 && (
                    <>
                      <span>•</span>
                      <span>{formatSectionDuration(totalDuration)}</span>
                    </>
                  )}
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="p-0">
              <ul className="divide-y divide-border">
                {sectionLessons.map((lesson) => {
                  const isCompleted = completedLessonIds.includes(lesson.id)
                  // First lesson across ALL sections is always the free preview when not enrolled
                  const isPreviewLesson = globalLessonIndex === 0 && !isEnrolled && !!onPreviewClick
                  globalLessonIndex++
                  const canAccess = isEnrolled

                  return (
                    <li key={lesson.id}>
                      <button
                        onClick={() => {
                          if (isPreviewLesson) {
                            onPreviewClick?.()
                          } else if (canAccess) {
                            onLessonClick?.(lesson.id)
                          }
                        }}
                        disabled={!canAccess && !isPreviewLesson}
                        className={`w-full flex items-center gap-4 px-4 py-3 text-left transition-colors ${
                          canAccess || isPreviewLesson
                            ? "hover:bg-accent/50 cursor-pointer"
                            : "cursor-not-allowed"
                        }`}
                      >
                        <div className="shrink-0">
                          {isCompleted ? (
                            <CheckCircle className="h-4 w-4 text-primary" />
                          ) : (
                            <input
                              type="checkbox"
                              checked={false}
                              readOnly
                              className="h-4 w-4 rounded border-border"
                            />
                          )}
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {canAccess || isPreviewLesson ? (
                            <PlayCircle className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <Lock className="h-4 w-4 text-muted-foreground" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm ${isCompleted ? "text-primary" : "text-foreground"}`}>
                            {lesson.title}
                          </p>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground shrink-0">
                          {isPreviewLesson && (
                            <span className="text-primary font-medium underline">Preview</span>
                          )}
                          {lesson.duration_minutes > 0 && (
                            <span>{formatDuration(lesson.duration_minutes)}</span>
                          )}
                        </div>
                      </button>
                    </li>
                  )
                })}
              </ul>
            </AccordionContent>
          </AccordionItem>
        )
      })}
    </Accordion>
  )
}
