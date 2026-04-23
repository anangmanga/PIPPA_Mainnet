"use client"

import { useEffect, useRef } from "react"
import { useAnimation } from "@/lib/animation-context"

interface SplitTextProps {
  children: string
  className?: string
  animation?: "fadeIn" | "slideUp" | "slideDown" | "slideLeft" | "slideRight"
  delay?: number
  stagger?: number
  start?: string
}

export function SplitText({
  children,
  className = "",
  animation = "fadeIn",
  delay = 0,
  stagger = 0.02,
  start = "top 80%",
}: SplitTextProps) {
  const ref = useRef<HTMLDivElement>(null)
  const { gsap, ScrollTrigger } = useAnimation()

  useEffect(() => {
    if (!ref.current) return

    const element = ref.current
    const words = children.split(" ")
    const letters: HTMLSpanElement[] = []

    // Clear and split into letters
    element.innerHTML = ""
    words.forEach((word, wordIndex) => {
      const wordSpan = document.createElement("span")
      wordSpan.style.display = "inline-block"
      wordSpan.style.marginRight = "0.25em"

      word.split("").forEach((letter, letterIndex) => {
        const letterSpan = document.createElement("span")
        letterSpan.style.display = "inline-block"
        letterSpan.textContent = letter === " " ? "\u00A0" : letter
        letters.push(letterSpan)
        wordSpan.appendChild(letterSpan)
      })

      element.appendChild(wordSpan)
    })

    const initialStates: Record<string, gsap.TweenVars> = {
      fadeIn: { opacity: 0 },
      slideUp: { opacity: 0, y: 50 },
      slideDown: { opacity: 0, y: -50 },
      slideLeft: { opacity: 0, x: 50 },
      slideRight: { opacity: 0, x: -50 },
    }

    const finalStates: Record<string, gsap.TweenVars> = {
      fadeIn: { opacity: 1 },
      slideUp: { opacity: 1, y: 0 },
      slideDown: { opacity: 1, y: 0 },
      slideLeft: { opacity: 1, x: 0 },
      slideRight: { opacity: 1, x: 0 },
    }

    gsap.set(letters, initialStates[animation])

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: element,
        start,
        toggleActions: "play none none none",
      },
    })

    tl.to(letters, {
      ...finalStates[animation],
      duration: 0.5,
      delay,
      stagger,
      ease: "power3.out",
    })

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => {
        if (trigger.vars.trigger === element) {
          trigger.kill()
        }
      })
    }
  }, [children, animation, delay, stagger, start, gsap, ScrollTrigger])

  return (
    <div ref={ref} className={`inline-block ${className}`}>
      {children}
    </div>
  )
}

