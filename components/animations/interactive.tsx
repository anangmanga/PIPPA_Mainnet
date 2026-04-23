"use client"

import { useEffect, useRef, ReactNode } from "react"
import { useAnimation } from "@/lib/animation-context"
import Link from "next/link"

interface MagneticButtonProps {
  children: ReactNode
  className?: string
  strength?: number
  as?: "button" | "a" | typeof Link
  href?: string
  onClick?: () => void
  target?: string
  rel?: string
}

export function MagneticButton({
  children,
  className = "",
  strength = 0.3,
  as: Component = "button",
  href,
  onClick,
  target,
  rel,
}: MagneticButtonProps) {
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

  if (Component === Link && href) {
    return (
      <Link ref={ref as any} href={href} className={className} onClick={onClick} target={target} rel={rel}>
        {children}
      </Link>
    )
  }

  if (Component === "a" && href) {
    return (
      <a ref={ref as any} href={href} className={className} onClick={onClick} target={target} rel={rel}>
        {children}
      </a>
    )
  }

  return (
    <button ref={ref as any} className={className} onClick={onClick}>
      {children}
    </button>
  )
}

