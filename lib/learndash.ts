/**
 * LearnDash / WordPress REST API client
 * Used for premium/paid courses only.
 * Crash/free courses remain in MySQL (Prisma).
 */

import type { Course, Section, Lesson } from "@/lib/types"
import fs from "fs"
import path from "path"

const WP_BASE = process.env.NEXT_PUBLIC_WP_BASE_URL || "https://basecampdigital.co"
const WP_API = `${WP_BASE}/wp-json`
const LD_API = `${WP_API}/ldlms/v2`

function getAuthHeader() {
  const user = process.env.WP_APP_USER || "Administrator"
  const pass = process.env.WP_APP_PASSWORD || ""
  return "Basic " + Buffer.from(`${user}:${pass}`).toString("base64")
}

// ─── Persistent disk + in-memory cache ───────────────────────────────────────
// In-memory for speed; disk for survival across server restarts.
// Stale entries are kept so WP downtime falls back to last-known-good data.
interface CacheEntry { data: unknown; expiresAt: number }
declare global { var __ldMemCache: Map<string, CacheEntry> | undefined }

const DISK_CACHE_FILE = path.join(process.cwd(), ".next", "cache", "ld-persistent.json")

function diskLoad(): Map<string, CacheEntry> {
  try {
    const raw = fs.readFileSync(DISK_CACHE_FILE, "utf-8")
    return new Map(JSON.parse(raw) as [string, CacheEntry][])
  } catch {
    return new Map()
  }
}

function diskSave(cache: Map<string, CacheEntry>) {
  try {
    fs.mkdirSync(path.dirname(DISK_CACHE_FILE), { recursive: true })
    fs.writeFileSync(DISK_CACHE_FILE, JSON.stringify([...cache.entries()]))
  } catch {}
}

const memCache: Map<string, CacheEntry> =
  globalThis.__ldMemCache ?? (globalThis.__ldMemCache = diskLoad())

function cacheGet<T>(key: string): T | null {
  const entry = memCache.get(key)
  if (!entry || Date.now() > entry.expiresAt) return null
  return entry.data as T
}

function cacheGetStale<T>(key: string): T | null {
  return (memCache.get(key)?.data as T) ?? null
}

function cacheSet(key: string, data: unknown, ttlMs: number) {
  memCache.set(key, { data, expiresAt: Date.now() + ttlMs })
  diskSave(memCache)
}
// ─────────────────────────────────────────────────────────────────────────────

const WP_FETCH_TIMEOUT_MS = 15_000 // 15 s — fail fast, stale cache handles the rest

async function ldFetch<T>(
  url: string,
  options: { revalidate?: number; noCache?: boolean } = {}
): Promise<T> {
  const ttlMs = (options.revalidate ?? 3600) * 1000 // default 1 hour

  // Serve from in-memory cache when allowed
  if (!options.noCache) {
    const hit = cacheGet<T>(url)
    if (hit !== null) return hit
  }

  // Use AbortController so we control the timeout (overrides Node's 10 s default)
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), WP_FETCH_TIMEOUT_MS)

  try {
    const res = await fetch(url, {
      headers: {
        Authorization: getAuthHeader(),
        "Content-Type": "application/json",
      },
      cache: "no-store",
      signal: controller.signal,
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(`LearnDash API error ${res.status}: ${JSON.stringify(err)}`)
    }

    const data: T = await res.json()
    if (!options.noCache) cacheSet(url, data, ttlMs)
    return data
  } catch (err) {
    // On network/timeout error, fall back to stale cached data rather than crashing
    if (!options.noCache) {
      const stale = cacheGetStale<T>(url)
      if (stale !== null) {
        console.warn(`[LearnDash] WP unreachable — serving stale cache for ${url}`)
        return stale
      }
    }
    throw err
  } finally {
    clearTimeout(timer)
  }
}

// ─── Types ──────────────────────────────────────────────────────────────────

export interface LDCourse {
  id: number
  title: { rendered: string }
  slug: string
  content: { rendered: string }
  excerpt: { rendered: string }
  featured_media: number
  status: string
  link: string
  _embedded?: {
    "wp:featuredmedia"?: Array<{ source_url: string }>
  }
}

export interface LDLesson {
  id: number
  title: { rendered: string }
  content: { rendered: string }
  slug: string
  menu_order: number
  video_url: string | null
  video_enabled: boolean
  course: number
  /** Parent lesson ID — only set on topics (sfwd-topic) */
  lesson?: number
}

