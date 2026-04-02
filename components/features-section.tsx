"use client"

import { useEffect, useRef, useState } from "react"
import { Sparkles, Users, Laptop, Brain, Zap, Target } from "lucide-react"

const features = [
  {
    icon: Users,
    title: "Industry-Trained Instructors",
    description: "Learn from experts who've worked with top brands like Meta and Yahoo. Get insights from real-world digital campaigns, not just textbook theories.",
  },
  {
    icon: Laptop,
    title: "Real Tools, Real Campaigns",
    description: "Master tools like ChatGPT, Jasper, GA4, Midjourney, Zapier & n8n. Build actual campaigns as you learn - no boring slides, only hands-on learning.",
  },
  {
    icon: Brain,
    title: "AI Meets Execution",
    description: "Go beyond theory. Learn how to apply AI to content creation, automation, analytics, and campaign strategy with outcomes you can measure.",
  },
  {
    icon: Zap,
    title: "Self-Paced Learning",
    description: "Access courses anytime, anywhere. Our flexible format lets you learn at your own speed with lifetime access to course materials.",
  },
  {
    icon: Target,
    title: "Practical Projects",
    description: "Apply what you learn through hands-on projects and case studies from real brands. Build a portfolio that showcases your skills.",
  },
  {
    icon: Sparkles,
    title: "Live Mentoring",
    description: "Get personalized guidance through live Q&A sessions and mentoring calls with industry experts who have been there and done that.",
  },
]

export function FeaturesSection() {
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
    <section ref={sectionRef} className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div 
          className={`max-w-3xl mx-auto text-center mb-12 md:mb-16 transition-all duration-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-balance">
            What Makes Our Courses Different?
          </h2>
          <p className="mt-4 text-muted-foreground">
            We provide comprehensive, industry-relevant courses designed to give you practical skills that matter.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <div
                key={feature.title}
                className={`group p-6 rounded-2xl border border-border bg-card hover:border-primary/50 hover:shadow-lg transition-all duration-500 ${
                  isVisible 
                    ? "opacity-100 translate-y-0" 
                    : "opacity-0 translate-y-8"
                }`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
