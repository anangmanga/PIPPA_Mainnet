"use client"

import { useState, useEffect, useRef } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useAnimation } from "@/lib/animation-context"
import { MagneticButton } from "@/components/animations/interactive"

interface HeroCarouselEnhancedProps {
  collections: Array<{
    id: string
    name: string
    image: string
    verified: boolean
    mintingUrl?: string
  }>
}

export function HeroCarouselEnhanced({ collections }: HeroCarouselEnhancedProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const containerRef = useRef<HTMLDivElement>(null)
  const { gsap } = useAnimation()

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? collections.length - 1 : prev - 1))
  }

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === collections.length - 1 ? 0 : prev + 1))
  }

  useEffect(() => {
    if (!containerRef.current) return

    const slides = containerRef.current.querySelectorAll(".slide-item")
    
    slides.forEach((slide, index) => {
      if (index === currentIndex) {
        gsap.to(slide, {
          opacity: 1,
          scale: 1,
          x: 0,
          duration: 0.5,
          ease: "power3.out",
        })
      } else {
        const offset = index - currentIndex
        gsap.to(slide, {
          opacity: 0,
          scale: 0.9,
          x: offset * 100,
          duration: 0.4,
          ease: "power3.out",
        })
      }
    })
  }, [currentIndex, gsap])

  useEffect(() => {
    if (!isAutoPlaying) return

    const interval = setInterval(() => {
      goToNext()
    }, 3000)

    return () => clearInterval(interval)
  }, [isAutoPlaying, currentIndex])

  const current = collections[currentIndex]

  return (
    <section
      className="relative w-full h-[500px] md:h-[600px] overflow-hidden group"
      onMouseEnter={() => setIsAutoPlaying(false)}
      onMouseLeave={() => setIsAutoPlaying(true)}
    >
      {/* Slides Container */}
      <div ref={containerRef} className="relative w-full h-full">
        {collections.map((collection, index) => (
          <div
            key={collection.id}
            className="slide-item absolute inset-0"
            style={{ opacity: index === currentIndex ? 1 : 0 }}
          >
            <div className="relative w-full h-full">
              <Image
                src={collection.image || "/placeholder.svg"}
                alt={collection.name}
                fill
                className="object-cover"
                priority={index === currentIndex}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/30" />
              
              {/* Content */}
              <div className="relative h-full flex flex-col justify-end p-8 md:p-12">
                <div className="max-w-4xl">
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4">
                    {collection.name}
                  </h1>
                  <p className="text-xl md:text-2xl text-white/90 mb-8">
                    Limited Edition NFT Characters on Pi Network
                  </p>
                  <div className="flex gap-4 flex-wrap">
                    <MagneticButton
                      as={Link}
                      href="/roadmap"
                      className="px-8 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:opacity-90 transition-opacity"
                    >
                      View Roadmap
                    </MagneticButton>
                    <MagneticButton
                      as={Link}
                      href="/explore"
                      className="px-8 py-3 border-2 border-white text-white rounded-lg font-semibold hover:bg-white/10 transition-colors"
                    >
                      Explore Collections
                    </MagneticButton>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Buttons */}
      <button
        onClick={goToPrevious}
        className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/50 hover:bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-opacity z-10"
        aria-label="Previous"
      >
        <ChevronLeft size={24} />
      </button>
      <button
        onClick={goToNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/50 hover:bg-black/70 text-white opacity-0 group-hover:opacity-100 transition-opacity z-10"
        aria-label="Next"
      >
        <ChevronRight size={24} />
      </button>

      {/* Carousel Indicators */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {collections.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              index === currentIndex ? "bg-white w-8" : "bg-white/50"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  )
}

