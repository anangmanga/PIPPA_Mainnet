"use client"

import { ScrollReveal } from "@/components/animations/scroll-reveal"
import Link from "next/link"
import { ArrowUpRight } from "lucide-react"
import Image from "next/image"

type PromoContent = {
  heading?: string | null
  subheading?: string | null
  body?: string | null
  ctaLabel?: string | null
  ctaUrl?: string | null
  mediaUrl?: string | null
}

type MerchandisePromoSectionProps = {
  leftPromo?: PromoContent
  rightPromo?: PromoContent
}

const fallbackLeft: PromoContent = {
  heading: "SHOP TOYS &\nFIGURINES",
  subheading: "START YOUR COLLECTION TODAY!",
  ctaLabel: "SHOP NOW",
  ctaUrl: "/merchandise",
  mediaUrl: "/bg/1.png",
}

const fallbackRight: PromoContent = {
  heading: "THE PIPPA\nPROPHECY",
  subheading: "LEARN ABOUT THE PIPPA LORE",
  ctaLabel: "DISCOVER",
  ctaUrl: "/roadmap",
  mediaUrl: "/bg/2.png",
}

function splitHeading(heading?: string | null) {
  return heading?.split("\n").filter(Boolean) ?? []
}

export function MerchandisePromoSection({ leftPromo, rightPromo }: MerchandisePromoSectionProps) {
  const primary = leftPromo ?? fallbackLeft
  const secondary = rightPromo ?? fallbackRight

  const leftHeadingLines = splitHeading(primary.heading)
  const rightHeadingLines = splitHeading(secondary.heading)

  const leftCtaHref = primary.ctaUrl || fallbackLeft.ctaUrl!
  const leftCtaLabel = primary.ctaLabel || fallbackLeft.ctaLabel!

  const rightCtaHref = secondary.ctaUrl || fallbackRight.ctaUrl!
  const rightCtaLabel = secondary.ctaLabel || fallbackRight.ctaLabel!

  const leftImageSrc =
    primary.mediaUrl && !primary.mediaUrl.toLowerCase().endsWith(".mp4")
      ? primary.mediaUrl
      : fallbackLeft.mediaUrl!

  const rightImageSrc =
    secondary.mediaUrl && !secondary.mediaUrl.toLowerCase().endsWith(".mp4")
      ? secondary.mediaUrl
      : fallbackRight.mediaUrl!

  return (
    <ScrollReveal animation="fadeIn" delay={0.2}>
      <section className="w-full py-12 sm:py-16 lg:py-20 section-overlap bg-background/95 backdrop-blur-sm">
        <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[420px] gap-6 lg:gap-0">
          {/* Left Section - Merchandise */}
          <div className="bg-primary/10 relative overflow-hidden flex flex-col justify-between p-6 sm:p-8 lg:p-16 rounded-xl lg:rounded-none">
            <ScrollReveal animation="slideUp" delay={0.1}>
              <div>
                <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-3 text-foreground font-['Fjalla_One',sans-serif]">
                  {leftHeadingLines.length > 0
                    ? leftHeadingLines.map((line, index) => (
                        <span key={index} className="block">
                          {line}
                        </span>
                      ))
                    : fallbackLeft.heading!.split("\n").map((line, index) => (
                        <span key={index} className="block">
                          {line}
                        </span>
                      ))}
                </h2>
                <p className="text-base sm:text-lg text-muted-foreground mb-6">
                  {primary.subheading || fallbackLeft.subheading}
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal animation="slideUp" delay={0.3}>
              <Link href={leftCtaHref} className="inline-flex items-center gap-3 sm:gap-4 group">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full border-2 border-foreground flex items-center justify-center group-hover:bg-foreground transition-colors">
                  <ArrowUpRight className="w-5 h-5 sm:w-6 sm:h-6 text-foreground group-hover:text-background transition-colors" />
                </div>
                <span className="text-lg sm:text-xl font-bold uppercase tracking-wide">{leftCtaLabel}</span>
              </Link>
            </ScrollReveal>

            {/* Character Image */}
            <div className="pointer-events-none absolute bottom-0 right-0 w-40 h-40 sm:w-48 sm:h-48 md:w-64 md:h-64 opacity-20">
              <Image
                src={leftImageSrc}
                alt="Pippa Character"
                fill
                className="object-contain"
              />
            </div>
          </div>

          {/* Right Section - Lore/Prophecy */}
          <div className="bg-accent/10 relative overflow-hidden flex flex-col justify-between p-6 sm:p-8 lg:p-16 rounded-xl lg:rounded-none">
            <ScrollReveal animation="slideUp" delay={0.2}>
              <div>
                <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-3 text-foreground font-['Fjalla_One',sans-serif]">
                  {rightHeadingLines.length > 0
                    ? rightHeadingLines.map((line, index) => (
                        <span key={index} className="block">
                          {line}
                        </span>
                      ))
                    : fallbackRight.heading!.split("\n").map((line, index) => (
                        <span key={index} className="block">
                          {line}
                        </span>
                      ))}
                </h2>
                <p className="text-base sm:text-lg text-muted-foreground mb-6">
                  {secondary.subheading || fallbackRight.subheading}
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal animation="slideUp" delay={0.4}>
              <Link href={rightCtaHref} className="inline-flex items-center gap-3 sm:gap-4 group">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full border-2 border-foreground flex items-center justify-center group-hover:bg-foreground transition-colors">
                  <ArrowUpRight className="w-5 h-5 sm:w-6 sm:h-6 text-foreground group-hover:text-background transition-colors" />
                </div>
                <span className="text-lg sm:text-xl font-bold uppercase tracking-wide">{rightCtaLabel}</span>
              </Link>
            </ScrollReveal>

            {/* Character Image */}
            <div className="pointer-events-none absolute bottom-0 left-0 w-40 h-40 sm:w-48 sm:h-48 md:w-64 md:h-64 opacity-20">
              <Image
                src={rightImageSrc}
                alt="Pippa Character"
                fill
                className="object-contain"
              />
            </div>
          </div>
        </div>
      </section>
    </ScrollReveal>
  )
}

