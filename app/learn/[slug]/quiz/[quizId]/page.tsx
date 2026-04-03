import { notFound, redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import {
  getLDCourseBySlug,
  getLDQuizById,
  getLDQuizQuestions,
  isLDUserEnrolled,
  decodeHtml,
} from "@/lib/learndash"
import type { Metadata } from "next"
import { QuizClient } from "./quiz-client"

interface QuizPageProps {
  params: Promise<{ slug: string; quizId: string }>
}

export async function generateMetadata({ params }: QuizPageProps): Promise<Metadata> {
  const { quizId } = await params
  const quiz = await getLDQuizById(Number(quizId))
  return {
    title: quiz ? `${decodeHtml(quiz.title.rendered)} - Basecamp Digital` : "Quiz - Basecamp Digital",
  }
}

export default async function QuizPage({ params }: QuizPageProps) {
  const { slug, quizId } = await params
  const user = await getCurrentUser()
  if (!user) redirect("/auth/login")

  const ldCourse = await getLDCourseBySlug(slug)
  if (!ldCourse) notFound()

  // Must be enrolled — admins always have access
  const enrolled = user.isAdmin || (user.wpUserId
    ? await isLDUserEnrolled(ldCourse.id, user.wpUserId)
    : false)
  if (!enrolled) redirect(`/courses/${slug}`)

  const [quiz, questions] = await Promise.all([
    getLDQuizById(Number(quizId)),
    getLDQuizQuestions(Number(quizId)),
  ])

  if (!quiz) notFound()

  // Strip correct answers before sending to client
  const safeQuestions = questions.map((q) => ({
    id: q.id,
    title: q.title.rendered,
    question_type: q.question_type,
    points_total: q.points_total,
    answers: q.answers.map((a, idx) => ({
      index: idx,
      answer: a._answer,
    })),
  }))

  const courseTitle = decodeHtml(ldCourse.title.rendered)

  return (
    <QuizClient
      courseSlug={slug}
      courseTitle={courseTitle}
      quizId={quiz.id}
      quizTitle={decodeHtml(quiz.title.rendered)}
      passingPercentage={quiz.passing_percentage}
      questions={safeQuestions}
      userName={user.name || user.email}
    />
  )
}
