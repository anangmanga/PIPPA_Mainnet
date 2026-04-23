"use client"

import { ReactNode } from "react"
import { ParallaxBackground } from "@/components/backgrounds/parallax-background"
import { ScrollReveal } from "@/components/animations/scroll-reveal"

interface ParallaxSectionProps {
  children?: ReactNode
  backgroundImages?: Array<{
    src: string
    alt?: string
    speed?: number
    direction?: "up" | "down" | "left" | "right"
    opacity?: number
    scale?: number
  }>
  className?: string
  overlay?: boolean
  overlayColor?: string
  minHeight?: string
}

export function ParallaxSection({
  children,
  backgroundImages = [],
  className = "",
  overlay = true,
  overlayColor = "rgba(0, 0, 0, 0.3)",
  minHeight = "100vh",
}: ParallaxSectionProps) {
  return (
    <section className={`relative w-full ${className}`} style={{ minHeight }}>
      {backgroundImages.length > 0 ? (
        <ParallaxBackground images={backgroundImages} overlay={overlay} overlayColor={overlayColor}>
          <div className="relative z-20">{children}</div>
        </ParallaxBackground>
      ) : (
        children
      )}
    </section>
  )
}

