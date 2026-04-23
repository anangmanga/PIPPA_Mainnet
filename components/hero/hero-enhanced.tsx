"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import Image from "next/image"

export function HeroEnhanced() {
  return (
    <section className="relative w-full overflow-hidden bg-linear-to-r from-primary/20 to-accent/20 pt-24 pb-16 sm:pt-28 sm:pb-20 md:py-24">
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <Image src="/bg/1.png" alt="Background" fill className="object-cover" />
      </div>

      <div className="relative flex flex-col items-center justify-center gap-4 text-center px-4 sm:px-6">
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
          Welcome to <span className="text-primary">PIPPA</span>
        </h1>
        <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl">
          Turning digital finance into a joyful, accessible experience. Join our pie-loving community bridging crypto,
          culture, and creativity.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2 w-full sm:w-auto">
          <Button asChild size="lg" className="w-full sm:w-auto text-base sm:text-lg rounded-full bg-linear-to-b from-[#FFD54F] via-[#FFB300] to-[#FF8F00] hover:from-[#FFE082] hover:via-[#FFCA28] hover:to-[#FFA000] text-white border border-[#FF8F00] font-bold uppercase shadow-[0_4px_14px_0_rgba(255,179,0,0.5)] transition-all" style={{ textShadow: "0px 1px 2px rgba(180, 100, 0, 0.8)" }}>
            <Link href="/explore">Explore Collection</Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="w-full sm:w-auto text-base sm:text-lg bg-transparent rounded-full">
            <Link href="/community">Join Community</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
