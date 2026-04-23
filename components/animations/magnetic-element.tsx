"use client"

import { useEffect, useRef, ReactNode } from "react"
import { useAnimation } from "@/lib/animation-context"

interface MagneticElementProps {
  children: ReactNode
  className?: string
  strength?: number
  as?: keyof JSX.IntrinsicElements
}

export function MagneticElement({ children, className = "", strength = 0.3, as: Component = "div" }: MagneticElementProps) {
  const ref = useRef<HTMLElement>(null)
  const { gsap } = useAnimation()

  useEffect(() => {
    if (!ref.current) return

    const element = ref.current

    const handleMouseMove = (e: MouseEvent) => {
      const rect = element.getBoundingClientRect()
      const x = e.clientX - rect.left - rect.width / 2
      const y = e.clientY - rect.top - rect.height / 2

      gsap.to(element, {
        x: x * strength,
        y: y * strength,
        duration: 0.5,
        ease: "power2.out",
      })
    }

    const handleMouseLeave = () => {
      gsap.to(element, {
        x: 0,
        y: 0,
        duration: 0.5,
        ease: "power2.out",
      })
    }

    element.addEventListener("mousemove", handleMouseMove)
    element.addEventListener("mouseleave", handleMouseLeave)

    return () => {
      element.removeEventListener("mousemove", handleMouseMove)
      element.removeEventListener("mouseleave", handleMouseLeave)
    }
  }, [strength, gsap])

  return (
    <Component ref={ref as any} className={className}>
      {children}
    </Component>
  )
}

