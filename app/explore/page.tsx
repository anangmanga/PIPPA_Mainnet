import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { HeroCarouselEnhanced } from "@/components/hero/hero-carousel-enhanced"
import { ScrollReveal } from "@/components/animations/scroll-reveal"
import { StickySection } from "@/components/apple-style/sticky-section"
import Image from "next/image"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ExploreCollections } from "@/components/collections/explore-collections"
import { getCollectionsWithRelations, type CollectionWithRelations } from "@/lib/data/collections"
import { cn } from "@/lib/utils"
import type { ComponentProps } from "react"

type ExploreCollectionsProps = ComponentProps<typeof ExploreCollections>
type ExploreCollectionItem = ExploreCollectionsProps["collections"][number]
type HeroCarouselProps = ComponentProps<typeof HeroCarouselEnhanced>
type CarouselCollection = HeroCarouselProps["collections"][number]

type StickyBackground = {
  src: string
  speed?: number
  direction?: "up" | "down" | "left" | "right"
  opacity?: number
  scale?: number
}

type TraitDisplay = {
  id: string
  name: string
  values: string
}

type RarityDisplay = {
  id: string
  name: string
  percentage: string
  color?: string | null
  description?: string | null
}

type CollectionEntity = CollectionWithRelations
type CollectionMediaEntity = CollectionEntity["media"][number]
type NftEntity = CollectionEntity["nfts"][number]

export const revalidate = 0
export const dynamic = "force-dynamic"

const fallbackTraits = [
  { id: "trait-base-color", name: "Base Color", values: "Golden, Chocolate, Strawberry" },
  { id: "trait-topping", name: "Topping", values: "Glazed, Fruity, Caramel, Rainbow" },
  { id: "trait-accessories", name: "Accessories", values: "Hats, Glasses, Jewelry, Props" },
  { id: "trait-expression", name: "Expression", values: "Happy, Cool, Chill, Excited" },
  { id: "trait-footwear", name: "Footwear", values: "Sneakers, Boots, Sandals" },
  { id: "trait-personality", name: "Personality", values: "Rare trait combinations" },
]

const fallbackRarityTiers = [
  { id: "rarity-common", name: "Common", percentage: "50%", color: "green", description: "Basic traits, widely available" },
  { id: "rarity-uncommon", name: "Uncommon", percentage: "30%", color: "blue", description: "Enhanced traits and unique combinations" },
  { id: "rarity-rare", name: "Rare", percentage: "15%", color: "purple", description: "Special accessories and rare trait combinations" },
  { id: "rarity-epic", name: "Epic", percentage: "4%", color: "orange", description: "Limited traits, highly sought after" },
  { id: "rarity-legendary", name: "Legendary", percentage: "1%", color: "yellow", description: "Rarest combinations, ultra exclusive" },
]

const rarityColorStyles: Record<string, { badge: string; border: string }> = {
  green: { badge: "bg-green-500 text-white", border: "border-green-500/30" },
  blue: { badge: "bg-blue-500 text-white", border: "border-blue-500/30" },
  purple: { badge: "bg-purple-500 text-white", border: "border-purple-500/30" },
  orange: { badge: "bg-orange-500 text-white", border: "border-orange-500/30" },
  yellow: { badge: "bg-yellow-500 text-foreground", border: "border-yellow-500/30" },
  default: { badge: "bg-primary text-primary-foreground", border: "border-border" },
}

function mapCollectionsForCarousel(collections: CollectionEntity[]): CarouselCollection[] {
  return collections.map((collection: CollectionEntity): CarouselCollection => {
    const heroMedia = collection.media.find(
      (mediaItem: CollectionMediaEntity) => mediaItem.type === "HERO"
    )

    const fallbackImage = collection.heroImage ?? heroMedia?.src ?? "/placeholder.svg"

    const item = {
      id: collection.id,
      name: collection.name,
      image: fallbackImage,
      verified: collection.verified,
      mintingUrl: collection.mintingUrl ?? undefined,
    } satisfies CarouselCollection

    return item
  })
}

function mapCollectionsForSearch(collections: CollectionEntity[]): ExploreCollectionItem[] {
  return collections.map((collection) => {
    const heroMedia = collection.media.find((mediaItem) => mediaItem.type === "HERO")
    const image = collection.heroImage ?? heroMedia?.src ?? "/placeholder.svg"

    return {
      id: collection.id,
      name: collection.name,
      image,
      verified: collection.verified,
      mintingUrl: collection.mintingUrl ?? undefined,
      totalNfts: collection.nfts.length,
    }
  })
}

