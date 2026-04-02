export interface Course {
  id: string
  title: string
  slug: string
  description: string | null
  short_description: string | null
  thumbnail_url: string | null
  instructor_name: string | null
  instructor_title: string | null
  instructor_avatar: string | null
  price: number
  original_price: number | null
  is_published: boolean
  total_duration_minutes: number
  total_lessons: number
  brochure_url: string | null
  created_at: string
  updated_at: string
  /** "local" = MySQL/Prisma (crash/free courses), "learndash" = WordPress LMS (premium courses) */
  source?: "local" | "learndash"
  /** WordPress post ID — only set for LearnDash courses */
  wp_id?: number
}

export interface Section {
  id: string
  course_id: string
  title: string
  description: string | null
  order_index: number
  created_at: string
  lessons?: Lesson[]
}

export interface Lesson {
  id: string
  section_id: string
  title: string
  description: string | null
  vimeo_video_id: string | null
  youtube_video_id: string | null
  duration_minutes: number
  order_index: number
  is_preview: boolean
  sub_lessons?: Lesson[]
  created_at: string
}

export interface Enrollment {
  id: string
  user_id: string
  course_id: string
  enrolled_at: string
}

export interface LessonProgress {
  id: string
  user_id: string
  lesson_id: string
  completed: boolean
  completed_at: string | null
}

export interface Profile {
  id: string
  full_name: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export interface CourseWithSections extends Course {
  sections: Section[]
}

export interface Quiz {
  id: number
  title: string
  course_id: number
  passing_percentage: number
}

export interface QuizQuestion {
  id: number
  title: string
  question_type: string
  points_total: number
  /** Answers with correct flag stripped — sent to client */
  answers: QuizAnswer[]
}

export interface QuizAnswer {
  index: number
  answer: string
}

export interface CourseProgress {
  steps_total: number
  steps_completed: number
  progress_status: "not_started" | "in_progress" | "completed"
  last_step_id?: number
}
