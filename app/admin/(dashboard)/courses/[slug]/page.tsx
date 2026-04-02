"use client"

import { useEffect, useRef, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Save, Plus, Trash2, ExternalLink, Upload, Loader2 } from "lucide-react"

interface ContentState {
  // pricing
  price: string
  originalPrice: string
  // curriculum
  whatYouWillLearn: string[]
  courseIncludes: string[]
  whoThisCourseIsFor: string[]
  requirements: string[]
  descriptionExtra: string
  breadcrumbItems: string[]
  breadcrumbHighlight: string
  // hero
  thumbnailUrl: string
  rating: string
  reviewsCount: string
  studentsCount: string
  lastUpdated: string
  language: string
  subtitleLanguages: string
  // instructor
  instructorName: string
  instructorTitle: string
  instructorRating: string
  instructorStudents: string
  instructorBio: string
  instructorAvatar: string
}

const EMPTY: ContentState = {
  price: "",
  originalPrice: "",
  whatYouWillLearn: [],
  courseIncludes: [],
  whoThisCourseIsFor: [],
  requirements: [],
  descriptionExtra: "",
  breadcrumbItems: [],
  breadcrumbHighlight: "",
  thumbnailUrl: "",
  rating: "4.9",
  reviewsCount: "2,847",
  studentsCount: "8,234",
  lastUpdated: "03/2026",
  language: "English",
  subtitleLanguages: "English [Auto], Hindi [Auto]",
  instructorName: "Pritesh Patel",
  instructorTitle: "Founder & Coach — BaseCamp Digital | Ex-Meta · Ex-Yahoo · ISB Alumni",
  instructorRating: "4.9",
  instructorStudents: "8,000+",
  instructorBio: "",
  instructorAvatar: "",
}

