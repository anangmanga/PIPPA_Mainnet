"use client"

import { ScrollReveal } from "@/components/animations/scroll-reveal"
import Image from "next/image"
import Link from "next/link"

type FeaturedNftItem = {
  id: string
  slug: string
  name: string
  subtitle?: string | null
  image: string
  rarity?: string | null
  collectionName?: string
  collectionSlug?: string
}

type FeaturedNFTsEnhancedProps = {
  nfts: FeaturedNftItem[]
}

export function FeaturedNFTsEnhanced({ nfts }: FeaturedNFTsEnhancedProps) {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-10 section-overlap bg-background/95 backdrop-blur-sm">
      <ScrollReveal animation="fadeIn" delay={0.1}>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 text-center">Meet the Pippa Collection</h2>
        <p className="text-sm sm:text-base text-muted-foreground text-center mb-8 sm:mb-10 max-w-2xl mx-auto">
          Explore our unique collection of Pippa characters, each with their own personality and traits.
        </p>
      </ScrollReveal>
      <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
        {nfts.length > 0 ? (
          nfts.map((nft, index) => (
            <ScrollReveal key={nft.id} animation="fadeIn" delay={0.1 + index * 0.05}>
              <Link href={`/nft/${nft.slug}`}>
                <div className="group rounded-lg border border-border overflow-hidden hover:shadow-xl transition-all duration-300 bg-card hover:border-primary cursor-pointer">
                  <div className="relative w-full aspect-square overflow-hidden bg-muted">
                    <Image
                      src={nft.image || "/placeholder.svg"}
                      alt={nft.name}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-300"
                      loading={index < 6 ? "eager" : "lazy"}
                    />
                    {nft.rarity && (
                      <span className="absolute top-3 left-3 inline-flex rounded-full bg-background/90 px-2 py-1 text-xs font-semibold uppercase tracking-wide">
                        {nft.rarity}
                      </span>
                    )}
                  </div>
                  <div className="p-3 space-y-1">
                    <h3 className="font-semibold text-sm leading-tight">{nft.name}</h3>
                    {nft.subtitle && <p className="text-xs text-muted-foreground">{nft.subtitle}</p>}
                    {nft.collectionName && (
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">
                        {nft.collectionName}
                      </p>
                    )}
                  </div>
                </div>
              </Link>
            </ScrollReveal>
          ))
        ) : (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            No featured NFTs yet.
          </div>
        )}
      </div>
    </section>
  )
}