export interface LDQuiz {
  id: number
  title: { rendered: string }
  course: number
  lesson: number
  passing_percentage: number
  certificate: number
}

export interface LDQuestion {
  id: number
  title: { rendered: string }
  question_type: string
  points_total: number
  answers: Array<{
    _answer: string
    _correct: boolean
    _points: number
  }>
}

export interface LDCourseSteps {
  h: {
    "sfwd-lessons"?: Record<string, { "sfwd-topic": number[]; "sfwd-quiz": number[] }>
    "sfwd-quiz"?: Record<string, unknown[]>
  }
  t: {
    "sfwd-lessons": number[]
    "sfwd-topic": number[]
    "sfwd-quiz": number[]
  }
  l: string[]
  sections: Array<{ id: number; title: string; order: number; steps: string[] }>
}

export interface LDUserProgress {
  course: number
  last_step: number
  steps_total: number
  steps_completed: number
  date_started: string
  date_completed: string
  progress_status: "not_started" | "in_progress" | "completed"
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

export function extractVimeoId(url: string | null): string | null {
  if (!url) return null
  const match = url.match(/(?:player\.vimeo\.com\/video\/|vimeo\.com\/)(\d+)/)
  return match ? match[1] : null
}

/**
 * Scan lesson HTML content for an embedded Vimeo player iframe.
 * Used as fallback when the lesson's video_url field is not set.
 */
export function extractVimeoIdFromContent(html: string | null): string | null {
  if (!html) return null
  const match = html.match(/(?:player\.vimeo\.com\/video\/|vimeo\.com\/)(\d+)/)
  return match ? match[1] : null
}

/** Extract YouTube video ID from a URL (watch, youtu.be, or embed) */
export function extractYouTubeId(url: string | null): string | null {
  if (!url) return null
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  )
  return match ? match[1] : null
}

/** Scan lesson HTML content for an embedded YouTube iframe */
export function extractYouTubeIdFromContent(html: string | null): string | null {
  if (!html) return null
  const match = html.match(
    /(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  )
  return match ? match[1] : null
}

/**
 * Strip Vimeo iframe embeds from HTML (used when the video is shown
 * in the dedicated player instead of inline in the description).
 */
function stripVimeoIframes(html: string): string {
  return html.replace(/<iframe[^>]*(?:vimeo\.com)[^>]*>[\s\S]*?<\/iframe>/gi, "")
}

function stripYouTubeIframes(html: string): string {
  return html.replace(/<iframe[^>]*(?:youtube\.com|youtu\.be)[^>]*>[\s\S]*?<\/iframe>/gi, "")
}

export function decodeHtml(str: string): string {
  return str
    // Decimal numeric entities like &#8211; &#038; etc.
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(parseInt(code, 10)))
    // Hex numeric entities like &#x2013;
    .replace(/&#x([0-9a-fA-F]+);/g, (_, code) => String.fromCharCode(parseInt(code, 16)))
    // Named entities
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
}

/**
 * Extract the rendered HTML from inside Themify Builder comment blocks.
 * The WP REST API includes the rendered lesson content *inside* those blocks,
 * so we pull it out rather than discard it.
 * Falls back to the raw html if no Themify blocks are present.
 */
function cleanLDContent(html: string): string {
  const themifyMatch = html.match(/<!--themify_builder_content-->([\s\S]*?)<!--\/themify_builder_content-->/)
  if (themifyMatch && themifyMatch[1].trim()) {
    return themifyMatch[1].trim()
  }
  return html.trim()
}

/** Strip all HTML tags for plain-text usage (hero subtitle, meta description). */
function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim()
}

// ─── Courses ─────────────────────────────────────────────────────────────────

export async function getLDCourses(): Promise<LDCourse[]> {
  return ldFetch<LDCourse[]>(
    `${LD_API}/sfwd-courses?per_page=100&_embed&status=publish`,
    { revalidate: 3600 }
  )
}

/**
 * Fetch featured image URLs for a list of WordPress media IDs.
 * Returns a Map<mediaId, sourceUrl> for all successfully fetched media.
 * Falls back gracefully — missing IDs are simply absent from the map.
 */