function BulletListEditor({
  label,
  items,
  onChange,
}: {
  label: string
  items: string[]
  onChange: (items: string[]) => void
}) {
  const update = (index: number, value: string) => {
    const next = [...items]
    next[index] = value
    onChange(next)
  }
  const add = () => onChange([...items, ""])
  const remove = (index: number) => onChange(items.filter((_, i) => i !== index))

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm font-medium text-neutral-300">{label}</label>
        <button
          onClick={add}
          className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors"
        >
          <Plus className="w-3 h-3" /> Add item
        </button>
      </div>
      <div className="space-y-2">
        {items.map((item, i) => (
          <div key={i} className="flex gap-2">
            <input
              value={item}
              onChange={(e) => update(i, e.target.value)}
              className="flex-1 bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-primary"
              placeholder={`Item ${i + 1}`}
            />
            <button
              onClick={() => remove(i)}
              className="p-2 text-neutral-500 hover:text-red-400 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
        {items.length === 0 && (
          <p className="text-xs text-neutral-600 italic">No items. Click "Add item" to start.</p>
        )}
      </div>
    </div>
  )
}

function ImageUploadField({
  label,
  value,
  onChange,
  previewClass = "max-h-48 rounded-lg",
  hint,
}: {
  label: string
  value: string
  onChange: (url: string) => void
  previewClass?: string
  hint?: string
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState("")

  const handleFile = async (file: File) => {
    setError("")
    setUploading(true)
    const fd = new FormData()
    fd.append("file", file)
    try {
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd })
      const data = await res.json()
      if (res.ok) {
        onChange(data.url)
      } else {
        setError(data.error ?? "Upload failed")
      }
    } catch {
      setError("Upload failed")
    } finally {
      setUploading(false)
    }
  }

  return (
    <div>
      <label className="text-sm font-medium text-neutral-300 block mb-1.5">{label}</label>
      <div className="flex gap-2">
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://… or upload below"
          className="flex-1 bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-primary"
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-1.5 px-3 py-2 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-neutral-300 text-sm rounded-lg transition-colors disabled:opacity-50 shrink-0"
        >
          {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
          {uploading ? "Uploading…" : "Upload"}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
        />
      </div>
      {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
      {hint && <p className="text-xs text-neutral-600 mt-1">{hint}</p>}
      {value && (
        <img src={value} alt="Preview" className={`mt-3 object-cover border border-neutral-700 ${previewClass}`} />
      )}
    </div>
  )
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  hint,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  hint?: string
}) {
  return (
    <div>
      <label className="text-sm font-medium text-neutral-300 block mb-1.5">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-primary"
      />
      {hint && <p className="text-xs text-neutral-600 mt-1">{hint}</p>}
    </div>
  )
}

export default function CourseContentEditorPage() {
  const params = useParams<{ slug: string }>()
  const router = useRouter()
  const slug = params.slug

  const [content, setContent] = useState<ContentState>(EMPTY)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [savedMsg, setSavedMsg] = useState("")

  useEffect(() => {
    fetch(`/api/admin/course-content/${slug}`)
      .then((r) => r.json())
      .then((data) => {
        if (data) {
          setContent({
            price: data.price != null ? String(data.price).replace(/[^0-9.]/g, "") : "",
            originalPrice: data.originalPrice != null ? String(data.originalPrice).replace(/[^0-9.]/g, "") : "",
            whatYouWillLearn: data.whatYouWillLearn ?? [],
            courseIncludes: data.courseIncludes ?? [],
            whoThisCourseIsFor: data.whoThisCourseIsFor ?? [],
            requirements: data.requirements ?? [],
            descriptionExtra: data.descriptionExtra ?? "",
            breadcrumbItems: data.breadcrumbItems ?? [],
            breadcrumbHighlight: data.breadcrumbHighlight ?? "",
            thumbnailUrl: data.thumbnailUrl ?? "",
            rating: data.rating ?? "4.9",
            reviewsCount: data.reviewsCount ?? "2,847",
            studentsCount: data.studentsCount ?? "8,234",
            lastUpdated: data.lastUpdated ?? "03/2026",
            language: data.language ?? "English",
            subtitleLanguages: data.subtitleLanguages ?? "English [Auto], Hindi [Auto]",
            instructorName: data.instructorName ?? "",
            instructorTitle: data.instructorTitle ?? "",
            instructorRating: data.instructorRating ?? "4.9",
            instructorStudents: data.instructorStudents ?? "8,000+",
            instructorBio: data.instructorBio ?? "",
            instructorAvatar: data.instructorAvatar ?? "",
          })
        }
        setLoading(false)
      })
  }, [slug])

  const save = async () => {
    setSaving(true)
    setSavedMsg("")
    try {
      const res = await fetch(`/api/admin/course-content/${slug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...content,
          thumbnailUrl: content.thumbnailUrl || null,
          instructorAvatar: content.instructorAvatar || null,
        }),
      })
      setSavedMsg(res.ok ? "Saved!" : "Error saving")
      if (res.ok) setTimeout(() => setSavedMsg(""), 3000)
    } finally {
      setSaving(false)
    }
  }

  const set = (key: keyof ContentState) => (val: string | string[]) =>
    setContent((prev) => ({ ...prev, [key]: val }))

  const sf = (key: keyof ContentState) => (val: string) => set(key)(val)

  return (
    <div className="max-w-3xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => router.push("/admin/courses")}
          className="p-1.5 text-neutral-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-white">Edit Course Page Content</h1>
          <p className="text-xs text-neutral-500 font-mono mt-0.5">{slug}</p>
        </div>
        <a
          href={`/courses/${slug}`}
          target="_blank"
          className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white transition-colors"
        >
          <ExternalLink className="w-3.5 h-3.5" /> Preview
        </a>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-24 bg-neutral-900 border border-neutral-800 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-8">

          {/* ── Pricing ── */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 space-y-4">
            <div>
              <h2 className="text-sm font-semibold text-white">Pricing</h2>
              <p className="text-xs text-neutral-500 mt-0.5">Overrides the static price config. Leave blank to use the default price.</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field
                label="Discounted Price (₹)"
                value={content.price}
                onChange={sf("price")}
                placeholder="e.g. 299"
                hint="What the student pays"
              />
              <Field
                label="Original Price (₹)"
                value={content.originalPrice}
                onChange={sf("originalPrice")}
                placeholder="e.g. 5999"
                hint="Shown as strikethrough"
              />
            </div>
            {(() => {
              const p = Number(content.price.replace(/[^0-9.]/g, ""))
              const op = Number(content.originalPrice.replace(/[^0-9.]/g, ""))
              if (!p || !op || op <= p) return null
              return (
                <p className="text-xs text-green-400">
                  {Math.round((1 - p / op) * 100)}% off · Student saves ₹{(op - p).toLocaleString("en-IN")}
                </p>
              )
            })()}
          </div>

          {/* ── Hero / Thumbnail ── */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 space-y-4">
            <h2 className="text-sm font-semibold text-white">Thumbnail / Hero Image</h2>
            <ImageUploadField
              label="Thumbnail Image"
              value={content.thumbnailUrl}
              onChange={sf("thumbnailUrl")}
              hint="Upload an image or paste a URL. Leave blank to use the LearnDash/WordPress thumbnail."
            />
          </div>

          {/* ── Course Stats ── */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 space-y-4">
            <h2 className="text-sm font-semibold text-white">Course Stats (shown in hero)</h2>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Rating" value={content.rating} onChange={sf("rating")} placeholder="4.9" />
              <Field label="Reviews Count" value={content.reviewsCount} onChange={sf("reviewsCount")} placeholder="2,847" />
              <Field label="Students Count" value={content.studentsCount} onChange={sf("studentsCount")} placeholder="8,234" />
              <Field label="Last Updated" value={content.lastUpdated} onChange={sf("lastUpdated")} placeholder="03/2026" />
              <Field label="Language" value={content.language} onChange={sf("language")} placeholder="English" />
              <Field label="Subtitle Languages" value={content.subtitleLanguages} onChange={sf("subtitleLanguages")} placeholder="English [Auto], Hindi [Auto]" />
            </div>
          </div>

          {/* ── Breadcrumb ── */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 space-y-4">
            <h2 className="text-sm font-semibold text-white">Breadcrumb</h2>
            <BulletListEditor
              label="Breadcrumb items (e.g. Marketing, Digital Marketing)"
              items={content.breadcrumbItems}
              onChange={set("breadcrumbItems") as (v: string[]) => void}
            />
            <Field
              label="Highlighted tag"
              value={content.breadcrumbHighlight}
              onChange={sf("breadcrumbHighlight")}
              placeholder="e.g. Content & Influencer Marketing"
            />
          </div>

          {/* ── Description ── */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5">
            <label className="text-sm font-semibold text-white block mb-3">Course Description (extra paragraph)</label>
            <textarea
              value={content.descriptionExtra}
              onChange={(e) => sf("descriptionExtra")(e.target.value)}
              rows={5}
              className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary resize-none"
              placeholder="Additional description shown on the course page…"
            />
          </div>

          {/* ── What You'll Learn ── */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5">
            <BulletListEditor
              label="What You'll Learn"
              items={content.whatYouWillLearn}
              onChange={set("whatYouWillLearn") as (v: string[]) => void}
            />
          </div>

          {/* ── Course Includes ── */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5">
            <BulletListEditor
              label="Course Includes (sidebar) — icons assigned by position"
              items={content.courseIncludes}
              onChange={set("courseIncludes") as (v: string[]) => void}
            />
            <p className="text-xs text-neutral-600 mt-2">
              Icons order: Video · Article · Download · Mobile · Lifetime · Certificate
            </p>
          </div>

          {/* ── Requirements ── */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5">
            <BulletListEditor
              label="Requirements"
              items={content.requirements}
              onChange={set("requirements") as (v: string[]) => void}
            />
          </div>

          {/* ── Who This Course Is For ── */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5">
            <BulletListEditor
              label="Who This Course Is For"
              items={content.whoThisCourseIsFor}
              onChange={set("whoThisCourseIsFor") as (v: string[]) => void}
            />
          </div>

          {/* ── Instructor ── */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 space-y-4">
            <h2 className="text-sm font-semibold text-white">Instructor</h2>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Name" value={content.instructorName} onChange={sf("instructorName")} placeholder="Pritesh Patel" />
              <Field label="Rating" value={content.instructorRating} onChange={sf("instructorRating")} placeholder="4.9" />
              <Field label="Students" value={content.instructorStudents} onChange={sf("instructorStudents")} placeholder="8,000+" />
            </div>
            <Field
              label="Title / Designation"
              value={content.instructorTitle}
              onChange={sf("instructorTitle")}
              placeholder="Founder & Coach — BaseCamp Digital"
            />
            <div>
              <label className="text-sm font-medium text-neutral-300 block mb-1.5">Bio</label>
              <textarea
                value={content.instructorBio}
                onChange={(e) => sf("instructorBio")(e.target.value)}
                rows={4}
                className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-primary resize-none"
                placeholder="Instructor biography…"
              />
            </div>
            <ImageUploadField
              label="Avatar / Photo"
              value={content.instructorAvatar}
              onChange={sf("instructorAvatar")}
              previewClass="w-20 h-20 rounded-full"
              hint="Upload a photo or paste a URL."
            />
          </div>

          {/* Save */}
          <div className="flex items-center gap-4 pb-8">
            <button
              onClick={save}
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 bg-primary text-black font-semibold text-sm rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
              <Save className="w-4 h-4" />
              {saving ? "Saving…" : "Save Changes"}
            </button>
            {savedMsg && (
              <span className={`text-sm ${savedMsg === "Saved!" ? "text-green-400" : "text-red-400"}`}>
                {savedMsg}
              </span>
            )}
          </div>

        </div>
      )}
    </div>
  )
}
