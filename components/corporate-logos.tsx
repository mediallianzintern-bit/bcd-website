"use client"

import { useEffect, useRef, useState } from "react"

const logos = [
  { name: "Times Internet",     src: "/TIMES INTERNET.png"              },
  { name: "ZIRCA",              src: "/zirca_id_500px_rgb_png.png"       },
  { name: "Bennett Coleman",    src: "/TOIlogo-mid.png"                  },
  { name: "Network 18",         src: "/Network-18-logo.png"              },
  { name: "Moneycontrol",       src: "/MONEY CONTROL.jpeg"               },
  { name: "Condé Nast",         src: "/Cond%C3%A9_Nast-Logo.wine.png"   },
  { name: "Marico",             src: "/marico_logo.jpg"                  },
  { name: "OLX",                src: "/OLX.jpg"                          },
  { name: "9XM",                src: "/9XM_Logo.png"                     },
  { name: "The Digital Street", src: "/the-digital-street_logo.jpg"      },
  { name: "Rezilient",          src: "/REZILIENT.png"                    },
  { name: "RmKV Silks",         src: "/rmkv-wedding-silks-logo-vector.png" },
]

const track = [...logos, ...logos, ...logos, ...logos]

export function CorporateLogos() {
  const [isVisible, setIsVisible] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setIsVisible(true) },
      { threshold: 0.1 }
    )
    if (sectionRef.current) observer.observe(sectionRef.current)
    return () => observer.disconnect()
  }, [])

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes bcd-scroll-left {
          0% { transform: translateX(0); }
          100% { transform: translateX(-25%); }
        }
        @keyframes bcd-scroll-right {
          0% { transform: translateX(-25%); }
          100% { transform: translateX(0); }
        }
        .bcd-marquee-left {
          display: flex;
          width: max-content;
          animation: bcd-scroll-left 30s linear infinite;
        }
        .bcd-marquee-right {
          display: flex;
          width: max-content;
          animation: bcd-scroll-right 38s linear infinite;
        }
        .bcd-fade-edge {
          overflow: hidden;
          -webkit-mask-image: linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%);
          mask-image: linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%);
        }
      `}} />

      <section ref={sectionRef} className="py-16 md:py-20 bg-background">
        <div className="container mx-auto px-4">
          <h2
            className={`text-center text-2xl md:text-3xl lg:text-4xl font-bold text-primary mb-4 transition-all duration-700 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            Our Trainings Are Trusted by Leading Brands
          </h2>
          <p
            className={`text-center text-muted-foreground mb-12 transition-all duration-700 delay-100 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
            Join thousands of professionals from top companies
          </p>
        </div>

        {/* Single row — scrolls left */}
        <div className="bcd-fade-edge">
          <div className="bcd-marquee-left">
            {track.map((logo, i) => (
              <div
                key={`r1-${i}`}
                style={{ width: 140, height: 72, flexShrink: 0, marginRight: 24, padding: 12, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 16, backgroundColor: "#fff", border: "1px solid #f3f4f6" }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={logo.src}
                  alt={logo.name}
                  style={{ maxWidth: 116, maxHeight: 48, width: "auto", height: "auto", objectFit: "contain" }}
                />
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
