"use client"

import { useMemo, useState } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"
import Image from "next/image"

type GalleryNft = {
  id: string
  slug: string
  name: string
  subtitle?: string | null
  image: string
  rarity?: string | null
  traits?: string[]
  collectionName?: string | null
  collectionSlug?: string | null
  rank?: number | null
  score?: number | null
}

type NFTGalleryProps = {
  title?: string
  description?: string
  nfts: GalleryNft[]
}

export function NFTGallery({ title = "Pippa NFT Collection", description, nfts }: NFTGalleryProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [rarityFilter, setRarityFilter] = useState<string>("all")
  const [collectionFilter, setCollectionFilter] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("featured")

  const collectionOptions = useMemo(() => {
    const unique = new Set<string>()
    nfts.forEach((nft) => {
      if (nft.collectionName) {
        unique.add(nft.collectionName)
      }
    })
    return Array.from(unique)
  }, [nfts])

  const filteredAndSortedNFTs = useMemo(() => {
    const filtered = nfts.filter((nft) => {
      const haystack = [
        nft.name,
        nft.subtitle ?? "",
        nft.collectionName ?? "",
        ...(nft.traits ?? []),
      ]
        .join(" ")
        .toLowerCase()

      const matchesSearch = haystack.includes(searchQuery.toLowerCase())
      const matchesRarity = rarityFilter === "all" || (nft.rarity ?? "").toLowerCase() === rarityFilter.toLowerCase()
      const matchesCollection =
        collectionFilter === "all" || (nft.collectionName ?? "").toLowerCase() === collectionFilter.toLowerCase()

      return matchesSearch && matchesRarity && matchesCollection
    })

    const sorted = [...filtered]
    switch (sortBy) {
      case "name":
        sorted.sort((a, b) => a.name.localeCompare(b.name))
        break
      case "rank-asc":
        sorted.sort((a, b) => (a.rank ?? Number.POSITIVE_INFINITY) - (b.rank ?? Number.POSITIVE_INFINITY))
        break
      case "rank-desc":
        sorted.sort((a, b) => (b.rank ?? Number.NEGATIVE_INFINITY) - (a.rank ?? Number.NEGATIVE_INFINITY))
        break
      case "score":
        sorted.sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
        break
      default:
        break
    }

    return sorted
  }, [collectionFilter, nfts, rarityFilter, searchQuery, sortBy])

  const getRarityStyles = (rarity?: string | null) => {
    const key = rarity?.toLowerCase() ?? "default"
    const styles: Record<string, string> = {
      common: "bg-gray-500/15 text-gray-700 dark:text-gray-300",
      rare: "bg-blue-500/15 text-blue-600 dark:text-blue-300",
      epic: "bg-purple-500/15 text-purple-500 dark:text-purple-300",
      legendary: "bg-yellow-400/20 text-yellow-700 dark:text-yellow-300",
      default: "bg-muted text-muted-foreground",
    }
    return styles[key] ?? styles.default
  }

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <div className="text-center mb-12 space-y-4">
        <h1 className="text-4xl sm:text-5xl font-bold">{title}</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          {description ?? "Explore and bookmark your favourite Pippa characters across every collection drop."}
        </p>
      </div>

      <div className="mb-12 space-y-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <Input
            placeholder="Search by name, collection, or trait..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="md:max-w-sm"
          />

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <Select value={rarityFilter} onValueChange={setRarityFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Filter by rarity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All rarities</SelectItem>
                <SelectItem value="Common">Common</SelectItem>
                <SelectItem value="Uncommon">Uncommon</SelectItem>
                <SelectItem value="Rare">Rare</SelectItem>
                <SelectItem value="Epic">Epic</SelectItem>
                <SelectItem value="Legendary">Legendary</SelectItem>
              </SelectContent>
            </Select>

            <Select value={collectionFilter} onValueChange={setCollectionFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by collection" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All collections</SelectItem>
                {collectionOptions.map((collection) => (
                  <SelectItem key={collection} value={collection}>
                    {collection}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="featured">Featured order</SelectItem>
                <SelectItem value="name">Name: A – Z</SelectItem>
                <SelectItem value="rank-asc">Rank: Low → High</SelectItem>
                <SelectItem value="rank-desc">Rank: High → Low</SelectItem>
                <SelectItem value="score">Score</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="text-sm text-muted-foreground">
          Showing {filteredAndSortedNFTs.length} of {nfts.length} NFTs
        </div>
      </div>

      {filteredAndSortedNFTs.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredAndSortedNFTs.map((nft) => (
            <Card key={nft.id} className="overflow-hidden border border-border hover:shadow-xl transition-shadow group">
              <Link href={`/nft/${nft.slug}`}>
                <div className="relative overflow-hidden bg-muted aspect-square">
                  <Image
                    src={nft.image || "/placeholder.svg"}
                    alt={nft.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 25vw"
                  />
                  {nft.rarity && (
                    <Badge className={`absolute top-4 left-4 ${getRarityStyles(nft.rarity)}`}>{nft.rarity}</Badge>
                  )}
                  {typeof nft.rank === "number" && (
                    <Badge className="absolute top-4 right-4 bg-background/90 text-xs font-semibold">
                      Rank #{nft.rank}
                    </Badge>
                  )}
                </div>
              </Link>
              <div className="p-4 space-y-3">
                <Link href={`/nft/${nft.slug}`} className="block">
                  <h3 className="font-semibold text-lg leading-tight group-hover:text-primary transition-colors">
                    {nft.name}
                  </h3>
                  {nft.subtitle && <p className="text-sm text-muted-foreground">{nft.subtitle}</p>}
                </Link>
                {nft.collectionName && (
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    {nft.collectionName}
                  </p>
                )}
                {typeof nft.score === "number" && (
                  <p className="text-xs text-muted-foreground">Score {nft.score.toFixed(2)}</p>
                )}
                <Button size="sm" variant="outline" className="w-full bg-transparent">
                  View Details
                  </Button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <p className="text-lg text-muted-foreground">No NFTs found – adjust your filters and try again.</p>
        </div>
      )}
    </section>
  )
}