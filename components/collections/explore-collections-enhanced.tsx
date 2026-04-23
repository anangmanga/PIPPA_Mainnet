"use client"

import { ScrollReveal } from "@/components/animations/scroll-reveal"
import { ExploreCollections } from "@/components/collections/explore-collections"
import type { ComponentProps } from "react"

type ExploreCollectionsEnhancedProps = ComponentProps<typeof ExploreCollections>

export function ExploreCollectionsEnhanced(props: ExploreCollectionsEnhancedProps) {
  return (
    <ScrollReveal animation="slideUp" delay={0.2}>
      <ExploreCollections {...props} />
    </ScrollReveal>
  )
}

