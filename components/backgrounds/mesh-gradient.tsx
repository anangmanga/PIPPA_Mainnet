"use client"

import { useEffect, useRef } from "react"
import { useAnimation } from "@/lib/animation-context"

interface MeshGradientProps {
  colors?: string[]
  className?: string
  intensity?: number
  speed?: number
}

export function MeshGradient({
  colors = ["#ff6b6b", "#4ecdc4", "#45b7d1", "#f9ca24"],
  className = "",
  intensity = 1,
  speed = 1,
}: MeshGradientProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { gsap } = useAnimation()
  const animationRef = useRef<number | undefined>(undefined)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const resizeCanvas = () => {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }

    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)

    let time = 0

    const animate = () => {
      time += 0.01 * speed
      const width = canvas.width
      const height = canvas.height

      ctx.clearRect(0, 0, width, height)

      // Create animated gradient mesh
      const gradient1 = ctx.createRadialGradient(
        width * 0.3 + Math.sin(time) * 50,
        height * 0.3 + Math.cos(time) * 50,
        0,
        width * 0.3 + Math.sin(time) * 50,
        height * 0.3 + Math.cos(time) * 50,
        width * 0.5
      )
      gradient1.addColorStop(0, colors[0] + "80")
      gradient1.addColorStop(1, colors[0] + "00")

      const gradient2 = ctx.createRadialGradient(
        width * 0.7 + Math.cos(time * 0.8) * 50,
        height * 0.7 + Math.sin(time * 0.8) * 50,
        0,
        width * 0.7 + Math.cos(time * 0.8) * 50,
        height * 0.7 + Math.sin(time * 0.8) * 50,
        width * 0.5
      )
      gradient2.addColorStop(0, colors[1] + "80")
      gradient2.addColorStop(1, colors[1] + "00")

      const gradient3 = ctx.createRadialGradient(
        width * 0.5 + Math.sin(time * 1.2) * 30,
        height * 0.5 + Math.cos(time * 1.2) * 30,
        0,
        width * 0.5 + Math.sin(time * 1.2) * 30,
        height * 0.5 + Math.cos(time * 1.2) * 30,
        width * 0.4
      )
      gradient3.addColorStop(0, colors[2] + "60")
      gradient3.addColorStop(1, colors[2] + "00")

      ctx.globalAlpha = intensity
      ctx.fillStyle = gradient1
      ctx.fillRect(0, 0, width, height)
      ctx.fillStyle = gradient2
      ctx.fillRect(0, 0, width, height)
      ctx.fillStyle = gradient3
      ctx.fillRect(0, 0, width, height)
      ctx.globalAlpha = 1

      animationRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener("resize", resizeCanvas)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [colors, intensity, speed])

  return <canvas ref={canvasRef} className={`absolute inset-0 w-full h-full ${className}`} />
}

