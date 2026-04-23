import { HomePageClient } from "@/components/home/home-page-client"
import { getCollectionsWithRelations, getFeaturedNfts } from "@/lib/data/collections"
import { getCommunityLinks, getFooterLinks, getPromoBlocksByPlacement } from "@/lib/data/promotions"

export const revalidate = 0
export const dynamic = "force-dynamic"

type PromoPlacementKey = Parameters<typeof getPromoBlocksByPlacement>[0][number]

const PromoPlacement = {
  MERCHANDISE_HERO: "MERCHANDISE_HERO",
  WELCOME_NARRATIVE: "WELCOME_NARRATIVE",
  COMMUNITY_CALLOUT: "COMMUNITY_CALLOUT",
  FOOTER_CALLOUT: "FOOTER_CALLOUT",
} as const satisfies Record<string, PromoPlacementKey>

function mapCollections(collections: Awaited<ReturnType<typeof getCollectionsWithRelations>>) {
  return collections.map((collection) => {
    const heroMedia = collection.media.find((mediaItem) => mediaItem.type === "HERO")

    return {
      id: collection.id,
      name: collection.name,
      image: collection.heroImage || heroMedia?.src || "/placeholder.svg",
      verified: collection.verified,
      mintingUrl: collection.mintingUrl,
    }
  })
}

function mapFeaturedNfts(featured: Awaited<ReturnType<typeof getFeaturedNfts>>) {
  return featured.map((nft) => ({
    id: nft.id,
    slug: nft.slug,
    name: nft.name,
    subtitle: nft.subtitle ?? undefined,
    image: nft.image,
    rarity: nft.rarity ?? undefined,
    collectionName: nft.collection?.name ?? undefined,
    collectionSlug: nft.collection?.slug ?? undefined,
  }))
}

function mapPromo(promo: Awaited<ReturnType<typeof getPromoBlocksByPlacement>>[PromoPlacementKey] | undefined) {
  if (!promo) return undefined

  return {
    heading: promo.heading ?? undefined,
    subheading: promo.subheading ?? undefined,
    body: promo.body ?? undefined,
    ctaLabel: promo.ctaLabel ?? undefined,
    ctaUrl: promo.ctaUrl ?? undefined,
    mediaUrl: promo.mediaUrl ?? undefined,
  }
}

function mapCommunityLinks(links: Awaited<ReturnType<typeof getCommunityLinks>>) {
  return links.map((link: Awaited<ReturnType<typeof getCommunityLinks>>[number]) => ({
    id: link.id,
    name: link.name,
    description: link.description ?? undefined,
    icon: link.icon ?? undefined,
    url: link.url,
  }))
}

function mapFooterLinks(links: Awaited<ReturnType<typeof getFooterLinks>>) {
  return links.map((link: Awaited<ReturnType<typeof getFooterLinks>>[number]) => ({
    id: link.id,
    label: link.label,
    href: link.href,
  }))
}

export default async function Home() {
  const promoPlacements: PromoPlacementKey[] = [
    PromoPlacement.MERCHANDISE_HERO,
    PromoPlacement.WELCOME_NARRATIVE,
    PromoPlacement.COMMUNITY_CALLOUT,
    PromoPlacement.FOOTER_CALLOUT,
  ]

  const [collections, featuredNfts, promoMap, communityLinks, footerLinks] = await Promise.all([
    getCollectionsWithRelations(),
    getFeaturedNfts(),
    getPromoBlocksByPlacement(promoPlacements),
    getCommunityLinks(),
    getFooterLinks(),
  ])

  const collectionCards = mapCollections(collections)
  const featured = mapFeaturedNfts(featuredNfts)

  return (
    <HomePageClient
      collections={collectionCards}
      featuredNfts={featured}
      welcomePromo={mapPromo(promoMap[PromoPlacement.WELCOME_NARRATIVE])}
      merchandisePromo={mapPromo(promoMap[PromoPlacement.MERCHANDISE_HERO])}
      lorePromo={mapPromo(promoMap[PromoPlacement.COMMUNITY_CALLOUT])}
      footerCallout={mapPromo(promoMap[PromoPlacement.FOOTER_CALLOUT])}
      communityLinks={mapCommunityLinks(communityLinks)}
      footerLinks={mapFooterLinks(footerLinks)}
    />
  )
}