function mapStickyBackgrounds(collections: CollectionEntity[]): StickyBackground[] {
  const primary = collections[0]
  if (!primary) {
    return []
  }

  return primary.media
    .filter((mediaItem: CollectionMediaEntity) => mediaItem.type === "BACKGROUND")
    .map((mediaItem: CollectionMediaEntity) => ({
      src: mediaItem.src,
      speed: mediaItem.speed ?? undefined,
      direction: (mediaItem.direction as StickyBackground["direction"]) ?? undefined,
      opacity: mediaItem.opacity ?? undefined,
      scale: mediaItem.scale ?? undefined,
    }))
}

function mapTraits(collections: CollectionEntity[]): TraitDisplay[] {
  const primary = collections[0]
  if (!primary) {
    return fallbackTraits
  }

  return primary.traits.length > 0 ? primary.traits : fallbackTraits
}

function mapRarityTiers(collections: CollectionEntity[]): RarityDisplay[] {
  const primary = collections[0]
  if (!primary) {
    return fallbackRarityTiers
  }

  return primary.rarityTiers.length > 0 ? primary.rarityTiers : fallbackRarityTiers
}

function mapNftForDisplay(nft: NftEntity, collection: CollectionEntity) {
  return {
    id: nft.id,
    slug: nft.slug,
    name: nft.name,
    subtitle: nft.subtitle ?? undefined,
    image: nft.image || "/placeholder.svg",
    rarity: nft.rarity ?? undefined,
    collectionName: collection.name,
    collectionSlug: collection.slug,
  }
}

