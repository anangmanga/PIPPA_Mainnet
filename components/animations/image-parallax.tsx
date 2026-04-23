"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import { useParallax } from "@/lib/parallax"

interface ImageParallaxProps {
  src: string
  alt?: string
  speed?: number
  direction?: "up" | "down" | "left" | "right"
  className?: string
  scale?: number
}

export function ImageParallax({
  src,
  alt = "",
  speed = 0.5,
  direction = "up",
  className = "",
  scale = 1.1,
}: ImageParallaxProps) {
  const { ref } = useParallax({ speed, direction })
  const [loaded, setLoaded] = useState(false)

  return (
    <div ref={ref as React.RefObject<HTMLDivElement>} className={`relative overflow-hidden ${className}`}>
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover transition-opacity duration-500"
        style={{ opacity: loaded ? 1 : 0, transform: `scale(${scale})` }}
        onLoad={() => setLoaded(true)}
        quality={90}
      />
    </div>
  )
}

