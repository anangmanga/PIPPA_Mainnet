"use client"

import { useEffect, useRef, ReactNode } from "react"
import Lenis from "lenis"

interface SmoothScrollProviderProps {
  children: ReactNode
  options?: {
    duration?: number
    easing?: (t: number) => number
    orientation?: "vertical" | "horizontal"
    gestureOrientation?: "vertical" | "horizontal"
    smoothWheel?: boolean
    smoothTouch?: boolean
    touchMultiplier?: number
    wheelMultiplier?: number
  }
}

export function SmoothScrollProvider({
  children,
  options = {
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    wheelMultiplier: 1,
    touchMultiplier: 2,
  },
}: SmoothScrollProviderProps) {
  const lenisRef = useRef<Lenis | null>(null)

  useEffect(() => {
    // Initialize Lenis
    const lenis = new Lenis(options)

    lenisRef.current = lenis

    function raf(time: number) {
      lenis.raf(time)
      requestAnimationFrame(raf)
    }

    requestAnimationFrame(raf)

    return () => {
      lenis.destroy()
    }
  }, [options])

  return <>{children}</>
}