export async function getLDMediaUrls(mediaIds: number[]): Promise<Map<number, string>> {
  const ids = mediaIds.filter((id) => id > 0)
  if (ids.length === 0) return new Map()
  try {
    const items = await ldFetch<Array<{ id: number; source_url: string }>>(
      `${WP_API}/wp/v2/media?include=${ids.join(",")}&per_page=${ids.length}&_fields=id,source_url`,
      { revalidate: 3600 }
    )
    return new Map(items.map((m) => [m.id, m.source_url]))
  } catch {
    return new Map()
  }
}

export async function getLDCourseBySlug(slug: string): Promise<LDCourse | null> {
  const courses = await ldFetch<LDCourse[]>(
    `${LD_API}/sfwd-courses?slug=${encodeURIComponent(slug)}&_embed`,
    { revalidate: 3600 }
  )
  return courses[0] ?? null
}

export async function getLDCourseById(id: number): Promise<LDCourse | null> {
  try {
    return await ldFetch<LDCourse>(`${LD_API}/sfwd-courses/${id}?_embed`, { revalidate: 3600 })
  } catch {
    return null
  }
}

// ─── Course Steps / Curriculum ───────────────────────────────────────────────

export async function getLDCourseSteps(courseId: number): Promise<LDCourseSteps> {
  return ldFetch<LDCourseSteps>(
    `${LD_API}/sfwd-courses/${courseId}/steps`,
    { revalidate: 3600 }
  )
}

// ─── Lessons ─────────────────────────────────────────────────────────────────

/**
 * Lightweight lesson-count fetch — only retrieves id + course fields.
 * Used on the course listing page to show lesson counts without fetching
 * full lesson content (each full page was 2-3 MB, blocking Next.js cache).
 */
export async function getLDLessonCounts(): Promise<Array<{ id: number; course: number }>> {
  const FIELDS = "_fields=id,course"
  const cacheKey = `ld-lesson-counts`
  const hit = cacheGet<Array<{ id: number; course: number }>>(cacheKey)
  if (hit) return hit

  // Fetch page 1 to discover total pages
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), WP_FETCH_TIMEOUT_MS)
  let firstPage: Array<{ id: number; course: number }>
  let totalPages: number
  try {
    const firstRes = await fetch(
      `${LD_API}/sfwd-lessons?per_page=100&page=1&${FIELDS}`,
      { headers: { Authorization: getAuthHeader(), "Content-Type": "application/json" }, cache: "no-store", signal: controller.signal }
    )
    if (!firstRes.ok) throw new Error(`LearnDash API error ${firstRes.status}`)
    firstPage = await firstRes.json()
    totalPages = parseInt(firstRes.headers.get("X-WP-TotalPages") || "1", 10)
  } catch {
    const stale = cacheGetStale<Array<{ id: number; course: number }>>(cacheKey)
    if (stale) {
      console.warn(`[LearnDash] WP unreachable — serving stale lesson counts`)
      return stale
    }
    return []
  } finally {
    clearTimeout(timer)
  }

  let all = firstPage
  if (totalPages > 1) {
    const rest = await Promise.all(
      Array.from({ length: totalPages - 1 }, (_, i) =>
        ldFetch<Array<{ id: number; course: number }>>(
          `${LD_API}/sfwd-lessons?per_page=100&page=${i + 2}&${FIELDS}`,
          { revalidate: 3600 }
        )
      )
    )
    all = [...firstPage, ...rest.flat()]
  }

  cacheSet(cacheKey, all, 300_000)
  return all
}

export async function getLDLessonsForCourse(courseId: number): Promise<LDLesson[]> {
  return ldFetch<LDLesson[]>(
    `${LD_API}/sfwd-lessons?course=${courseId}&per_page=100&orderby=menu_order&order=asc`,
    { revalidate: 3600 }
  )
}

export async function getLDLessonById(lessonId: number): Promise<LDLesson | null> {
  try {
    return await ldFetch<LDLesson>(`${LD_API}/sfwd-lessons/${lessonId}`, { revalidate: 3600 })
  } catch {
    return null
  }
}

// ─── Quizzes ─────────────────────────────────────────────────────────────────

export async function getLDQuizzesForCourse(courseId: number): Promise<LDQuiz[]> {
  return ldFetch<LDQuiz[]>(
    `${LD_API}/sfwd-quiz?course=${courseId}&per_page=100`,
    { revalidate: 3600 }
  )
}

