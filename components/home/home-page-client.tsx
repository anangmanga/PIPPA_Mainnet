'use client'

import { useEffect, useRef, useState } from "react"
import { Header } from "@/components/layout/header"
import { HeroEnhanced } from "@/components/hero/hero-enhanced"
import { WelcomeCard } from "@/components/sections/welcome-card"
import { ExploreCollectionsEnhanced } from "@/components/collections/explore-collections-enhanced"
import { MerchandisePromoSection } from "@/components/sections/merchandise-promo-section"
import { CommunitySection } from "@/components/sections/community-section"
import { Collections } from "@/components/collections/collections"
import { FeaturedNFTsEnhanced } from "@/components/nft/featured-nfts-enhanced"
import { Footer } from "@/components/layout/footer"
import { ScrollReveal } from "@/components/animations/scroll-reveal"
import { useAnimation } from "@/lib/animation-context"
import { usePiNetwork } from "@/components/providers/pi-network-provider"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import type { ComponentProps } from "react"

type PromoContent = {
  heading?: string | null
  subheading?: string | null
  body?: string | null
  ctaLabel?: string | null
  ctaUrl?: string | null
  mediaUrl?: string | null
}

type CommunityLinkItem = {
  id: string
  name: string
  description?: string | null
  icon?: string | null
  url: string
}

type FooterLinkItem = {
  id: string
  label: string
  href: string
}

type HomePageClientProps = {
  collections: ComponentProps<typeof ExploreCollectionsEnhanced>["collections"]
  featuredNfts: ComponentProps<typeof FeaturedNFTsEnhanced>["nfts"]
  welcomePromo?: PromoContent
  merchandisePromo?: PromoContent
  lorePromo?: PromoContent
  communityLinks: CommunityLinkItem[]
  footerLinks: FooterLinkItem[]
  footerCallout?: PromoContent
}

export function HomePageClient({
  collections,
  featuredNfts,
  welcomePromo,
  merchandisePromo,
  lorePromo,
  communityLinks,
  footerLinks,
  footerCallout,
}: HomePageClientProps) {
  const mainRef = useRef<HTMLElement>(null)
  const { gsap, ScrollTrigger } = useAnimation()
  const { isAuthenticated, isLoading } = usePiNetwork()
  const router = useRouter()
  const [canRender, setCanRender] = useState(false)

  useEffect(() => {
    if (isAuthenticated) {
      setCanRender(true)
      return
    }

    setCanRender(false)

    if (!isLoading) {
      router.replace("/welcome")
    }
  }, [isAuthenticated, isLoading, router])

  useEffect(() => {
    if (!canRender || !mainRef.current) return

    const shouldOverlap = typeof window !== "undefined" && window.matchMedia("(min-width: 1024px)").matches
    if (!shouldOverlap) {
      return
    }

    const sections = mainRef.current.querySelectorAll(".section-overlap")

    sections.forEach((section, index) => {
      if (index === 0) return

      const currentSection = section as HTMLElement

      gsap.set(currentSection, {
        zIndex: 10 + index,
        position: "relative",
      })

      ScrollTrigger.create({
        trigger: currentSection,
        start: "top bottom",
        end: "top 60%",
        scrub: 1,
        onEnter: () => {
          gsap.to(currentSection, {
            y: -120,
            duration: 0.8,
            ease: "power2.out",
          })
        },
        onLeaveBack: () => {
          gsap.to(currentSection, {
            y: 0,
            duration: 0.8,
            ease: "power2.out",
          })
        },
      })
    })

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => {
        if (trigger.vars.trigger && Array.from(sections).includes(trigger.vars.trigger as Element)) {
          trigger.kill()
        }
      })
    }
  }, [canRender, gsap, ScrollTrigger])

  if (!canRender) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <main ref={mainRef} className="min-h-screen bg-transparent">
      <Header />

      <ScrollReveal animation="fadeIn">
        <HeroEnhanced />
      </ScrollReveal>

      <WelcomeCard promo={welcomePromo} />

      <ExploreCollectionsEnhanced collections={collections} />

      <ScrollReveal animation="fadeIn" delay={0.2}>
        <FeaturedNFTsEnhanced nfts={featuredNfts} />
      </ScrollReveal>

      <ScrollReveal animation="fadeIn" delay={0.1}>
        <MerchandisePromoSection leftPromo={merchandisePromo} rightPromo={lorePromo} />
      </ScrollReveal>

      <ScrollReveal animation="fadeIn" delay={0.1}>
        <CommunitySection links={communityLinks} />
      </ScrollReveal>

      <ScrollReveal animation="fadeIn" stagger={true} staggerDelay={0.2}>
        <Collections />
      </ScrollReveal>

      <ScrollReveal animation="fadeIn" delay={0.1}>
        <Footer links={footerLinks} callout={footerCallout} />
      </ScrollReveal>
    </main>
  )
}