"use client"

import { useEffect, useRef, useState } from "react"
import { Users, Building2, Award, GraduationCap } from "lucide-react"

const stats = [
  {
    icon: GraduationCap,
    value: 8000,
    suffix: "+",
    label: "Students Trained",
  },
  {
    icon: Building2,
    value: 4000,
    suffix: "+",
    label: "Corporate Professionals",
  },
  {
    icon: Award,
    value: 25,
    suffix: "+",
    label: "CXOs Trained",
  },
  {
    icon: Users,
    value: 18,
    suffix: "+",
    label: "Years Experience",
  },
]

function AnimatedNumber({ value, suffix, isVisible }: { value: number; suffix: string; isVisible: boolean }) {
  const [displayValue, setDisplayValue] = useState(0)

  useEffect(() => {
    if (!isVisible) return

    const duration = 2000
    const steps = 60
    const increment = value / steps
    let current = 0

    const timer = setInterval(() => {
      current += increment
      if (current >= value) {
        setDisplayValue(value)
        clearInterval(timer)
      } else {
        setDisplayValue(Math.floor(current))
      }
    }, duration / steps)

    return () => clearInterval(timer)
  }, [value, isVisible])

  return (
    <span className="tabular-nums">
      {displayValue.toLocaleString()}{suffix}
    </span>
  )
}

export function StatsCounter() {
  const [isVisible, setIsVisible] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.3 }
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => observer.disconnect()
  }, [])

  return (
    <section ref={sectionRef} className="py-16 md:py-20 bg-primary text-primary-foreground">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <div
                key={stat.label}
                className={`text-center transition-all duration-700 ${
                  isVisible 
                    ? "opacity-100 translate-y-0" 
                    : "opacity-0 translate-y-8"
                }`}
                style={{ transitionDelay: `${index * 150}ms` }}
              >
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary-foreground/10 mb-4">
                  <Icon className="h-7 w-7" />
                </div>
                <div className="text-3xl md:text-4xl lg:text-5xl font-bold mb-2">
                  <AnimatedNumber value={stat.value} suffix={stat.suffix} isVisible={isVisible} />
                </div>
                <p className="text-sm md:text-base text-primary-foreground/80">{stat.label}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