export async function getLDQuizById(quizId: number): Promise<LDQuiz | null> {
  try {
    return await ldFetch<LDQuiz>(`${LD_API}/sfwd-quiz/${quizId}`, { revalidate: 3600 })
  } catch {
    return null
  }
}

/**
 * Fetch only the quizzes that belong to a specific course by reading their IDs
 * from the course steps response. This is more reliable than the ?course= filter
 * on the quiz endpoint, which LearnDash sometimes ignores.
 */
export async function getLDQuizzesFromSteps(steps: LDCourseSteps): Promise<LDQuiz[]> {
  const quizIds = steps.t["sfwd-quiz"] ?? []
  if (quizIds.length === 0) return []
  const results = await Promise.allSettled(quizIds.map((id) => getLDQuizById(id)))
  return results
    .filter((r): r is PromiseFulfilledResult<LDQuiz> => r.status === "fulfilled" && r.value !== null)
    .map((r) => r.value)
}

export async function getLDQuizQuestions(quizId: number): Promise<LDQuestion[]> {
  return ldFetch<LDQuestion[]>(
    `${LD_API}/sfwd-question?quiz=${quizId}&per_page=100`,
    { revalidate: 3600 }
  )
}

// ─── Enrollment ──────────────────────────────────────────────────────────────

export async function isLDUserEnrolled(courseId: number, wpUserId: number): Promise<boolean> {
  try {
    const users = await ldFetch<Array<{ id: number }>>(
      `${LD_API}/sfwd-courses/${courseId}/users?per_page=100`,
      { noCache: true }
    )
    return users.some((u) => u.id === wpUserId)
  } catch {
    return false
  }
}

