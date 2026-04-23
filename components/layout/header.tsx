"use client"

import Link from "next/link"
import Image from "next/image"
import { useState, useEffect, useRef } from "react"
import { Menu, Moon, Sun } from "lucide-react"
import { useAnimation } from "@/lib/animation-context"

export function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const [isDark, setIsDark] = useState(false)
  const menuRef = useRef<HTMLDivElement | null>(null)
  const navRef = useRef<HTMLElement>(null)
  const menuButtonRef = useRef<HTMLButtonElement | null>(null)
  const { gsap } = useAnimation()

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/explore", label: "Explore" },
    { href: "/merchandise", label: "Merch" },
    { href: "/how-to-get", label: "How to Get" },
    { href: "/community", label: "Community" },
    { href: "/roadmap", label: "Roadmap" },
    { href: "/faq", label: "FAQ" }
  ]

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme")
    if (savedTheme) {
      setIsDark(savedTheme === "dark")
      document.documentElement.classList.toggle("dark", savedTheme === "dark")
    } else {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
      setIsDark(prefersDark)
      document.documentElement.classList.toggle("dark", prefersDark)
    }
  }, [])

  useEffect(() => {
    if (!navRef.current) return

    const nav = navRef.current
    const header = nav.parentElement
    
    nav.classList.add("bg-transparent-force")
    if (header) {
      header.setAttribute("data-transparent", "true")
    }

    let lastScroll = 0

    const handleScroll = () => {
      const currentScroll = window.scrollY

      if (currentScroll > 100) {
        if (currentScroll > lastScroll) {
          gsap.to(nav, {
            y: -140,
            duration: 0.3,
            ease: "power2.out",
          })
        } else {
          gsap.to(nav, {
            y: 0,
            duration: 0.3,
            ease: "power2.out",
          })
        }
      } else {
        gsap.to(nav, {
          y: 0,
          duration: 0.3,
          ease: "power2.out",
        })
      }

      lastScroll = currentScroll
    }

    window.addEventListener("scroll", handleScroll, { passive: true })

    return () => {
      window.removeEventListener("scroll", handleScroll)
    }
  }, [gsap])

  const toggleTheme = () => {
    const newIsDark = !isDark
    setIsDark(newIsDark)
    localStorage.setItem("theme", newIsDark ? "dark" : "light")
    document.documentElement.classList.toggle("dark", newIsDark)
  }

  useEffect(() => {
    if (!isOpen) return

    const updatePosition = () => {
      const button = menuButtonRef.current
      const menu = menuRef.current
      if (!button || !menu) return

      const rect = button.getBoundingClientRect()
      const gap = 12
      const desiredLeft = rect.left
      const viewportWidth = window.innerWidth
      const maxMenuWidth = Math.min(320, viewportWidth - 32)
      const safeLeft = Math.max(16, Math.min(desiredLeft, viewportWidth - maxMenuWidth - 16))
      const top = rect.bottom + gap

      menu.style.top = `${top}px`
      menu.style.left = `${safeLeft}px`
    }

    updatePosition()
    window.addEventListener("resize", updatePosition)
    window.addEventListener("scroll", updatePosition, { passive: true })

    return () => {
      window.removeEventListener("resize", updatePosition)
      window.removeEventListener("scroll", updatePosition)
    }
  }, [isOpen])

  return (
    <header id="header" className="relative">
      <nav 
        ref={navRef} 
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 sm:px-6 lg:px-8 py-4 pointer-events-auto"
      >
        <button
          ref={menuButtonRef}
          onClick={() => {
            setIsOpen((previous) => !previous)
          }}
          className="px-4 py-2 md:px-6 md:py-3 rounded-lg border border-white/25 bg-black/40 backdrop-blur-sm hover:bg-black/55 transition-colors font-semibold text-sm md:text-base uppercase text-white pointer-events-auto shadow-lg ml-2 sm:ml-4"
        >
          <span className="hidden sm:inline">Menu</span>
          <Menu className="sm:hidden text-white" size={20} />
        </button>

        <Link 
          href="/" 
          className="absolute left-1/2 -translate-x-1/2 pointer-events-auto"
        >
          <div className="w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center shadow-2xl overflow-hidden bg-black/35 backdrop-blur-sm border-2 border-white/35">
            <Image
              src="/bg/B5.png"
              alt="Pippa Pie Logo"
              width={56}
              height={56}
              className="w-full h-full object-cover"
            />
          </div>
        </Link>

        <Link
          href="/roadmap"
          className="px-4 py-2 md:px-6 md:py-3 rounded-full border border-[#FF8F00] bg-linear-to-b from-[#FFD54F] via-[#FFB300] to-[#FF8F00] hover:from-[#FFE082] hover:via-[#FFCA28] hover:to-[#FFA000] transition-all font-bold text-sm md:text-base uppercase text-white pointer-events-auto shadow-[0_4px_14px_0_rgba(255,179,0,0.5)] mr-2 sm:mr-4"
          style={{ textShadow: "0px 1px 2px rgba(180, 100, 0, 0.8)" }}
        >
          Roadmap
        </Link>
      </nav>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
          
          <div className="pointer-events-none">
            <nav
              ref={menuRef}
              className="fixed z-50 w-[min(320px,calc(100%-2.5rem))] rounded-2xl border border-white/15 bg-neutral-950/95 backdrop-blur-xl shadow-2xl pointer-events-auto text-white"
            >
              <div className="flex flex-col gap-1.5 py-3">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="mx-4 rounded-xl px-3 py-2 text-sm font-semibold uppercase tracking-wide text-white transition-colors hover:bg-white/10"
                  onClick={() => setIsOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
                <div className="mt-2 border-t border-white/15 pt-3">
                <button
                  onClick={toggleTheme}
                  className="mx-4 flex w-[calc(100%-2rem)] items-center justify-between rounded-xl border border-white/20 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-white transition-colors hover:bg-white/10"
                  aria-label="Toggle theme"
                >
                    <span>Theme</span>
                    {isDark ? <Sun size={18} className="text-white" /> : <Moon size={18} className="text-white" />}
                </button>
                </div>
              </div>
            </nav>
          </div>
        </>
      )}
    </header>
  )
}
