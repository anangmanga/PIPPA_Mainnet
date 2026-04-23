"use client"

import { ReactNode, useRef, useEffect } from "react"
import Image from "next/image"
import { useAnimation } from "@/lib/animation-context"

interface ParallaxBackgroundProps {
  children?: ReactNode
  images: Array<{
    src: string
    alt?: string
    speed?: number
    direction?: "up" | "down" | "left" | "right"
    opacity?: number
    scale?: number
  }>
  className?: string
  overlay?: boolean
  overlayColor?: string
}

export function ParallaxBackground({
  children,
  images,
  className = "",
  overlay = true,
  overlayColor = "rgba(0, 0, 0, 0.3)",
}: ParallaxBackgroundProps) {
  return (
    <div className={`relative w-full h-full overflow-hidden ${className}`}>
      {images.map((image, index) => {
        const LayerComponent = ({ image, index }: { image: typeof images[0]; index: number }) => {
          const layerRef = useRef<HTMLDivElement>(null)
          const { ScrollTrigger, gsap } = useAnimation()

          useEffect(() => {
            if (!layerRef.current) return

            const element = layerRef.current
            const speed = image.speed || 0.3 + index * 0.1
            const direction = image.direction || "up"

            ScrollTrigger.create({
              trigger: element.parentElement || element,
              start: "top bottom",
              end: "bottom top",
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

                gsap.set(element, { x, y })
              },
            })

            return () => {
              ScrollTrigger.getAll().forEach((trigger) => {
                if (trigger.vars.trigger === element || trigger.vars.trigger === element.parentElement) {
                  trigger.kill()
                }
              })
            }
          }, [image.speed, image.direction, index, ScrollTrigger, gsap])

          return (
            <div
              ref={layerRef}
              className="absolute inset-0"
              style={{
                opacity: image.opacity || 1,
                transform: `scale(${image.scale || 1.1})`,
                zIndex: index,
                willChange: "transform",
              }}
            >
              <Image
                src={image.src}
                alt={image.alt || `Background layer ${index + 1}`}
                fill
                className="object-cover"
                priority={index === 0}
                quality={85}
                loading={index === 0 ? "eager" : "lazy"}
              />
            </div>
          )
        }

        return <LayerComponent key={index} image={image} index={index} />
      })}
      {overlay && <div className="absolute inset-0 z-10" style={{ backgroundColor: overlayColor }} />}
      {children && <div className="relative z-20">{children}</div>}
    </div>
  )
}

