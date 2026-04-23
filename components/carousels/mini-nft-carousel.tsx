"use client"

import { useRef, useEffect } from "react"
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@/components/ui/carousel"
import { useAnimation } from "@/lib/animation-context"
import Image from "next/image"
import Link from "next/link"

interface NFT {
  id: string
  name: string
  image: string
  price?: string
  rarity?: string
}

interface MiniNFTCarouselProps {
  nfts: NFT[]
  title?: string
}

export function MiniNFTCarousel({ nfts, title = "Featured NFTs" }: MiniNFTCarouselProps) {
  const carouselRef = useRef<HTMLDivElement>(null)
  const { gsap } = useAnimation()

  useEffect(() => {
    if (!carouselRef.current) return

    const items = carouselRef.current.querySelectorAll(".carousel-item")
    
    items.forEach((item) => {
      const element = item as HTMLElement
      
      const handleMouseEnter = () => {
        gsap.to(element, {
          scale: 1.05,
          y: -10,
          duration: 0.3,
          ease: "power2.out",
        })
      }

      const handleMouseLeave = () => {
        gsap.to(element, {
          scale: 1,
          y: 0,
          duration: 0.3,
          ease: "power2.out",
        })
      }

      element.addEventListener("mouseenter", handleMouseEnter)
      element.addEventListener("mouseleave", handleMouseLeave)

      return () => {
        element.removeEventListener("mouseenter", handleMouseEnter)
        element.removeEventListener("mouseleave", handleMouseLeave)
      }
    })
  }, [gsap, nfts])

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      {title && (
        <h2 className="text-4xl font-bold mb-8 text-center">{title}</h2>
      )}
      <Carousel
        opts={{
          align: "start",
          loop: true,
        }}
        className="w-full"
      >
        <CarouselContent ref={carouselRef} className="-ml-2 md:-ml-4">
          {nfts.map((nft) => (
            <CarouselItem key={nft.id} className="pl-2 md:pl-4 basis-full sm:basis-1/2 lg:basis-1/4">
              <Link href={`/nft/${nft.id}`}>
                <div className="group rounded-lg border border-border overflow-hidden hover:shadow-xl transition-all duration-300 bg-card carousel-card">
                  <div className="relative w-full aspect-square overflow-hidden bg-muted">
                    <Image
                      src={nft.image || "/placeholder.svg"}
                      alt={nft.name}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-lg mb-1 truncate">{nft.name}</h3>
                    {nft.price && (
                      <p className="text-sm text-muted-foreground">{nft.price} π</p>
                    )}
                    {nft.rarity && (
                      <span className="inline-block mt-2 px-2 py-1 text-xs rounded bg-primary/10 text-primary">
                        {nft.rarity}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="left-4" />
        <CarouselNext className="right-4" />
      </Carousel>
    </section>
  )
}

