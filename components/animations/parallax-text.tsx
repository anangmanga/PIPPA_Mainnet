"use client"

import { useEffect, useRef, ReactNode } from "react"
import { useParallax } from "@/lib/parallax"

interface ParallaxTextProps {
  children: ReactNode
  speed?: number
  direction?: "up" | "down" | "left" | "right"
  className?: string
}

export function ParallaxText({ children, speed = 0.3, direction = "up", className = "" }: ParallaxTextProps) {
  const { ref } = useParallax({ speed, direction })

  return (
    <div ref={ref as React.RefObject<HTMLDivElement>} className={className}>
      {children}
    </div>
  )
}