export default async function ExplorePage() {
  const collections = await getCollectionsWithRelations()

  const carouselCollections = mapCollectionsForCarousel(collections)
  const searchableCollections = mapCollectionsForSearch(collections)
  const stickyBackgrounds = mapStickyBackgrounds(collections)
  const traits = mapTraits(collections)
  const rarityTiers = mapRarityTiers(collections)
  const totalNfts = 10000
  const allNfts = collections
    .flatMap((collection) =>
      collection.nfts.map((nft) => ({
        ...mapNftForDisplay(nft, collection),
      }))
    )
    .slice(0, 60)

  return (
    <main className="relative min-h-screen bg-transparent pt-16">
      <Header />

      {/* Hero Carousel */}
      <HeroCarouselEnhanced collections={carouselCollections} />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Collections Grid with Search */}
        <ScrollReveal animation="fadeIn" delay={0.2}>
          <ExploreCollections collections={searchableCollections} />
        </ScrollReveal>

        {/* Collection Info Section - Sticky */}
        <StickySection
          start="top top"
          end="+=200%"
          backgroundImages={stickyBackgrounds}
          showProgress={true}
          progressColor="rgba(59, 130, 246, 0.8)"
        >
          <ScrollReveal animation="fadeIn">
            <section className="max-w-6xl mx-auto px-4 py-12">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                <ScrollReveal animation="slideUp" delay={0}>
                  <div className="bg-card p-6 rounded-lg border">
                    <h3 className="text-sm font-semibold text-muted-foreground mb-2">Total Supply</h3>
                    <p className="text-3xl font-bold text-primary">{totalNfts}</p>
                    <p className="text-sm text-muted-foreground mt-1">Unique Pippa characters</p>
                  </div>
                </ScrollReveal>
                <ScrollReveal animation="slideUp" delay={0.1}>
                  <div className="bg-card p-6 rounded-lg border">
                    <h3 className="text-sm font-semibold text-muted-foreground mb-2">Network</h3>
                    <p className="text-3xl font-bold text-primary">Pi Network</p>
                    <p className="text-sm text-muted-foreground mt-1">Decentralized, Community-Owned</p>
                  </div>
                </ScrollReveal>
                <ScrollReveal animation="slideUp" delay={0.2}>
                  <div className="bg-card p-6 rounded-lg border">
                    <h3 className="text-sm font-semibold text-muted-foreground mb-2">Pi Day rarity</h3>
                    <p className="text-3xl font-bold text-primary">314</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      A signature rare number echoing Pi (3.14)—not the total collection size.
                    </p>
                  </div>
                </ScrollReveal>
              </div>

              {/* Tabs */}
              <Tabs defaultValue="about" className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-8">
                  <TabsTrigger value="about">About</TabsTrigger>
                  <TabsTrigger value="traits">Character Traits</TabsTrigger>
                  <TabsTrigger value="rarity">Rarity Guide</TabsTrigger>
                </TabsList>

                <TabsContent value="about" id="about-pippa" className="space-y-4 scroll-mt-24">
                  <ScrollReveal animation="fadeIn">
                    <h2 className="text-2xl font-bold">About Pippa</h2>
                    <p className="text-foreground/80 leading-relaxed">
                      Pippa is a unique NFT collection featuring adorable pi characters baked with love and creativity.
                      Each Pippa is a one-of-a-kind digital collectible with distinctive traits, accessories, and personalities.
                      The collection celebrates art, and fun in the crypto community.
                    </p>
                    <p className="text-foreground/80 leading-relaxed">
                      Built on Pi Network, Pippa NFTs are accessible to all Pi community members. Whether you're a collector,
                      artist, or NFT enthusiast, there's a Pippa waiting for you. Join the art world and start your Pippa collection today!
                    </p>
                  </ScrollReveal>
                </TabsContent>

                <TabsContent value="traits" className="space-y-4">
                  <ScrollReveal animation="fadeIn">
                    <h2 className="text-2xl font-bold">Character Traits</h2>
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                      {traits.map((trait, index) => (
                            <ScrollReveal key={trait.id} animation="scale" delay={index * 0.05}>
                              <div className="bg-card p-4 rounded-lg border">
                                <h3 className="font-semibold mb-2">{trait.name}</h3>
                                <p className="text-sm text-muted-foreground">{trait.values}</p>
                              </div>
                            </ScrollReveal>
                          ))}
                    </div>
                  </ScrollReveal>
                </TabsContent>

                <TabsContent value="rarity" className="space-y-4">
                  <ScrollReveal animation="fadeIn">
                    <h2 className="text-2xl font-bold">Rarity Tiers</h2>
                    <div className="space-y-3">
                      {rarityTiers.map((tier: RarityDisplay, index: number) => {
                        const colorKey = (tier.color ?? "").toLowerCase()
                        const styles = rarityColorStyles[colorKey] ?? rarityColorStyles.default

                        return (
                            <ScrollReveal key={tier.id} animation="slideLeft" delay={index * 0.1}>
                            <div className={cn("bg-card p-4 rounded-lg border", styles.border)}>
                              <div className="flex items-center justify-between mb-2">
                                  <h3 className="font-semibold">{tier.name}</h3>
                                <Badge className={styles.badge}>{tier.percentage}</Badge>
                                </div>
                                <p className="text-sm text-muted-foreground">{tier.description}</p>
                              </div>
                            </ScrollReveal>
                        )
                      })}
                    </div>
                  </ScrollReveal>
                </TabsContent>
              </Tabs>
            </section>
          </ScrollReveal>
        </StickySection>

        {/* Vast NFT Library */}
        <ScrollReveal animation="fadeIn" delay={0.3}>
          <section className="max-w-6xl mx-auto px-4 py-12">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-3xl font-bold mb-2">Vast NFT Library</h2>
                <p className="text-muted-foreground">
                  Preview a rotating sample of characters from across every collection. Tap into the detail view to explore traits and lore.
                </p>
              </div>
              <p className="text-sm text-muted-foreground">Displaying {allNfts.length} of {totalNfts} NFTs</p>
            </div>
            <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {allNfts.map((nft, index) => (
                <ScrollReveal key={nft.id} animation="scale" delay={index * 0.02}>
                  <article className="group bg-card rounded-lg overflow-hidden border transition-all hover:border-primary hover:shadow-lg">
                    <div className="relative aspect-square overflow-hidden bg-linear-to-br from-primary/10 to-accent/10">
                      <Image
                        src={nft.image}
                        alt={nft.name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      {nft.rarity && (
                        <Badge className="absolute top-3 left-3 bg-background/80 backdrop-blur text-xs font-medium">
                          {nft.rarity}
                        </Badge>
                      )}
                    </div>
                    <div className="p-4 space-y-2">
                      <div>
                        <p className="font-semibold leading-tight">{nft.name}</p>
                        {nft.subtitle && <p className="text-xs text-muted-foreground">{nft.subtitle}</p>}
                      </div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">{nft.collectionName}</p>
                    </div>
                  </article>
                </ScrollReveal>
              ))}
            </div>
          </section>
        </ScrollReveal>
      </div>

      <Footer />
    </main>
  )
}
