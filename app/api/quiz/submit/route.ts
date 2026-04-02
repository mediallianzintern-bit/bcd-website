import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { getLDQuizById, getLDQuizQuestions } from "@/lib/learndash"

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { quizId, answers, courseTitle } = await request.json()
    // answers: { [questionId: string]: number } — index of chosen answer

    if (!quizId || !answers) {
      return NextResponse.json({ error: "Missing quizId or answers" }, { status: 400 })
    }

    // Fetch quiz metadata + questions SERVER-SIDE only (never expose correct answers to client)
    const [quiz, questions] = await Promise.all([
      getLDQuizById(Number(quizId)),
      getLDQuizQuestions(Number(quizId)),
    ])

    if (!quiz || !questions.length) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 })
    }

    // Grade each question
    let totalPoints = 0
    let earnedPoints = 0
    let correctCount = 0
    const results: Record<number, { correct: boolean; correctIndex: number }> = {}

    for (const question of questions) {
      const correctIndex = question.answers.findIndex((a) => a._correct)
      const chosenIndex = answers[String(question.id)]
      const isCorrect = chosenIndex !== undefined && chosenIndex === correctIndex

      totalPoints += question.points_total
      if (isCorrect) {
        earnedPoints += question.points_total
        correctCount++
      }

      results[question.id] = { correct: isCorrect, correctIndex }
    }

    const scorePercent = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0
    const passed = scorePercent >= (quiz.passing_percentage || 80)

    // Send pass or fail email (non-fatal)
    try {
      await fetch(`${process.env.AUTH_URL || "http://localhost:3000"}/api/certificate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: user.name || user.email,
          email: user.email,
          courseTitle: courseTitle || quiz.title.rendered,
          completedAt: new Date().toISOString(),
          type: passed ? "pass" : "fail",
        }),
      })
    } catch {
      // Non-fatal — don't block quiz result
    }

    return NextResponse.json({
      score: scorePercent,
      passed,
      passingScore: quiz.passing_percentage || 80,
      totalQuestions: questions.length,
      correctAnswers: correctCount,
      results,
    })
  } catch (e) {
    console.error("Quiz submit error:", e)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}
