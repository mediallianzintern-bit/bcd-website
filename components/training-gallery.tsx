"use client"

import Image from "next/image"

const PHOTOS = [
  { src: "/Copy of Copy of DSC00261.JPG",           alt: "Basecamp Digital training session" },
  { src: "/Copy of DSC00247.JPG",                   alt: "Basecamp Digital training session" },
  { src: "/Copy of DSC00250.JPG",                   alt: "Basecamp Digital training session" },
  { src: "/Copy of DSC00279.JPG",                   alt: "Basecamp Digital training session" },
  { src: "/Copy of IMG_20180413_120516_HDR.jpg",    alt: "Basecamp Digital training session" },
  { src: "/Copy of IMG_20180421_100015_HDR.jpg",    alt: "Basecamp Digital training session" },
]

// Duplicate for seamless infinite loop
const TRACK = [...PHOTOS, ...PHOTOS]

export function TrainingGallery() {
  return (
    <section className="py-16 md:py-24 overflow-hidden">
      <div className="container mx-auto px-4 mb-10 text-center">
        <h2 className="text-3xl md:text-4xl font-bold">Inside Our Training Rooms</h2>
        <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
          Real learning. Real people. See how Pritesh and the Basecamp Digital team
          deliver hands-on training to professionals across industries.
        </p>
      </div>

      {/* Scroll track — no padding so images bleed to edges */}
      <div className="relative w-full">
        {/* Left fade */}
        <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-24 bg-gradient-to-r from-background to-transparent" />
        {/* Right fade */}
        <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-24 bg-gradient-to-l from-background to-transparent" />

        <div className="flex animate-training-scroll gap-4">
          {TRACK.map((photo, i) => (
            <div
              key={i}
              className="relative h-64 w-96 shrink-0 overflow-hidden rounded-2xl md:h-80 md:w-[480px]"
            >
              <Image
                src={photo.src}
                alt={photo.alt}
                fill
                className="object-cover transition-transform duration-500 hover:scale-105"
                sizes="480px"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
