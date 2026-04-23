import type { Prisma } from "@prisma/client"
import { prisma } from "@/lib/prisma"

export type NftRecord = {
  id: string
  slug: string
  name: string
  subtitle: string | null
  description: string | null
  image: string
  gallery: string[]
  rarity: string | null
  rank: number | null
  score: number | null
  attributes: Prisma.JsonValue | null
  supplyNumber: number | null
  externalUrl: string | null
  isFeatured: boolean
  displayOrder: number
  collectionId: string
  createdAt: Date
  updatedAt: Date
}

export type NftWithCollection = NftRecord & {
  collection: {
    id: string
    slug: string
    name: string
  } | null
}

export type CollectionWithRelations = {
  id: string
  slug: string
  name: string
  summary: string | null
  heroCopy: string | null
  heroImage: string | null
  verified: boolean
  mintingUrl: string | null
  displayOrder: number | null
  createdAt: Date
  updatedAt: Date
  traits: Array<{
    id: string
    name: string
    values: string
    displayOrder: number
  }>
  rarityTiers: Array<{
    id: string
    name: string
    percentage: string
    color: string | null
    description: string | null
    displayOrder: number
  }>
  media: Array<{
    id: string
    type: string
    src: string
    alt: string | null
    speed: number | null
    direction: string | null
    opacity: number | null
    scale: number | null
  }>
  nfts: NftRecord[]
}

export async function getCollectionsWithRelations(): Promise<CollectionWithRelations[]> {
  const collections = await (prisma as any).collection.findMany({
    orderBy: { displayOrder: "asc" },
    include: {
      traits: { orderBy: { displayOrder: "asc" } },
      rarityTiers: { orderBy: { displayOrder: "asc" } },
      media: true,
      nfts: {
        orderBy: [{ displayOrder: "asc" }, { createdAt: "desc" }],
      },
    },
  })

  return collections as CollectionWithRelations[]
}

type GetNftOptions = {
  featuredOnly?: boolean
  collectionId?: string
  limit?: number
}

export async function getNfts(options: GetNftOptions = {}): Promise<NftWithCollection[]> {
  const { featuredOnly, collectionId, limit } = options

  const nfts = await (prisma as any).nft.findMany({
    where: {
      ...(featuredOnly ? { isFeatured: true } : {}),
      ...(collectionId ? { collectionId } : {}),
    },
    orderBy: [{ displayOrder: "asc" }, { createdAt: "desc" }],
    take: limit,
    include: {
      collection: true,
    },
  })

  return nfts as NftWithCollection[]
}

export async function getFeaturedNfts(limit = 12) {
  return getNfts({ featuredOnly: true, limit })
}

export async function getCollectionNfts(collectionId: string, limit?: number) {
  return getNfts({ collectionId, limit })
}

export async function getNftBySlug(slug: string) {
  const nft = await (prisma as any).nft.findUnique({
    where: { slug },
    include: {
      collection: true,
    },
  })

  return nft as NftWithCollection | null
}
