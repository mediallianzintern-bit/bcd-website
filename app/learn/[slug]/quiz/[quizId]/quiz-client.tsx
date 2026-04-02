"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { CheckCircle, XCircle, ChevronRight, Timer } from "lucide-react"
import type { QuizQuestion } from "@/lib/types"

interface QuizClientProps {
  courseSlug: string
  courseTitle: string
  quizId: number
  quizTitle: string
  passingPercentage: number
  questions: QuizQuestion[]
  userName: string
}

type Phase = "taking" | "submitting" | "results"

interface QuizResults {
  score: number
  passed: boolean
  passingScore: number
  totalQuestions: number
  correctAnswers: number
  results: Record<string, { correct: boolean; correctIndex: number }>
}

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  if (h > 0) return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
}

async function downloadCertificatePDF(name: string, courseTitle: string, completedAt: string) {
  const res = await fetch("/api/certificate/pdf", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, courseTitle, completedAt }),
  })
  if (!res.ok) throw new Error("Failed to generate certificate")
  const blob = await res.blob()
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `${name.replace(/[^a-z0-9_\-]/gi, "_")}-Certificate-Basecamp-Digital.pdf`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export function QuizClient({
  courseSlug,
  courseTitle,
  quizId,
  quizTitle,
  passingPercentage,
  questions,
  userName,
}: QuizClientProps) {
  const router = useRouter()
  const [currentQ, setCurrentQ] = useState(0)
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [phase, setPhase] = useState<Phase>("taking")
  const [results, setResults] = useState<QuizResults | null>(null)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [finalTime, setFinalTime] = useState(0)
  const [showReview, setShowReview] = useState(false)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const completedAt = useRef(new Date().toISOString())

  // Start timer when quiz begins
  useEffect(() => {
    timerRef.current = setInterval(() => setElapsedSeconds((s) => s + 1), 1000)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [])

  const q = questions[currentQ]
  const isLast = currentQ === questions.length - 1
  const chosen = answers[q?.id]
  const hasAnswered = chosen !== undefined

  const handleSelect = (answerIndex: number) => {
    if (phase !== "taking") return
    setAnswers((prev) => ({ ...prev, [q.id]: answerIndex }))
  }

  const handleNext = () => {
    if (!isLast) setCurrentQ((i) => i + 1)
  }

  const handleFinish = async () => {
    if (!hasAnswered) return
    if (timerRef.current) clearInterval(timerRef.current)
    setFinalTime(elapsedSeconds)
    completedAt.current = new Date().toISOString()
    setPhase("submitting")
    try {
      let res = await fetch("/api/quiz/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quizId, answers, courseTitle }),
      })
      // Access token may have expired during the quiz — refresh and retry once
      if (res.status === 401) {
        const refreshed = await fetch("/api/auth/refresh", { method: "POST" })
        if (!refreshed.ok) {
          window.location.href = `/auth/login?next=/learn/${courseSlug}/quiz/${quizId}`
          return
        }
        res = await fetch("/api/quiz/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ quizId, answers, courseTitle }),
        })
      }
      if (!res.ok) throw new Error("Submit failed")
      const data: QuizResults = await res.json()
      setResults(data)
      setPhase("results")
    } catch {
      timerRef.current = setInterval(() => setElapsedSeconds((s) => s + 1), 1000)
      setPhase("taking")
      alert("Something went wrong. Please try again.")
    }
  }

  const handleRetry = () => {
    setAnswers({})
    setResults(null)
    setCurrentQ(0)
    setElapsedSeconds(0)
    setFinalTime(0)
    setShowReview(false)
    setPhase("taking")
    timerRef.current = setInterval(() => setElapsedSeconds((s) => s + 1), 1000)
  }

  const handlePrintCertificate = () => {
    downloadCertificatePDF(userName, courseTitle, completedAt.current).catch(() => {
      alert("Could not generate certificate. Please try again.")
    })
  }

  // ── Results ──────────────────────────────────────────────────────────────────
  if (phase === "results" && results) {
    return (
      <div className="max-w-2xl mx-auto p-6 md:p-8">
        <h1 className="text-2xl font-bold mb-1">Results</h1>
        <p className="text-base text-foreground mb-1">
          {results.correctAnswers} of {results.totalQuestions} Questions answered correctly
        </p>
        <p className="text-sm text-muted-foreground mb-6">Your time: {formatTime(finalTime)}</p>

        {/* Score banner */}
        <div className="rounded-lg bg-muted px-6 py-5 text-center mb-5">
          <p className="font-semibold text-base">
            You have reached {results.correctAnswers} of {results.totalQuestions} point(s), ({results.score}%)
          </p>
        </div>

        {/* Certificate button */}
        {results.passed ? (
          <div className="flex justify-center mb-6">
            <button
              onClick={handlePrintCertificate}
              className="px-8 py-3 bg-[#2d6a4f] text-white text-sm font-semibold rounded-full hover:bg-[#245a41] transition-colors uppercase tracking-widest"
            >
              Print Your Certificate
            </button>
          </div>
        ) : (
          <p className="text-center text-sm text-destructive mb-6">
            You need {results.passingScore}% to pass. Keep learning and try again!
          </p>
        )}

        <hr className="mb-6" />

        {/* Action row */}
        <div className="flex items-center justify-center gap-3 mb-8 flex-wrap">
          <button
            onClick={() => setShowReview((r) => !r)}
            className="px-5 py-2.5 bg-[#3a3a3a] text-white text-sm font-medium rounded-full hover:bg-[#555] transition-colors"
          >
            {showReview ? "Hide Questions" : "View Questions"}
          </button>
          <button
            onClick={handleRetry}
            className="px-5 py-2.5 bg-[#3a3a3a] text-white text-sm font-medium rounded-full hover:bg-[#555] transition-colors"
          >
            Restart Quiz
          </button>
          <button
            onClick={() => router.push(`/learn/${courseSlug}`)}
            className="px-5 py-2.5 bg-[#2d6a4f] text-white text-sm font-medium rounded-full hover:bg-[#245a41] transition-colors"
          >
            Continue
          </button>
        </div>

        {/* Per-question review */}
        {showReview && (
          <div className="space-y-4">
            {questions.map((ques, idx) => {
              const qResult = results.results?.[String(ques.id)]
              const chosenIdx = answers[ques.id]
              return (
                <div key={ques.id} className={`border rounded-lg p-4 ${qResult?.correct ? "border-green-500/30" : "border-red-500/30"}`}>
                  <div className="flex gap-3">
                    {qResult?.correct ? (
                      <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <p className="font-medium text-sm mb-3">{idx + 1}. {ques.title}</p>
                      <div className="space-y-1.5">
                        {ques.answers.map((a) => {
                          const isChosen = chosenIdx === a.index
                          const isCorrect = qResult?.correctIndex === a.index
                          return (
                            <div
                              key={a.index}
                              className={`text-sm px-3 py-1.5 rounded-md ${
                                isCorrect
                                  ? "bg-green-500/15 text-green-700 dark:text-green-400 font-medium"
                                  : isChosen && !isCorrect
                                  ? "bg-red-500/15 text-red-700 dark:text-red-400 line-through"
                                  : "text-muted-foreground"
                              }`}
                            >
                              {a.answer}{isCorrect && " ✓"}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    )
  }

  // ── Taking quiz ──────────────────────────────────────────────────────────────
  return (
    <div className="max-w-2xl mx-auto p-6 md:p-8">
      {/* Breadcrumb + timer */}
      <div className="flex items-center justify-between mb-3 text-xs text-muted-foreground">
        <span className="truncate max-w-[260px]">
          {courseTitle} &rsaquo; {quizTitle}
        </span>
        <span className="flex items-center gap-1 font-mono shrink-0 ml-4">
          <Timer className="h-3.5 w-3.5" />
          {formatTime(elapsedSeconds)}
        </span>
      </div>

      {/* Thin progress bar */}
      <div className="w-full h-1 bg-muted rounded-full overflow-hidden mb-6">
        <div
          className="h-full bg-primary rounded-full transition-all"
          style={{ width: `${((currentQ + (hasAnswered ? 1 : 0)) / questions.length) * 100}%` }}
        />
      </div>

      {/* Quiz title */}
      <h1 className="text-xl font-bold mb-6">{quizTitle}</h1>

      {/* Single question */}
      <p className="text-base font-medium mb-5">{q.title}</p>
      <div className="space-y-3">
        {q.answers.map((a) => {
          const isSelected = chosen === a.index
          return (
            <button
              key={a.index}
              onClick={() => handleSelect(a.index)}
              className={`w-full text-left px-5 py-4 rounded-lg border text-sm transition-all ${
                isSelected
                  ? "border-primary bg-primary/5 font-medium ring-2 ring-primary/20"
                  : "border-border hover:border-primary/40 hover:bg-accent/30"
              }`}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors ${
                    isSelected ? "border-primary" : "border-muted-foreground/40"
                  }`}
                >
                  {isSelected && <span className="w-2 h-2 rounded-full bg-primary block" />}
                </span>
                {a.answer}
              </div>
            </button>
          )
        })}
      </div>

      {/* Next / Finish */}
      <div className="flex justify-end mt-8">
        {isLast ? (
          <button
            onClick={handleFinish}
            disabled={!hasAnswered || phase === "submitting"}
            className="px-7 py-3 bg-[#2d6a4f] text-white text-sm font-semibold rounded-full hover:bg-[#245a41] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {phase === "submitting" ? "Submitting..." : "Finish Quiz"}
          </button>
        ) : (
          <button
            onClick={handleNext}
            disabled={!hasAnswered}
            className="flex items-center gap-2 px-7 py-3 bg-[#2d6a4f] text-white text-sm font-semibold rounded-full hover:bg-[#245a41] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Next <ChevronRight className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  )
}
