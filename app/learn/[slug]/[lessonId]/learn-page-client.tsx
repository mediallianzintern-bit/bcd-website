"use client"

import { useState, useTransition, useEffect, useRef, useCallback } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ChevronLeft, ChevronRight, CheckCircle, Circle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { VimeoPlayer } from "@/components/vimeo-player"
import { YouTubePlayer } from "@/components/youtube-player"
import { useAuthStore } from "@/lib/store/auth-store"
import { useProgress } from "../progress-context"
import type { Course, Section, Lesson } from "@/lib/types"

interface LearnPageClientProps {
  course: Course
  sections: Section[]
  currentLesson: Lesson
  completedLessonIds: string[]
  prevLessonId: string | null
  nextLessonId: string | null
  nextIsQuiz?: boolean
}

export function LearnPageClient({
  course,
  sections,
  currentLesson,
  prevLessonId,
  nextLessonId,
  nextIsQuiz,
}: LearnPageClientProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const { completedLessonIds: localCompleted, markComplete, markIncomplete } = useProgress()
  const [autoplay, setAutoplay] = useState(true)
  const [countdown, setCountdown] = useState<number | null>(null)
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const mountedRef = useRef(true)

  const isCompleted = localCompleted.includes(currentLesson.id)

  const allLessons = sections.flatMap(s => s.lessons ?? [])
  const nextLesson = nextLessonId ? allLessons.find(l => l.id === nextLessonId) : null

  const cancelAutoplay = useCallback(() => {
    if (countdownRef.current) clearInterval(countdownRef.current)
    setCountdown(null)
  }, [])

  const maybeSendCertificate = useCallback((newCompleted: string[]) => {
    const allLessonIds = sections.flatMap(s => s.lessons ?? []).map(l => l.id)
    const isAllDone = allLessonIds.length > 0 && allLessonIds.every(id => newCompleted.includes(id))
    if (!isAllDone) return
    const { user } = useAuthStore.getState()
    if (!user) return
    fetch("/api/certificate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: user.name || user.email,
        email: user.email,
        courseTitle: course.title,
        completedAt: new Date().toISOString(),
      }),
    }).catch(() => {/* silent */})
  }, [sections, course.title])

  const toggleComplete = async (skipRefresh = false) => {
    if (isCompleted) {
      await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lessonId: currentLesson.id, completed: false }),
      })
      markIncomplete(currentLesson.id)
    } else {
      await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lessonId: currentLesson.id, completed: true }),
      })
      markComplete(currentLesson.id)
      maybeSendCertificate([...localCompleted, currentLesson.id])
    }

    if (!skipRefresh) {
      startTransition(() => { router.refresh() })
    }
  }

  const handleMarkCompleteAndNext = async () => {
    if (!isCompleted) await toggleComplete(true)
    if (nextLessonId) router.push(`/learn/${course.slug}/${nextLessonId}`)
  }

  const handleVideoEnded = useCallback(async () => {
    // Mark complete in background — don't block countdown
    const wasAlreadyCompleted = localCompleted.includes(currentLesson.id)
    if (!wasAlreadyCompleted) {
      markComplete(currentLesson.id)

      await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lessonId: currentLesson.id, completed: true }),
      })

      // Check if this was the last lesson — send certificate
      maybeSendCertificate([...localCompleted, currentLesson.id])
    }

    if (!autoplay || !nextLessonId || !mountedRef.current) return

    // Start countdown immediately
    if (countdownRef.current) clearInterval(countdownRef.current)
    setCountdown(5)
    countdownRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev === null || prev <= 1) {
          clearInterval(countdownRef.current!)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }, [autoplay, nextLessonId, localCompleted, currentLesson.id])

  useEffect(() => {
    if (countdown === 0 && nextLessonId) {
      setCountdown(null)
      router.push(`/learn/${course.slug}/${nextLessonId}`)
    }
  }, [countdown, nextLessonId, course.slug, router])

  useEffect(() => {
    if (nextLessonId) router.prefetch(`/learn/${course.slug}/${nextLessonId}`)
  }, [nextLessonId, course.slug, router])

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
      if (countdownRef.current) clearInterval(countdownRef.current)
    }
  }, [])

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 lg:p-8">
      {/* Video Player — only rendered when a video exists */}
      {(currentLesson.vimeo_video_id || currentLesson.youtube_video_id) && (
        <>
          <div className="relative">
            {currentLesson.vimeo_video_id ? (
              <VimeoPlayer
                videoId={currentLesson.vimeo_video_id}
                title={currentLesson.title}
                onEnded={handleVideoEnded}
              />
            ) : (
              <YouTubePlayer
                videoId={currentLesson.youtube_video_id!}
                title={currentLesson.title}
                onEnded={handleVideoEnded}
              />
            )}

            {/* Autoplay "Up next" overlay — Udemy style */}
            {countdown !== null && nextLesson && (
              <div className="absolute inset-0 bg-black/85 rounded-lg flex flex-col items-center justify-center z-20">
                <button
                  onClick={() => toggleComplete(true)}
                  className="absolute top-4 left-4 flex items-center gap-2 text-xs text-white/70 hover:text-white transition-colors"
                >
                  <span className={`w-4 h-4 rounded-sm flex items-center justify-center border-2 transition-colors shrink-0 ${isCompleted ? "bg-primary border-primary" : "border-white/40"}`}>
                    {isCompleted && (
                      <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 10 10" fill="none">
                        <path d="M1.5 5l2.5 2.5 4.5-4.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </span>
                  {isCompleted ? "Completed" : "Mark complete"}
                </button>

                <p className="text-white/50 text-xs uppercase tracking-widest mb-3">Up next</p>
                <p className="text-white text-lg font-semibold text-center px-10 mb-6 max-w-md leading-snug">
                  {nextLesson.title}
                </p>

                <div className="relative w-16 h-16">
                  <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
                    <circle cx="32" cy="32" r="28" fill="none" stroke="white" strokeOpacity="0.2" strokeWidth="4" />
                    <circle
                      cx="32" cy="32" r="28" fill="none" stroke="white" strokeWidth="4"
                      strokeDasharray={`${2 * Math.PI * 28}`}
                      strokeDashoffset={`${2 * Math.PI * 28 * (1 - countdown / 5)}`}
                      strokeLinecap="round"
                      className="transition-all duration-1000"
                    />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-white font-bold text-lg">{countdown}</span>
                </div>

                <div className="flex items-center gap-3 mt-2">
                  <button
                    onClick={() => { cancelAutoplay(); router.push(`/learn/${course.slug}/${nextLessonId}`) }}
                    className="px-5 py-2 bg-primary text-white rounded-full text-sm font-medium hover:bg-primary/90 transition-colors"
                  >
                    Play now
                  </button>
                  <button
                    onClick={cancelAutoplay}
                    className="px-5 py-2 border border-white/30 text-white rounded-full text-sm font-medium hover:bg-white/10 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Autoplay toggle */}
          <div className="flex items-center justify-end gap-2 mt-2">
            <span className="text-xs text-muted-foreground">Autoplay</span>
            <button
              onClick={() => setAutoplay(p => !p)}
              className={`relative w-9 h-5 rounded-full transition-colors ${autoplay ? "bg-primary" : "bg-muted-foreground/30"}`}
            >
              <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${autoplay ? "translate-x-4" : "translate-x-0"}`} />
            </button>
          </div>
        </>
      )}

      {/* Lesson Info */}
      <div className="mt-6">
        <h1 className="text-2xl font-bold">{currentLesson.title}</h1>
        {currentLesson.description && (
          <div
            className="mt-4 prose prose-base max-w-none
              prose-headings:font-bold prose-headings:text-foreground prose-headings:mt-6 prose-headings:mb-3
              prose-h2:text-2xl prose-h3:text-xl prose-h4:text-lg
              prose-p:text-foreground prose-p:leading-relaxed prose-p:mb-4
              prose-li:text-foreground prose-li:leading-relaxed
              prose-ul:list-disc prose-ul:pl-6 prose-ul:my-3
              prose-ol:list-decimal prose-ol:pl-6 prose-ol:my-3
              prose-a:text-primary prose-a:underline
              prose-strong:font-semibold prose-strong:text-foreground"
            dangerouslySetInnerHTML={{ __html: currentLesson.description }}
          />
        )}
      </div>

      {/* Actions */}
      <div className="mt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-8 border-b">
        <Button
          variant={isCompleted ? "outline" : "default"}
          onClick={() => toggleComplete()}
          disabled={isPending}
          className="gap-2"
        >
          {isCompleted ? (
            <><CheckCircle className="h-4 w-4" /> Completed</>
          ) : (
            <><Circle className="h-4 w-4" /> Mark as Complete</>
          )}
        </Button>

        <div className="flex items-center gap-2">
          {prevLessonId && (
            <Link href={`/learn/${course.slug}/${prevLessonId}`}>
              <Button variant="outline" size="sm" className="gap-1">
                <ChevronLeft className="h-4 w-4" /> Previous
              </Button>
            </Link>
          )}
          {nextLessonId && (
            <Button onClick={handleMarkCompleteAndNext} size="sm" className="gap-1">
              {nextIsQuiz ? "Take Quiz" : "Next"} <ChevronRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
