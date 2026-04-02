"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Quote, Star, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

const testimonials = [
  {
    id: 1,
    name: "Akhilesh Garde",
    role: "Economic Times",
    image: null,
    content: "It was an absolute privilege to attend these digital marketing training sessions under the guidance of Pritesh Patel. The sessions for Content and Native Advertising were very informative, and I got a clear differentiation perspective between both of them.",
    rating: 5,
  },
  {
    id: 2,
    name: "Shaily Chhabra",
    role: "Digital Marketing Professional",
    image: null,
    content: "Pritesh is a great mentor and a guide with an excellent understanding of the digital landscape. He uses a blend of digital, technical and humanistic approach in the sessions. In just four short weeks, we gained good digital insights that I will imbibe now and in the months to come.",
    rating: 5,
  },
  {
    id: 3,
    name: "Shafi Gujrati",
    role: "Sr. Manager Sales",
    image: null,
    content: "Undoubtedly one of the best digital learning and interactive sessions conducted by Mr. Pritesh Patel. He is the most experienced person in the digital marketing space and the best thing was the sharing of case studies and teaching by real-life examples.",
    rating: 5,
  },
  {
    id: 4,
    name: "Bandana Modi",
    role: "National Lead - Key Agencies, Zirca Digital Solutions",
    image: null,
    content: "Pritesh's session was an eye opener for every sales person. His rich sales background brought in real sales scenarios and deep insight on how we could utilise these to our advantage and improve our overall sales performance.",
    rating: 5,
  },
  {
    id: 5,
    name: "Brahmanand Pandey",
    role: "Manager, Zirca Digital Solutions",
    image: null,
    content: "The training has had a significant impact on the way I will be preparing for meetings in the future. I have picked up a lot of factual information regarding the sources of information.",
    rating: 5,
  },
  {
    id: 6,
    name: "Vivek Nair",
    role: "Executive, Zirca Digital Solutions",
    image: null,
    content: "A real eye-opener, the session was immense both in its depth of information and quality. A definite difference maker on what separates a great salesman from a good salesman.",
    rating: 5,
  },
  {
    id: 7,
    name: "Rajesh Kumar",
    role: "Marketing Head, Tech Startup",
    image: null,
    content: "The AI course content was exceptional. Pritesh's approach to teaching complex AI concepts in simple terms made the learning experience enjoyable and highly effective.",
    rating: 5,
  },
  {
    id: 8,
    name: "Priya Sharma",
    role: "Data Analyst, Fortune 500 Company",
    image: null,
    content: "This course transformed my understanding of AI fundamentals. The practical examples and hands-on projects gave me confidence to apply these skills in my work immediately.",
    rating: 5,
  },
]

