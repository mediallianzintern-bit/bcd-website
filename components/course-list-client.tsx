"use client"

import { useState, useMemo } from "react"
import { FunnelPlus, Search, X } from "lucide-react"
import { CourseCard } from "@/components/course-card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import type { Course } from "@/lib/types"

type SortOption = "price-asc" | "price-desc" | "newest"

const SORT_LABELS: Record<SortOption, string> = {
  "price-asc":  "Price: Low to High",
  "price-desc": "Price: High to Low",
  "newest":     "Newest First",
}

const MAX_PRICE = 10000

interface CourseListClientProps {
  courses: Course[]
  enrolledCourseIds: string[]
  isLoggedIn: boolean
  /** If true, only show search (crash courses — all free) */
  searchOnly?: boolean
}

export function CourseListClient({
  courses,
  enrolledCourseIds,
  isLoggedIn,
  searchOnly = false,
}: CourseListClientProps) {
  const [query, setQuery]           = useState("")
  const [showFree, setShowFree]     = useState(false)
  const [showPaid, setShowPaid]     = useState(false)
  const [sorts, setSorts]           = useState<Set<SortOption>>(new Set())
  const [maxPrice, setMaxPrice]     = useState(MAX_PRICE)

  const toggleSort = (s: SortOption) =>
    setSorts((prev) => {
      const next = new Set(prev)
      next.has(s) ? next.delete(s) : next.add(s)
      return next
    })

  const resetFilters = () => {
    setShowFree(false)
    setShowPaid(false)
    setSorts(new Set())
    setMaxPrice(MAX_PRICE)
  }

  const activeFilterCount =
    (showFree ? 1 : 0) +
    (showPaid ? 1 : 0) +
    sorts.size +
    (maxPrice < MAX_PRICE ? 1 : 0)

  const filtered = useMemo(() => {
    let result = courses

    // Search
    if (query.trim()) {
      const q = query.toLowerCase()
      result = result.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.short_description?.toLowerCase().includes(q)
      )
    }

    // Free / Paid
    if (showFree && !showPaid) result = result.filter((c) => c.price === 0)
    if (showPaid && !showFree) result = result.filter((c) => c.price > 0)

    // Price ceiling
    result = result.filter((c) => c.price <= maxPrice)

    // Sort — last selected sort wins (or price-asc if multiple picked)
    if (sorts.has("price-asc"))  result = [...result].sort((a, b) => a.price - b.price)
    if (sorts.has("price-desc")) result = [...result].sort((a, b) => b.price - a.price)
    if (sorts.has("newest"))     result = [...result].sort((a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )

    return result
  }, [courses, query, showFree, showPaid, maxPrice, sorts])

  const hasActive = query.trim() || activeFilterCount > 0

  return (
    <div>
      {/* Controls row */}
      <div className="flex items-center gap-3 mb-6">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search courses…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9 pr-9"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Filter popover — hidden for crash (searchOnly) */}
        {!searchOnly && (
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="icon" className="relative shrink-0">
                <FunnelPlus className="h-4 w-4" />
                {activeFilterCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-primary text-[10px] font-bold text-primary-foreground flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
                <span className="sr-only">Filter</span>
              </Button>
            </PopoverTrigger>

            <PopoverContent align="end" className="w-64">
              <div className="grid gap-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm">Filter</span>
                  <Button
                    variant="secondary"
                    className="h-7 rounded-full px-3 text-xs"
                    onClick={resetFilters}
                  >
                    Reset all
                  </Button>
                </div>

                {/* Course type */}
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">Type</p>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="filter-free"
                        checked={showFree}
                        onCheckedChange={(v) => setShowFree(!!v)}
                      />
                      <Label htmlFor="filter-free" className="cursor-pointer">Free</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="filter-paid"
                        checked={showPaid}
                        onCheckedChange={(v) => setShowPaid(!!v)}
                      />
                      <Label htmlFor="filter-paid" className="cursor-pointer">Paid</Label>
                    </div>
                  </div>
                </div>

                {/* Sort */}
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">Sort by</p>
                  <div className="flex flex-col gap-2">
                    {(Object.keys(SORT_LABELS) as SortOption[]).map((s) => (
                      <div key={s} className="flex items-center gap-2">
                        <Checkbox
                          id={`sort-${s}`}
                          checked={sorts.has(s)}
                          onCheckedChange={() => toggleSort(s)}
                        />
                        <Label htmlFor={`sort-${s}`} className="cursor-pointer">{SORT_LABELS[s]}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Price slider */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Max price</p>
                    <span className="text-xs font-semibold text-primary">
                      {maxPrice === MAX_PRICE ? "Any" : `₹${maxPrice.toLocaleString()}`}
                    </span>
                  </div>
                  <Slider
                    value={[maxPrice]}
                    onValueChange={([v]) => setMaxPrice(v)}
                    step={500}
                    min={0}
                    max={MAX_PRICE}
                    aria-label="Max price"
                  />
                  <div className="flex justify-between mt-1.5 text-[11px] text-muted-foreground">
                    <span>₹0</span>
                    <span>₹5,000</span>
                    <span>₹10,000</span>
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        )}

        {/* Clear all */}
        {hasActive && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => { setQuery(""); resetFilters() }}
            className="shrink-0 text-muted-foreground"
          >
            Clear
          </Button>
        )}
      </div>

      {/* Results count */}
      {hasActive && (
        <p className="text-sm text-muted-foreground mb-4">
          {filtered.length} {filtered.length === 1 ? "course" : "courses"} found
        </p>
      )}

      {/* Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              isEnrolled={enrolledCourseIds.includes(course.id)}
              isLoggedIn={isLoggedIn}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-muted/50 rounded-lg">
          <p className="text-muted-foreground">No courses match your search.</p>
          <button
            onClick={() => { setQuery(""); resetFilters() }}
            className="mt-3 text-sm text-primary underline hover:no-underline"
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  )
}
