"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import { useAnimation } from "@/lib/animation-context"

interface ImageRevealProps {
  src: string
  alt?: string
  className?: string
  revealDirection?: "left" | "right" | "up" | "down" | "scale"
  delay?: number
  duration?: number
  start?: string
}

export function ImageReveal({
  src,
  alt = "",
  className = "",
  revealDirection = "up",
  delay = 0,
  duration = 1,
  start = "top 80%",
}: ImageRevealProps) {
  const ref = useRef<HTMLDivElement>(null)
  const { gsap, ScrollTrigger } = useAnimation()
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    if (!ref.current) return

    const element = ref.current
    const image = element.querySelector("img")

    if (!image) return

    const initialStates: Record<string, gsap.TweenVars> = {
      up: { y: 100, opacity: 0 },
      down: { y: -100, opacity: 0 },
      left: { x: 100, opacity: 0 },
      right: { x: -100, opacity: 0 },
      scale: { scale: 0.8, opacity: 0 },
    }

    const finalStates: Record<string, gsap.TweenVars> = {
      up: { y: 0, opacity: 1 },
      down: { y: 0, opacity: 1 },
      left: { x: 0, opacity: 1 },
      right: { x: 0, opacity: 1 },
      scale: { scale: 1, opacity: 1 },
    }

    gsap.set(image, initialStates[revealDirection])

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: element,
        start,
        toggleActions: "play none none none",
      },
    })

    tl.to(image, {
      ...finalStates[revealDirection],
      duration,
      delay,
      ease: "power3.out",
    })

    image.addEventListener("load", () => setLoaded(true))
    if (image.complete) setLoaded(true)

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => {
        if (trigger.vars.trigger === element) {
          trigger.kill()
        }
      })
    }
  }, [revealDirection, delay, duration, start, gsap, ScrollTrigger])

  return (
    <div ref={ref} className={`relative overflow-hidden ${className}`}>
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover transition-opacity duration-300"
        style={{ opacity: loaded ? 1 : 0 }}
        quality={90}
      />
    </div>
  )
}

