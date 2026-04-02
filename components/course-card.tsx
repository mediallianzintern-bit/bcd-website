"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Clock, BookOpen, Star, ShoppingCart, Check, Play, LogIn, UserPlus } from "lucide-react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useCart } from "@/lib/cart-context"
import type { Course } from "@/lib/types"

interface CourseCardProps {
  course: Course
  isEnrolled?: boolean
  isLoggedIn?: boolean
}

export function CourseCard({ course, isEnrolled, isLoggedIn = false }: CourseCardProps) {
  const { addToCart, isInCart } = useCart()
  const router = useRouter()
  const [showAuthPopup, setShowAuthPopup] = useState(false)
  const inCart = isInCart(course.id)
  const isFree = course.price === 0
  const displayPrice = course.price
  const originalPrice = course.original_price || course.price
  const discountPct = originalPrice > displayPrice
    ? Math.round(((originalPrice - displayPrice) / originalPrice) * 100)
    : 0

  const hours = Math.floor(course.total_duration_minutes / 60)
  const minutes = course.total_duration_minutes % 60
  const durationText = course.total_duration_minutes > 0
    ? (hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`)
    : null

  const handleAction = () => {
    if (!isLoggedIn) {
      setShowAuthPopup(true)
      return
    }
    if (isFree) {
      router.push(`/courses/${course.slug}`)
      return
    }
    addToCart(course)
  }

  return (
    <div className="group flex flex-col h-full">
      <Link href={`/courses/${course.slug}`} className="block flex-1">
        <Card className="h-full overflow-hidden transition-all duration-500 hover:shadow-xl hover:shadow-primary/10 hover:border-primary/50 hover:-translate-y-1">
          <div className="relative aspect-video overflow-hidden">
            {course.thumbnail_url ? (
              <Image
                src={course.thumbnail_url}
                alt={course.title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-muted">
                <BookOpen className="h-12 w-12 text-muted-foreground" />
              </div>
            )}
            <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/0 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            {/* Badge — Free only (hide for enrolled users) */}
            {!isEnrolled && isFree && (
              <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground shadow-lg">
                Free
              </Badge>
            )}

            <div className="absolute top-3 right-3 flex items-center gap-1 bg-background/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-medium">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              <span>4.9</span>
            </div>
          </div>

          <CardContent className="p-4">
            <h3 className="font-semibold text-lg leading-tight line-clamp-2 group-hover:text-primary transition-colors duration-300">
              {course.title}
            </h3>
            <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
              {course.short_description}
            </p>
            <p className="mt-3 text-xs font-medium text-primary">
              {course.instructor_name}
            </p>

            {/* Price row — hide for enrolled users */}
            {!isEnrolled && (
              isFree ? (
                <p className="mt-3 text-base font-bold text-primary">Free</p>
              ) : (
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-base font-bold text-foreground">₹{displayPrice.toLocaleString()}</span>
                  <span className="text-sm text-muted-foreground line-through">₹{originalPrice.toLocaleString()}</span>
                  {discountPct > 0 && (
                    <span className="text-xs font-semibold text-red-500">{discountPct}% off</span>
                  )}
                </div>
              )
            )}
          </CardContent>

          <CardFooter className="px-4 pb-4 pt-0 flex items-center justify-between text-sm text-muted-foreground">
            {durationText ? (
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{durationText}</span>
              </div>
            ) : <span />}
            <div className="flex items-center gap-1">
              <BookOpen className="h-4 w-4" />
              <span>{course.total_lessons} lessons</span>
            </div>
          </CardFooter>
        </Card>
      </Link>

      {/* Start Learning / Register / Add to Cart */}
      {isEnrolled ? (
        <Link href={`/learn/${course.slug}`} className="mt-2 block">
          <Button size="sm" className="w-full gap-2 bg-primary hover:bg-primary/90 text-white">
            <Play className="h-4 w-4" /> Start Learning
          </Button>
        </Link>
      ) : isFree ? (
        <Button
          size="sm"
          className="mt-2 w-full gap-2 bg-primary hover:bg-primary/90 text-white"
          onClick={handleAction}
        >
          <UserPlus className="h-4 w-4" /> Register for Free
        </Button>
      ) : (
        <Button
          variant={inCart ? "secondary" : "default"}
          size="sm"
          className={`mt-2 w-full gap-2 ${inCart ? "" : "bg-primary hover:bg-primary/90 text-white"}`}
          onClick={handleAction}
          disabled={inCart}
        >
          {inCart ? (
            <><Check className="h-4 w-4" /> Added to Cart</>
          ) : (
            <><ShoppingCart className="h-4 w-4" /> Add to Cart</>
          )}
        </Button>
      )}

      {/* Auth Popup */}
      {showAuthPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowAuthPopup(false)}>
          <div
            className="bg-background border border-border rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center mb-6">
              <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <LogIn className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold">Sign in required</h3>
              <p className="text-sm text-muted-foreground mt-2">
                Please sign up or log in to {isFree ? "register for this course" : "add this course to your cart"}.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <Button
                className="w-full gap-2 bg-primary hover:bg-primary/90 text-white"
                onClick={() => router.push("/auth/login")}
              >
                <LogIn className="h-4 w-4" /> Log In
              </Button>
              <Button
                variant="outline"
                className="w-full gap-2"
                onClick={() => router.push("/auth/register")}
              >
                <UserPlus className="h-4 w-4" /> Sign Up
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-muted-foreground"
                onClick={() => setShowAuthPopup(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
