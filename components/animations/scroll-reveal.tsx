"use client"

import { useEffect, useRef, ReactNode } from "react"
import { useAnimation } from "@/lib/animation-context"

interface ScrollRevealProps {
  children: ReactNode
  className?: string
  animation?: "fadeIn" | "slideUp" | "slideDown" | "slideLeft" | "slideRight" | "scale" | "parallax" | "imageReveal" | "rotate"
  delay?: number
  duration?: number
  start?: string
  once?: boolean
  parallaxSpeed?: number
  stagger?: boolean
  staggerDelay?: number
  imageSrc?: string
}

export function ScrollReveal({
  children,
  className = "",
  animation = "fadeIn",
  delay = 0,
  duration = 1,
  start = "top 80%",
  once = true,
  parallaxSpeed = 0.5,
  stagger = false,
  staggerDelay = 0.1,
  imageSrc,
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null)
  const { gsap, ScrollTrigger } = useAnimation()

  useEffect(() => {
    if (!ref.current) return

    const element = ref.current

    // Set initial state based on animation type
    const initialStates: Record<string, gsap.TweenVars> = {
      fadeIn: { opacity: 0 },
      slideUp: { opacity: 0, y: 50 },
      slideDown: { opacity: 0, y: -50 },
      slideLeft: { opacity: 0, x: 50 },
      slideRight: { opacity: 0, x: -50 },
      scale: { opacity: 0, scale: 0.8 },
      parallax: { opacity: 0, y: 100 },
      imageReveal: { opacity: 0, scale: 1.2, clipPath: "inset(0% 0% 100% 0%)" },
      rotate: { opacity: 0, rotation: -15, scale: 0.9 },
    }

    const finalStates: Record<string, gsap.TweenVars> = {
      fadeIn: { opacity: 1 },
      slideUp: { opacity: 1, y: 0 },
      slideDown: { opacity: 1, y: 0 },
      slideLeft: { opacity: 1, x: 0 },
      slideRight: { opacity: 1, x: 0 },
      scale: { opacity: 1, scale: 1 },
      parallax: { opacity: 1, y: 0 },
      imageReveal: { opacity: 1, scale: 1, clipPath: "inset(0% 0% 0% 0%)" },
      rotate: { opacity: 1, rotation: 0, scale: 1 },
    }

    gsap.set(element, initialStates[animation])

    // Handle stagger for children
    if (stagger && element.children.length > 0) {
      const childrenArray = Array.from(element.children) as HTMLElement[]
      gsap.set(childrenArray, initialStates[animation])

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: element,
          start,
          toggleActions: once ? "play none none none" : "play none none reverse",
          once,
        },
      })

      // Animate wrapper to visible first
      tl.to(element, {
        ...finalStates[animation],
        duration: 0.3,
        delay,
        ease: "power3.out",
      })

      // Then stagger children
      tl.to(childrenArray, {
        ...finalStates[animation],
        duration,
        stagger: staggerDelay,
        ease: "power3.out",
      })
    } else {
      // Parallax effect - continuous movement
      if (animation === "parallax") {
        ScrollTrigger.create({
          trigger: element,
          start,
          end: "bottom top",
          scrub: true,
          onUpdate: (self) => {
            const progress = self.progress
            const y = (progress - 0.5) * parallaxSpeed * 100
            gsap.set(element, {
              y,
              opacity: Math.min(1, progress * 2),
            })
          },
        })
      } else {
        // Standard animation
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: element,
            start,
            toggleActions: once ? "play none none none" : "play none none reverse",
            once,
          },
        })

        tl.to(element, {
          ...finalStates[animation],
          duration,
          delay,
          ease: "power3.out",
        })
      }
    }

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => {
        if (trigger.vars.trigger === element) {
          trigger.kill()
        }
      })
    }
  }, [animation, delay, duration, start, once, parallaxSpeed, stagger, staggerDelay, gsap, ScrollTrigger])

  return (
    <div
      ref={ref}
      className={className}
      style={{
        willChange: animation === "parallax" ? "transform, opacity" : "opacity, transform",
      }}
    >
      {imageSrc && (
        <div className="absolute inset-0 overflow-hidden">
          <img src={imageSrc} alt="" className="w-full h-full object-cover" loading="lazy" />
        </div>
      )}
      {children}
    </div>
  )
}

