"use client"

import { useEffect, useRef, useState } from "react"
import { useAnimation } from "@/lib/animation-context"

interface ParallaxOptions {
  speed?: number
  direction?: "up" | "down" | "left" | "right"
  easing?: string
  start?: string
  end?: string
}

export function useParallax(options: ParallaxOptions = {}) {
  const { speed = 0.5, direction = "up", easing = "none", start = "top bottom", end = "bottom top" } = options
  const ref = useRef<HTMLElement>(null)
  const [offset, setOffset] = useState(0)
  const { ScrollTrigger, gsap } = useAnimation()

  useEffect(() => {
    if (!ref.current) return

    const element = ref.current

    ScrollTrigger.create({
      trigger: element,
      start,
      end,
      scrub: true,
      onUpdate: (self) => {
        const progress = self.progress
        const distance = (progress - 0.5) * speed * 100

        let x = 0
        let y = 0

        switch (direction) {
          case "up":
            y = -distance
            break
          case "down":
            y = distance
            break
          case "left":
            x = -distance
            break
          case "right":
            x = distance
            break
        }

        gsap.set(element, {
          x,
          y,
          ease: easing,
        })

        setOffset(distance)
      },
    })

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => {
        if (trigger.vars.trigger === element) {
          trigger.kill()
        }
      })
    }
  }, [speed, direction, easing, start, end, ScrollTrigger, gsap])

  return { ref, offset }
}

export function calculateParallax(scrollY: number, speed: number, direction: "up" | "down" | "left" | "right" = "up"): { x: number; y: number } {
  const distance = scrollY * speed

  switch (direction) {
    case "up":
      return { x: 0, y: -distance }
    case "down":
      return { x: 0, y: distance }
    case "left":
      return { x: -distance, y: 0 }
    case "right":
      return { x: distance, y: 0 }
    default:
      return { x: 0, y: -distance }
  }
}

