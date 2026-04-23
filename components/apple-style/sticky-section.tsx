"use client"

import { useEffect, useRef, useState, ReactNode } from "react"
import Image from "next/image"
import { useAnimation } from "@/lib/animation-context"
import { useScrollProgress } from "@/lib/scroll-progress"
import { ParallaxBackground } from "@/components/backgrounds/parallax-background"

interface StickySectionProps {
  children: ReactNode
  className?: string
  pinSpacing?: boolean
  start?: string
  end?: string
  backgroundImages?: Array<{
    src: string
    alt?: string
    speed?: number
    direction?: "up" | "down" | "left" | "right"
    opacity?: number
    scale?: number
  }>
  showProgress?: boolean
  progressColor?: string
}

export function StickySection({
  children,
  className = "",
  pinSpacing = true,
  start = "top top",
  end = "+=100%",
  backgroundImages = [],
  showProgress = false,
  progressColor = "rgba(255, 255, 255, 0.8)",
}: StickySectionProps) {
  const ref = useRef<HTMLDivElement>(null)
  const { ScrollTrigger, gsap } = useAnimation()
  const [scrollProgress, setScrollProgress] = useState(0)
  const { progress } = useScrollProgress()

  useEffect(() => {
    if (!ref.current) return

    const element = ref.current

    ScrollTrigger.create({
      trigger: element,
      start,
      end,
      pin: true,
      pinSpacing,
      anticipatePin: 1,
      onUpdate: (self) => {
        setScrollProgress(self.progress)
      },
    })

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => {
        if (trigger.vars.trigger === element) {
          trigger.kill()
        }
      })
    }
  }, [start, end, pinSpacing, ScrollTrigger])

  return (
    <div ref={ref} className={`relative ${className}`}>
      {/* Parallax Background Images */}
      {backgroundImages.length > 0 && (
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <ParallaxBackground images={backgroundImages} overlay={false} />
        </div>
      )}

      {/* Scroll Progress Indicator */}
      {showProgress && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-black/20 z-50">
          <div
            className="h-full transition-all duration-100 ease-out"
            style={{
              width: `${scrollProgress * 100}%`,
              backgroundColor: progressColor,
            }}
          />
        </div>
      )}

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  )
}