export function Testimonials() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const sectionRef = useRef<HTMLElement>(null)
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 }
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => observer.disconnect()
  }, [])

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev >= testimonials.length - 1 ? 0 : prev + 1))
  }, [])

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev <= 0 ? testimonials.length - 1 : prev - 1))
  }, [])

  // Auto-play carousel
  useEffect(() => {
    if (isAutoPlaying) {
      autoPlayRef.current = setInterval(nextSlide, 5000)
    }
    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current)
      }
    }
  }, [isAutoPlaying, nextSlide])

  const handleManualNav = (direction: 'prev' | 'next') => {
    setIsAutoPlaying(false)
    if (direction === 'prev') prevSlide()
    else nextSlide()
    // Resume auto-play after 10 seconds
    setTimeout(() => setIsAutoPlaying(true), 10000)
  }

  return (
    <section ref={sectionRef} className="py-16 md:py-24 bg-secondary/30 overflow-hidden">
      <div className="container mx-auto px-4">
        <div 
          className={`text-center mb-12 transition-all duration-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-balance mb-4">
            Testimonials
          </h2>
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
            <Star className="h-4 w-4 fill-primary" />
            <span>Rated 4.9/5 by 8000+ Students</span>
          </div>
        </div>

        <div className="relative max-w-6xl mx-auto">
          {/* Desktop Carousel - Shows 2 cards */}
          <div className="hidden md:block">
            <div className="flex items-center gap-6">
              <Button
                variant="outline"
                size="icon"
                className="shrink-0 rounded-full h-12 w-12 shadow-lg hover:shadow-xl hover:bg-primary hover:text-primary-foreground transition-all"
                onClick={() => handleManualNav('prev')}
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>

              <div className="flex-1 overflow-hidden">
                <div 
                  className="flex transition-transform duration-500 ease-out"
                  style={{ transform: `translateX(-${Math.min(currentIndex, testimonials.length - 2) * 50}%)` }}
                >
                  {testimonials.map((testimonial, index) => (
                    <div
                      key={testimonial.id}
                      className="w-1/2 shrink-0 px-3"
                    >
                      <Card className={`h-full bg-card hover:shadow-xl transition-all duration-500 ${
                        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                      }`}
                      style={{ transitionDelay: `${index * 100}ms` }}
                      >
                        <CardContent className="p-8">
                          <Quote className="h-10 w-10 text-primary/20 mb-4" />
                          <p className="text-base text-muted-foreground leading-relaxed mb-6 min-h-30">
                            "{testimonial.content}"
                          </p>
                          <div className="flex gap-1 mb-4">
                            {Array.from({ length: testimonial.rating }).map((_, i) => (
                              <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                            ))}
                          </div>
                          <div className="flex items-center gap-4 pt-4 border-t border-border">
                            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                              {testimonial.name.charAt(0)}
                            </div>
                            <div>
                              <p className="font-semibold">{testimonial.name}</p>
                              <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  ))}
                </div>
              </div>

              <Button
                variant="outline"
                size="icon"
                className="shrink-0 rounded-full h-12 w-12 shadow-lg hover:shadow-xl hover:bg-primary hover:text-primary-foreground transition-all"
                onClick={() => handleManualNav('next')}
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Mobile Carousel - Shows 1 card */}
          <div className="md:hidden">
            <div className="overflow-hidden">
              <div 
                className="flex transition-transform duration-500 ease-out"
                style={{ transform: `translateX(-${currentIndex * 100}%)` }}
              >
                {testimonials.map((testimonial) => (
                  <div
                    key={testimonial.id}
                    className="w-full shrink-0 px-2"
                  >
                    <Card className="h-full bg-card">
                      <CardContent className="p-6">
                        <Quote className="h-8 w-8 text-primary/20 mb-4" />
                        <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                          "{testimonial.content}"
                        </p>
                        <div className="flex gap-1 mb-4">
                          {Array.from({ length: testimonial.rating }).map((_, i) => (
                            <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          ))}
                        </div>
                        <div className="flex items-center gap-3 pt-4 border-t border-border">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                            {testimonial.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-semibold text-sm">{testimonial.name}</p>
                            <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </div>
            </div>

            {/* Mobile Navigation */}
            <div className="flex items-center justify-center gap-4 mt-6">
              <Button
                variant="outline"
                size="icon"
                className="rounded-full"
                onClick={() => handleManualNav('prev')}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="flex gap-2">
                {testimonials.map((_, i) => (
                  <button
                    key={i}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      i === currentIndex ? "bg-primary w-6" : "bg-primary/20"
                    }`}
                    onClick={() => {
                      setIsAutoPlaying(false)
                      setCurrentIndex(i)
                      setTimeout(() => setIsAutoPlaying(true), 10000)
                    }}
                  />
                ))}
              </div>
              <Button
                variant="outline"
                size="icon"
                className="rounded-full"
                onClick={() => handleManualNav('next')}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Desktop Navigation Dots */}
          <div className="hidden md:flex justify-center gap-2 mt-8">
            {testimonials.map((_, i) => (
              <button
                key={i}
                className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                  i === currentIndex ? "bg-primary w-8" : "bg-primary/20 hover:bg-primary/40"
                }`}
                onClick={() => {
                  setIsAutoPlaying(false)
                  setCurrentIndex(i)
                  setTimeout(() => setIsAutoPlaying(true), 10000)
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
