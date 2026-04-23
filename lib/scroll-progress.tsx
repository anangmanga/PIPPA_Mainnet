"use client"

import { useEffect, useState } from "react"
import { useAnimation } from "@/lib/animation-context"

interface ScrollProgressReturn {
  progress: number
  scrollY: number
  windowHeight: number
  documentHeight: number
}

export function useScrollProgress(): ScrollProgressReturn {
  const [progress, setProgress] = useState(0)
  const [scrollY, setScrollY] = useState(0)
  const [windowHeight, setWindowHeight] = useState(0)
  const [documentHeight, setDocumentHeight] = useState(0)
  const { ScrollTrigger } = useAnimation()

  useEffect(() => {
    const updateProgress = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop
      const winHeight = window.innerHeight
      const docHeight = document.documentElement.scrollHeight
      const currentScroll = scrollTop + winHeight
      const scrollPercent = (scrollTop / (docHeight - winHeight)) * 100

      setScrollY(scrollTop)
      setWindowHeight(winHeight)
      setDocumentHeight(docHeight)
      setProgress(Math.min(100, Math.max(0, scrollPercent)))
    }

     
    ScrollTrigger.create({
      start: "top top",
      end: "bottom bottom",
      onUpdate: (self) => {
        setProgress(self.progress * 100)
        setScrollY(window.scrollY)
        setWindowHeight(window.innerHeight)
        setDocumentHeight(document.documentElement.scrollHeight)
      },
    })

    updateProgress()

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => {
        if (trigger.vars.onUpdate) {
          trigger.kill()
        }
      })
    }
  }, [ScrollTrigger])

  return { progress, scrollY, windowHeight, documentHeight }
}

