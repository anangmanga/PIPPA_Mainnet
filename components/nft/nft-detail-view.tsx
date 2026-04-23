"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, CheckCircle, Heart, Share2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

type NftAttribute = {
    name: string
    value: string
  rarity?: string | null
}

type NftHistoryItem = {
    event: string
    from: string
    to: string
    date: string
  note?: string | null
}

type RelatedNft = {
  id: string
  slug: string
  name: string
  image: string
  rarity?: string | null
}

type NFTDetailViewProps = {
  backHref?: string
  nft: {
    id: string
    slug: string
    name: string
    subtitle?: string | null
    description?: string | null
    image: string
    gallery?: string[]
    rarity?: string | null
    rank?: number | null
    score?: number | null
    attributes?: NftAttribute[] | null
    collectionName?: string | null
    collectionSlug?: string | null
    createdAt?: Date | string | null
    history?: NftHistoryItem[] | null
  }
  related?: RelatedNft[]
}

export function NFTDetailView({ backHref = "/explore", nft, related = [] }: NFTDetailViewProps) {
  const [isLiked, setIsLiked] = useState(false)
  const [shareOpen, setShareOpen] = useState(false)

  const attributes: NftAttribute[] = useMemo(() => {
    if (!nft.attributes) return []
    if (Array.isArray(nft.attributes)) {
      return nft.attributes as NftAttribute[]
    }
    return []
  }, [nft.attributes])

  const history: NftHistoryItem[] = useMemo(() => {
    if (!nft.history) return []
    if (Array.isArray(nft.history)) {
      return nft.history
    }
    return []
  }, [nft.history])

  const rarityStyles = (rarity?: string | null) => {
    const key = rarity?.toLowerCase()
    const palette: Record<string, string> = {
      common: "bg-gray-500/15 text-gray-700 dark:text-gray-300",
      rare: "bg-blue-500/15 text-blue-600 dark:text-blue-300",
      epic: "bg-purple-500/15 text-purple-500 dark:text-purple-300",
      legendary: "bg-yellow-400/20 text-yellow-700 dark:text-yellow-300",
    }
    return key ? palette[key] ?? "bg-muted text-muted-foreground" : "bg-muted text-muted-foreground"
  }

  const createdDateLabel = useMemo(() => {
    if (!nft.createdAt) return undefined
    const date = nft.createdAt instanceof Date ? nft.createdAt : new Date(nft.createdAt)
    return date.toLocaleDateString()
  }, [nft.createdAt])

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link href={backHref} className="inline-flex items-center gap-2 text-primary hover:text-primary/80 mb-8">
        <ArrowLeft className="w-5 h-5" />
        Back
      </Link>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
        <aside className="lg:col-span-1 space-y-4">
          <Card className="overflow-hidden border border-border sticky top-6">
            <div className="relative aspect-square bg-muted">
              <Image
                src={nft.image || "/placeholder.svg"}
                alt={nft.name}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 30vw"
              />
              {nft.rarity && (
                <Badge className={`absolute top-4 left-4 ${rarityStyles(nft.rarity)}`}>{nft.rarity}</Badge>
              )}
              {typeof nft.rank === "number" && (
                <Badge className="absolute top-4 right-4 bg-background/90 text-xs font-semibold">Rank #{nft.rank}</Badge>
              )}
            </div>

            {Array.isArray(nft.gallery) && nft.gallery.length > 0 && (
              <div className="grid grid-cols-4 gap-2 p-4 border-t border-border">
                {nft.gallery.slice(0, 8).map((thumb, index) => (
                  <div key={index} className="relative aspect-square overflow-hidden rounded border border-border/60">
                    <Image src={thumb || "/placeholder.svg"} alt={`${nft.name} thumbnail ${index + 1}`} fill className="object-cover" />
                  </div>
                ))}
              </div>
            )}

            <div className="p-6 space-y-4 bg-card">
              <div className="flex items-center gap-3">
                <Button
                  variant="default"
                  className="flex-1"
                  onClick={() => setIsLiked((prev) => !prev)}
                >
                  <Heart className={`mr-2 h-4 w-4 ${isLiked ? "fill-current text-red-500" : ""}`} />
                  {isLiked ? "Favourited" : "Add to favourites"}
                </Button>
                <Button
                  variant="outline"
                  className="bg-transparent"
                  onClick={() => setShareOpen((prev) => !prev)}
                >
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>

              {shareOpen && (
                <Card className="p-4 bg-muted border border-border text-sm space-y-3">
                  <p className="font-semibold text-foreground">Share this NFT</p>
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" size="sm" className="bg-transparent">
                      Copy link
                      </Button>
                    <Button variant="outline" size="sm" className="bg-transparent">
                      Share
                      </Button>
                  </div>
                </Card>
              )}
            </div>
          </Card>
        </aside>

        <div className="lg:col-span-2 space-y-8">
          <header className="space-y-3">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h1 className="text-4xl font-bold leading-tight">{nft.name}</h1>
                {nft.subtitle && <p className="text-lg text-muted-foreground">{nft.subtitle}</p>}
                {nft.collectionName && (
                  <p className="text-sm text-muted-foreground">
                    Part of the{" "}
                    {nft.collectionSlug ? (
                      <Link href={`/collections/${nft.collectionSlug}`} className="underline-offset-2 hover:underline">
                        {nft.collectionName}
                      </Link>
                    ) : (
                      nft.collectionName
                    )}
                  </p>
                )}
              </div>
              {typeof nft.score === "number" && (
                <Badge className="self-start bg-background/80 text-sm font-semibold">Score {nft.score.toFixed(2)}</Badge>
              )}
            </div>
            {nft.description && <p className="text-muted-foreground">{nft.description}</p>}
          </header>

          <Card className="p-6 border border-border bg-secondary/40">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Rarity</p>
                <p className="text-xl font-semibold">{nft.rarity ?? "Unknown"}</p>
              </div>
              {typeof nft.rank === "number" && (
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Rank</p>
                  <p className="text-xl font-semibold">#{nft.rank}</p>
                </div>
              )}
              {createdDateLabel && (
              <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Released</p>
                  <p className="text-xl font-semibold">{createdDateLabel}</p>
              </div>
              )}
            </div>
          </Card>

          <Tabs defaultValue={attributes.length > 0 ? "properties" : "details"} className="w-full">
            <TabsList className="grid w-full grid-cols-3 sm:w-auto sm:min-w-[320px]">
              <TabsTrigger value="properties">Properties</TabsTrigger>
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
            </TabsList>

            <TabsContent value="properties" className="mt-6">
              {attributes.length > 0 ? (
                <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                  {attributes.map((attribute, index) => (
                    <Card key={`${attribute.name}-${index}`} className="p-4 bg-muted border border-border text-center">
                      <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">{attribute.name}</p>
                      <p className="font-semibold">{attribute.value}</p>
                      {attribute.rarity && <Badge className="mt-2 text-xs">{attribute.rarity}</Badge>}
                  </Card>
                ))}
              </div>
              ) : (
                <div className="rounded border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                  No attribute metadata provided for this NFT yet.
                </div>
              )}
            </TabsContent>

            <TabsContent value="details" className="mt-6">
              <Card className="divide-y divide-border border border-border">
                <div className="flex items-center justify-between px-4 py-3">
                  <span className="text-muted-foreground">Collection</span>
                  <span className="font-medium">{nft.collectionName ?? "Unassigned"}</span>
                </div>
                {typeof nft.score === "number" && (
                  <div className="flex items-center justify-between px-4 py-3">
                    <span className="text-muted-foreground">Score</span>
                    <span className="font-medium">{nft.score.toFixed(2)}</span>
                </div>
                )}
                {createdDateLabel && (
                  <div className="flex items-center justify-between px-4 py-3">
                  <span className="text-muted-foreground">Created</span>
                    <span className="font-medium">{createdDateLabel}</span>
                </div>
                )}
              </Card>
            </TabsContent>

            <TabsContent value="history" className="mt-6 space-y-4">
              {history.length > 0 ? (
                history.map((item, index) => (
                  <Card key={`${item.event}-${index}`} className="p-4 bg-muted border border-border">
                    <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      <span className="font-semibold">{item.event}</span>
                      </div>
                      <span className="text-xs text-muted-foreground uppercase tracking-wide">{item.date}</span>
                    </div>
                    <div className="mt-3 space-y-1 text-sm text-muted-foreground">
                    <p>
                        From <code className="rounded bg-background px-2 py-1">{item.from}</code>
                    </p>
                    <p>
                        To <code className="rounded bg-background px-2 py-1">{item.to}</code>
                    </p>
                      {item.note && <p>{item.note}</p>}
                  </div>
                </Card>
                ))
              ) : (
                <div className="rounded border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                  Historical activity will appear here once the collection begins recording provenance.
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <div className="mt-20 border-t border-border pt-12">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-3xl font-bold">More from this collection</h2>
          <Link href={backHref} className="text-sm text-primary hover:text-primary/80">
            Browse full gallery
          </Link>
        </div>

        {related.length > 0 ? (
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((relatedNft) => (
              <Link key={relatedNft.id} href={`/nft/${relatedNft.slug}`}>
                <Card className="overflow-hidden border border-border hover:shadow-lg transition-shadow group">
                  <div className="relative h-48 overflow-hidden bg-muted">
                    <Image
                      src={relatedNft.image || "/placeholder.svg"}
                      alt={relatedNft.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    {relatedNft.rarity && (
                      <Badge className={`absolute top-3 right-3 ${rarityStyles(relatedNft.rarity)}`}>
                      {relatedNft.rarity}
                    </Badge>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold group-hover:text-primary transition-colors">{relatedNft.name}</h3>
                  </div>
                </Card>
              </Link>
            ))}
        </div>
        ) : (
          <div className="mt-8 rounded border border-dashed border-border p-6 text-center text-muted-foreground">
            No additional NFTs linked yet. Add more items to this collection to populate the carousel.
          </div>
        )}
      </div>
    </section>
  )
}