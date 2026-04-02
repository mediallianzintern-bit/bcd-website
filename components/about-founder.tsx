"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import { Award, Briefcase, GraduationCap } from "lucide-react"

export function AboutFounder() {
  const [isVisible, setIsVisible] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)

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

  return (
    <section ref={sectionRef} className="py-16 md:py-24 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div 
            className={`transition-all duration-700 ${
              isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-8"
            }`}
          >
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary mb-4">
              <Award className="h-4 w-4" />
              <span>Meet Our Founder</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-balance">
              Pritesh Patel
            </h2>
            <p className="text-lg text-primary font-medium mb-4">
              Founder & Coach - BaseCamp Digital
            </p>
            <p className="text-muted-foreground leading-relaxed mb-6">
              With 21+ years of industry experience, Pritesh has worked with top companies including Meta, Yahoo India, Komli Media, and consulted for brands like Hindustan Unilever, P&G, and Citibank. He was awarded the Yahoo! Ratna for 2007, the most prestigious award in Yahoo India.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-8">
              He has completed his Senior Executive Management course from Indian School of Business (ISB) in affiliation with The Wharton, Kellogg & FDC Business School.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-background border border-border">
                <Briefcase className="h-5 w-5 text-primary shrink-0" />
                <div>
                  <p className="text-2xl font-bold">21+</p>
                  <p className="text-xs text-muted-foreground">Years Experience</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-background border border-border">
                <GraduationCap className="h-5 w-5 text-primary shrink-0" />
                <div>
                  <p className="text-2xl font-bold">ISB</p>
                  <p className="text-xs text-muted-foreground">Alumni</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-background border border-border">
                <Award className="h-5 w-5 text-primary shrink-0" />
                <div>
                  <p className="text-2xl font-bold">Y! Ratna</p>
                  <p className="text-xs text-muted-foreground">Award Winner</p>
                </div>
              </div>
            </div>
          </div>

          <div 
            className={`relative transition-all duration-700 delay-200 ${
              isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"
            }`}
          >
            <div className="relative aspect-square max-w-md mx-auto">
              <div className="absolute inset-0 bg-linear-to-br from-primary/20 to-primary/5 rounded-3xl transform rotate-3" />
              <div className="absolute inset-0 bg-linear-to-tl from-primary/20 to-primary/5 rounded-3xl transform -rotate-3" />
              <div className="relative h-full rounded-3xl overflow-hidden border border-border">
                <Image
                  src="/Pritesh Patel.png"
                  alt="Pritesh Patel"
                  fill
                  className="object-cover object-top"
                />
                <div className="absolute bottom-0 inset-x-0 bg-linear-to-t from-black/80 via-black/40 to-transparent p-6 text-center">
                  <p className="text-xl font-semibold text-white">Pritesh Patel</p>
                  <p className="text-sm text-white/70 mt-1">Digital Marketing Expert</p>
                  <div className="flex justify-center flex-wrap gap-2 mt-3">
                    <span className="px-3 py-1 text-xs rounded-full bg-primary/80 text-white">Ex-Meta</span>
                    <span className="px-3 py-1 text-xs rounded-full bg-primary/80 text-white">Ex-Yahoo</span>
                    <span className="px-3 py-1 text-xs rounded-full bg-primary/80 text-white">ISB</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
