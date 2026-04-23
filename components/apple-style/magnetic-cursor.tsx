"use client"

import { useEffect, useState } from "react"
import { useAnimation } from "@/lib/animation-context"

interface MagneticCursorProps {
  enabled?: boolean
  size?: number
  scale?: number
}

export function MagneticCursor({ enabled = true, size = 20, scale = 1.5 }: MagneticCursorProps) {
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isHovering, setIsHovering] = useState(false)
  const { gsap } = useAnimation()

  useEffect(() => {
    if (!enabled) return

    const cursor = document.createElement("div")
    cursor.className = "fixed pointer-events-none z-[9999] mix-blend-difference"
    cursor.style.width = `${size}px`
    cursor.style.height = `${size}px`
    cursor.style.borderRadius = "50%"
    cursor.style.backgroundColor = "white"
    cursor.style.transform = "translate(-50%, -50%)"
    cursor.style.transition = "transform 0.15s ease-out"
    document.body.appendChild(cursor)

    let mouseX = 0
    let mouseY = 0
    let cursorX = 0
    let cursorY = 0

    const updateCursor = () => {
      const currentScale = isHovering ? scale : 1
      cursor.style.transform = `translate(-50%, -50%) scale(${currentScale})`
      
      cursorX += (mouseX - cursorX) * 0.1
      cursorY += (mouseY - cursorY) * 0.1
      
      cursor.style.left = `${cursorX}px`
      cursor.style.top = `${cursorY}px`
      
      requestAnimationFrame(updateCursor)
    }

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX
      mouseY = e.clientY
    }

    const handleMouseEnter = () => setIsHovering(true)
    const handleMouseLeave = () => setIsHovering(false)

    // Add hover listeners to interactive elements
    const interactiveElements = document.querySelectorAll("a, button, [role='button']")
    interactiveElements.forEach((el) => {
      el.addEventListener("mouseenter", handleMouseEnter)
      el.addEventListener("mouseleave", handleMouseLeave)
    })

    document.addEventListener("mousemove", handleMouseMove)
    updateCursor()

    // Hide default cursor
    document.body.style.cursor = "none"

    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      interactiveElements.forEach((el) => {
        el.removeEventListener("mouseenter", handleMouseEnter)
        el.removeEventListener("mouseleave", handleMouseLeave)
      })
      document.body.style.cursor = ""
      cursor.remove()
    }
  }, [enabled, size, scale, isHovering])

  return null
}

