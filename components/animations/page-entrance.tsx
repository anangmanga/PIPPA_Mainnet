"use client"

import { useEffect, useRef, ReactNode } from "react"
import { useAnimation } from "@/lib/animation-context"

interface PageEntranceProps {
  children: ReactNode
  className?: string
  stagger?: number
  delay?: number
  duration?: number
}

export function PageEntrance({
  children,
  className = "",
  stagger = 0.1,
  delay = 0,
  duration = 0.8,
}: PageEntranceProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const { gsap } = useAnimation()

  useEffect(() => {
    if (!containerRef.current) return

    const elements = containerRef.current.children

    gsap.set(elements, { opacity: 0, y: 30 })

    gsap.to(elements, {
      opacity: 1,
      y: 0,
      duration,
      delay,
      stagger,
      ease: "power3.out",
    })
  }, [stagger, delay, duration, gsap])

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  )
}

