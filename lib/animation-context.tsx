"use client"

import { createContext, useContext, useEffect, useRef, ReactNode } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

// Register GSAP plugins
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger)
}

interface AnimationContextType {
  gsap: typeof gsap
  ScrollTrigger: typeof ScrollTrigger
}

const AnimationContext = createContext<AnimationContextType | null>(null)

export function useAnimation() {
  const context = useContext(AnimationContext)
  if (!context) {
    throw new Error("useAnimation must be used within AnimationProvider")
  }
  return context
}

interface AnimationProviderProps {
  children: ReactNode
}

export function AnimationProvider({ children }: AnimationProviderProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Refresh ScrollTrigger on resize
    const handleResize = () => {
      ScrollTrigger.refresh()
    }

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches

    if (prefersReducedMotion) {
      // Disable scroll-triggered animations if user prefers reduced motion
      ScrollTrigger.config({ autoRefreshEvents: "visibilitychange,DOMContentLoaded,load" })
    }

    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("resize", handleResize)
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill())
    }
  }, [])

  return (
    <AnimationContext.Provider value={{ gsap, ScrollTrigger }}>
      <div ref={containerRef}>{children}</div>
    </AnimationContext.Provider>
  )
}

