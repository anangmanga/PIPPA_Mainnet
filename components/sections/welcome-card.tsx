"use client"

import { ScrollReveal } from "@/components/animations/scroll-reveal"

type WelcomeCardPromo = {
  heading?: string | null
  subheading?: string | null
  body?: string | null
  mediaUrl?: string | null
}

type WelcomeCardProps = {
  promo?: WelcomeCardPromo
}

const fallbackHeading = "Welcome to the World of Pippa"
const fallbackBody = [
  "Born from a Pi Day experiment on the Pi Network’s utility‑driven blockchain, Pippa is a sentient pie with a spark of smart‑contract consciousness. As Pi grew into a global ecosystem built on real‑world utility, Pippa became its warm, playful symbol of community and creativity.",
  "Now Pippa travels across digital worlds, inspiring pioneers to build, collaborate, and explore what a people‑powered blockchain can become—one slice at a time.",
]

export function WelcomeCard({ promo }: WelcomeCardProps) {
  const heading = promo?.heading?.trim() || fallbackHeading
  const subheading = promo?.subheading?.trim()
  const paragraphs =
    promo?.body
      ?.split(/\n{2,}/)
      .map((paragraph) => paragraph.trim())
      .filter(Boolean) ?? fallbackBody
  const mediaUrl = promo?.mediaUrl || "/bg/IMG-20260417-WA0278.jpg"

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 section-overlap bg-background/95 backdrop-blur-sm">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 min-h-[600px]">
        {/* Image Section - right */}
        <div className="flex items-center justify-center">
          <ScrollReveal animation="slideRight" delay={0.1}>
            <div className="relative w-full max-w-md aspect-square rounded-lg overflow-hidden bg-muted shadow-2xl border-8 border-border">
              <img
                src={mediaUrl}
                alt={heading}
                className="w-full h-full object-cover"
              />
            </div>
          </ScrollReveal>
        </div>

        {/* Welcome Card - Right */}
        <div className="flex items-center justify-center">
          <ScrollReveal animation="slideLeft" delay={0.3}>
            <div className="bg-card/95 backdrop-blur-sm border border-border rounded-lg p-6 md:p-10 shadow-xl w-full">
              <div className="space-y-3 text-foreground/90 leading-relaxed">
                <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground">{heading}</h2>
                {subheading && <p className="text-sm md:text-base text-muted-foreground">{subheading}</p>}
                {paragraphs.map((paragraph, index) => (
                  <p key={index} className="text-sm md:text-base">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  )
}