export async function enrollLDUser(courseId: number, wpUserId: number): Promise<void> {
  const res = await fetch(`${WP_API}/ldlms/v2/sfwd-courses/${courseId}/users`, {
    method: "POST",
    headers: {
      Authorization: getAuthHeader(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ user_ids: [wpUserId] }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(`Enroll failed: ${JSON.stringify(err)}`)
  }
}

// ─── Progress ─────────────────────────────────────────────────────────────────

export async function getLDUserProgress(
  wpUserId: number,
  courseId: number
): Promise<LDUserProgress | null> {
  try {
    return await ldFetch<LDUserProgress>(
      `${LD_API}/users/${wpUserId}/course-progress/${courseId}`,
      { noCache: true }
    )
  } catch {
    return null
  }
}

export async function getLDAllUserEnrolledCourses(wpUserId: number): Promise<number[]> {
  try {
    // Get all courses and check enrollment — LearnDash doesn't have a direct "my courses" endpoint
    // So we filter courses where user is enrolled via progress endpoint
    const progress = await ldFetch<LDUserProgress[]>(
      `${LD_API}/users/${wpUserId}/course-progress`,
      { noCache: true }
    )
    return progress.map((p) => p.course)
  } catch {
    return []
  }
}

// ─── WordPress Users ──────────────────────────────────────────────────────────

export async function createWPUser(
  email: string,
  password: string,
  name: string
): Promise<{ id: number } | null> {
  try {
    // Use email prefix as username, ensure uniqueness with timestamp
    const username = email.split("@")[0].replace(/[^a-zA-Z0-9_]/g, "") + "_" + Date.now()
    const res = await fetch(`${WP_API}/wp/v2/users`, {
      method: "POST",
      headers: {
        Authorization: getAuthHeader(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username,
        email,
        password,
        name,
        roles: ["subscriber"],
      }),
    })
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      console.error("WP user creation failed:", err)
      return null
    }
    const user = await res.json()
    return { id: user.id }
  } catch (e) {
    console.error("WP user creation error:", e)
    return null
  }
}

export async function findWPUserByEmail(email: string): Promise<{ id: number } | null> {
  try {
    // context=edit is required for WP to include the email field in the response
    const users = await ldFetch<Array<{ id: number; email: string }>>(
      `${WP_API}/wp/v2/users?search=${encodeURIComponent(email)}&per_page=5&context=edit`,
      { noCache: true }
    )
    const match = users.find((u) => u.email?.toLowerCase() === email.toLowerCase())
    return match ? { id: match.id } : null
  } catch {
    return null
  }
}

// ─── Data Mappers ─────────────────────────────────────────────────────────────

/** Map LearnDash course to the shared Course type used by UI components */
export function mapLDCourse(c: LDCourse, featuredImageUrl?: string): Course {
  return {
    id: String(c.id),
    title: decodeHtml(c.title.rendered),
    slug: c.slug,
    description: cleanLDContent(c.content.rendered || "") || null,
    short_description: c.excerpt?.rendered ? stripHtml(c.excerpt.rendered) : null,
    thumbnail_url:
      featuredImageUrl ||
      c._embedded?.["wp:featuredmedia"]?.[0]?.source_url ||
      null,
    instructor_name: "Basecamp Digital",
    instructor_title: null,
    instructor_avatar: null,
    price: 0, // Price set via WP custom field or config — overridden by course-prices.ts
    original_price: null,
    is_published: c.status === "publish",
    total_duration_minutes: 0,
    total_lessons: 0,
    brochure_url: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    source: "learndash" as const,
  } as Course & { source: "learndash" }
}

/** Map LearnDash lesson to the shared Lesson type */
export function mapLDLesson(
  l: LDLesson,
  sectionId: string,
  orderIndex: number,
  durationSeconds = 0
): Lesson {
  // Vimeo takes priority; fall back to YouTube; scan content HTML as last resort
  const vimeoId =
    extractVimeoId(l.video_url) ?? extractVimeoIdFromContent(l.content.rendered)
  const youtubeId = vimeoId
    ? null
    : extractYouTubeId(l.video_url) ?? extractYouTubeIdFromContent(l.content.rendered)

  // Clean lesson description and strip whichever video type is being shown in the player
  let description = cleanLDContent(l.content.rendered || "")
  if (vimeoId) description = stripVimeoIframes(description)
  if (youtubeId) description = stripYouTubeIframes(description)
  description = description.trim()

  return {
    id: String(l.id),
    section_id: sectionId,
    title: decodeHtml(l.title.rendered),
    description: description || null,
    vimeo_video_id: vimeoId,
    youtube_video_id: youtubeId,
    duration_minutes: Math.round(durationSeconds / 60),
    order_index: orderIndex,
    is_preview: false,
    created_at: new Date().toISOString(),
  }
}

/**
 * Fetch video durations for all lessons that have a Vimeo URL.
 * Uses Vimeo's public oEmbed API — no auth required.
 * Returns a Map<lessonId, durationInSeconds>.
 */
export async function getVimeoDurationsForLessons(
  lessons: LDLesson[]
): Promise<Map<number, number>> {
  const withVideo = lessons.filter((l) => l.video_url && extractVimeoId(l.video_url))
  if (withVideo.length === 0) return new Map()

  // Cache the entire map keyed by lesson IDs — avoids hitting Vimeo on every render
  const cacheKey = `vimeo-durations:${withVideo.map((l) => l.id).join(",")}`
  const cached = cacheGet<[number, number][]>(cacheKey)
  if (cached) return new Map(cached)

  const VIMEO_TIMEOUT_MS = 3000
  const results = await Promise.allSettled(
    withVideo.map(async (l) => {
      const vid = extractVimeoId(l.video_url!)!
      const controller = new AbortController()
      const timer = setTimeout(() => controller.abort(), VIMEO_TIMEOUT_MS)
      try {
        const res = await fetch(
          `https://vimeo.com/api/oembed.json?url=https://vimeo.com/${vid}`,
          { cache: "no-store", signal: controller.signal }
        )
        if (!res.ok) return { id: l.id, seconds: 0 }
        const data = await res.json()
        return { id: l.id, seconds: (data.duration as number) || 0 }
      } finally {
        clearTimeout(timer)
      }
    })
  )

  const map = new Map<number, number>()
  for (const r of results) {
    if (r.status === "fulfilled") map.set(r.value.id, r.value.seconds)
  }
  // Cache for 24 hours — video durations rarely change
  cacheSet(cacheKey, Array.from(map.entries()), 24 * 60 * 60 * 1000)
  return map
}

/** Fetch all topics for a course */
export async function getLDTopicsForCourse(courseId: number): Promise<LDLesson[]> {
  try {
    return await ldFetch<LDLesson[]>(
      `${LD_API}/sfwd-topic?course=${courseId}&per_page=100&orderby=menu_order&order=asc`,
      { revalidate: 300 }
    )
  } catch {
    return []
  }
}

/** Fetch a single topic by ID */
export async function getLDTopicById(topicId: number): Promise<LDLesson | null> {
  try {
    return await ldFetch<LDLesson>(`${LD_API}/sfwd-topic/${topicId}`)
  } catch {
    return null
  }
}

/** Build a flat section structure from LearnDash course steps */
export function buildLDSections(
  courseId: string,
  steps: LDCourseSteps,
  lessons: LDLesson[],
  durationMap: Map<number, number> = new Map(),
  topics: LDLesson[] = []
): Section[] {
  const lessonMap = new Map(lessons.map((l) => [l.id, l]))

  // Build topicsByLesson from the `lesson` field on each topic — this is reliable
  // regardless of whether steps.h returns an array or a PHP associative-array object.
  const topicsByLesson = new Map<number, LDLesson[]>()
  for (const topic of topics) {
    if (topic.lesson != null) {
      const list = topicsByLesson.get(topic.lesson) ?? []
      list.push(topic)
      topicsByLesson.set(topic.lesson, list)
    }
  }
  // Sort each group by menu_order so topics appear in the right order
  for (const [, list] of topicsByLesson) {
    list.sort((a, b) => a.menu_order - b.menu_order)
  }

  /** Return topic lessons for a parent lesson, using a section-specific ID. */
  const getTopicLessons = (lessonId: number, sectionId: string): Lesson[] => {
    const topicList = topicsByLesson.get(lessonId) ?? []
    return topicList.map((topic, tidx) =>
      mapLDLesson(topic, sectionId, tidx, durationMap.get(topic.id) ?? 0)
    )
  }

  /**
   * Post-process a flat lesson list: any lesson that has topics becomes its own
   * Section (using the lesson title as section title). Regular lessons stay in
   * their original section.
   */
  function promoteSections(rawSections: Section[]): Section[] {
    const out: Section[] = []
    for (const sec of rawSections) {
      const regularLessons: Lesson[] = []
      const promotedSections: Section[] = []

      for (const lesson of sec.lessons ?? []) {
        const topicSecId = `ld-topic-sec-${lesson.id}`
        const topicLessons = getTopicLessons(Number(lesson.id), topicSecId)
        if (topicLessons.length > 0) {
          // Promote to its own section — lesson title becomes section header
          promotedSections.push({
            id: topicSecId,
            course_id: courseId,
            title: lesson.title,
            description: null,
            order_index: sec.order_index,
            created_at: new Date().toISOString(),
            lessons: topicLessons,
          } as Section)
        } else {
          regularLessons.push(lesson)
        }
      }

      if (regularLessons.length > 0) out.push({ ...sec, lessons: regularLessons })
      out.push(...promotedSections)
    }
    return out
  }

  // If LearnDash has named sections, use them
  if (steps.sections && steps.sections.length > 0) {
    const raw = steps.sections.map((sec, secIdx) => {
      const sectionId = `ld-section-${courseId}-${sec.id}`
      const sectionLessons = sec.steps
        .filter((s) => s.startsWith("sfwd-lessons:"))
        .map((s) => {
          const lessonId = parseInt(s.split(":")[1])
          const lesson = lessonMap.get(lessonId)
          if (!lesson) return null
          return mapLDLesson(lesson, sectionId, lessonId, durationMap.get(lessonId) ?? 0)
        })
        .filter(Boolean) as Lesson[]

      return {
        id: sectionId,
        course_id: courseId,
        title: sec.title,
        description: null,
        order_index: secIdx,
        created_at: new Date().toISOString(),
        lessons: sectionLessons,
      } as Section
    })
    return promoteSections(raw)
  }

  // No sections — put all lessons in one section
  const sectionId = `ld-section-${courseId}-1`
  const orderedLessonIds = steps.t["sfwd-lessons"] || []
  const sectionLessons = orderedLessonIds
    .map((id, idx) => {
      const lesson = lessonMap.get(id)
      if (!lesson) return null
      return mapLDLesson(lesson, sectionId, idx, durationMap.get(id) ?? 0)
    })
    .filter(Boolean) as Lesson[]

  return promoteSections([
    {
      id: sectionId,
      course_id: courseId,
      title: "Course Content",
      description: null,
      order_index: 0,
      created_at: new Date().toISOString(),
      lessons: sectionLessons,
    } as Section,
  ])
}
