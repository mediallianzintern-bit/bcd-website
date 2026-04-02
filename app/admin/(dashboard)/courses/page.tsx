"use client"

import { useEffect, useState } from "react"
import { BookOpen, ExternalLink, Users, Layers, Pencil } from "lucide-react"

interface LocalCourse {
  id: string
  title: string
  slug: string
  price: number
  originalPrice: number | null
  isPublished: boolean
  createdAt: string
  _count: { enrollments: number; sections: number }
}

interface LDCourse {
  id: number
  title: { rendered: string }
  slug: string
  _embedded?: { "wp:featuredmedia"?: { source_url: string }[] }
  price?: number
}

export default function AdminCoursesPage() {
  const [localCourses, setLocalCourses] = useState<LocalCourse[]>([])
  const [ldCourses, setLdCourses] = useState<LDCourse[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<"local" | "learndash">("learndash")

  useEffect(() => {
    fetch("/api/admin/courses")
      .then((r) => r.json())
      .then((data) => {
        setLocalCourses(data.localCourses || [])
        setLdCourses(data.ldCourses || [])
        setLoading(false)
      })
  }, [])

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Courses</h1>
        <p className="text-neutral-400 text-sm mt-1">
          {ldCourses.length} LearnDash courses · {localCourses.length} local courses
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-neutral-900 border border-neutral-800 rounded-lg p-1 w-fit">
        <button
          onClick={() => setTab("learndash")}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            tab === "learndash" ? "bg-primary text-black" : "text-neutral-400 hover:text-white"
          }`}
        >
          LearnDash Courses
        </button>
        <button
          onClick={() => setTab("local")}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            tab === "local" ? "bg-primary text-black" : "text-neutral-400 hover:text-white"
          }`}
        >
          Local / Free Courses
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-40 bg-neutral-900 border border-neutral-800 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : tab === "learndash" ? (
        <div>
          <p className="text-xs text-neutral-500 mb-4">These courses are managed in LearnDash (WordPress). Click to view on the site.</p>
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-800">
                  <th className="text-left px-4 py-3 text-neutral-400 font-medium">Course</th>
                  <th className="text-left px-4 py-3 text-neutral-400 font-medium">Slug</th>
                  <th className="text-left px-4 py-3 text-neutral-400 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800">
                {ldCourses.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-4 py-8 text-center text-neutral-500">
                      No LearnDash courses loaded (WP may be unreachable)
                    </td>
                  </tr>
                ) : (
                  ldCourses.map((course) => (
                    <tr key={course.id} className="hover:bg-neutral-800/50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded bg-neutral-800 flex items-center justify-center shrink-0">
                            <BookOpen className="w-4 h-4 text-neutral-400" />
                          </div>
                          <p className="font-medium text-white"
                            dangerouslySetInnerHTML={{ __html: course.title.rendered }}
                          />
                        </div>
                      </td>
                      <td className="px-4 py-3 text-neutral-500 text-xs font-mono">{course.slug}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <a
                            href={`/courses/${course.slug}`}
                            target="_blank"
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-lg transition-colors"
                          >
                            <ExternalLink className="w-3 h-3" /> View
                          </a>
                          <a
                            href={`/admin/courses/${course.slug}`}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-primary/10 hover:bg-primary/20 text-primary rounded-lg transition-colors"
                          >
                            <Pencil className="w-3 h-3" /> Edit Page
                          </a>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div>
          <p className="text-xs text-neutral-500 mb-4">Free / crash courses managed in the local database.</p>
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-800">
                  <th className="text-left px-4 py-3 text-neutral-400 font-medium">Course</th>
                  <th className="text-left px-4 py-3 text-neutral-400 font-medium">Price</th>
                  <th className="text-left px-4 py-3 text-neutral-400 font-medium">Sections</th>
                  <th className="text-left px-4 py-3 text-neutral-400 font-medium">Enrollments</th>
                  <th className="text-left px-4 py-3 text-neutral-400 font-medium">Status</th>
                  <th className="text-left px-4 py-3 text-neutral-400 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800">
                {localCourses.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-neutral-500">No local courses found</td>
                  </tr>
                ) : (
                  localCourses.map((course) => (
                    <tr key={course.id} className="hover:bg-neutral-800/50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded bg-neutral-800 flex items-center justify-center shrink-0">
                            <BookOpen className="w-4 h-4 text-neutral-400" />
                          </div>
                          <div>
                            <p className="font-medium text-white">{course.title}</p>
                            <p className="text-xs text-neutral-500 font-mono">{course.slug}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-neutral-300">
                        {course.price === 0 ? (
                          <span className="text-xs bg-green-500/10 text-green-400 px-2 py-0.5 rounded-full">Free</span>
                        ) : (
                          `₹${course.price}`
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 text-neutral-400">
                          <Layers className="w-3 h-3" />
                          {course._count.sections}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 text-neutral-400">
                          <Users className="w-3 h-3" />
                          {course._count.enrollments}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {course.isPublished ? (
                          <span className="text-xs bg-green-500/10 text-green-400 px-2 py-0.5 rounded-full">Published</span>
                        ) : (
                          <span className="text-xs bg-neutral-800 text-neutral-400 px-2 py-0.5 rounded-full">Draft</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <a
                            href={`/courses/${course.slug}`}
                            target="_blank"
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-lg transition-colors"
                          >
                            <ExternalLink className="w-3 h-3" /> View
                          </a>
                          <a
                            href={`/admin/courses/${course.slug}`}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-primary/10 hover:bg-primary/20 text-primary rounded-lg transition-colors"
                          >
                            <Pencil className="w-3 h-3" /> Edit Page
                          </a>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
