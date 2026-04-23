"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { Search, Check } from "lucide-react"
import Image from "next/image"

type ExploreCollectionItem = {
  id: string
  name: string
  image?: string | null
  verified: boolean
  mintingUrl?: string | null
  totalNfts?: number
}

type ExploreCollectionsProps = {
  collections: ExploreCollectionItem[]
}

export function ExploreCollections({ collections }: ExploreCollectionsProps) {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredCollections = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()

    return collections.filter((collection) =>
      collection.name.toLowerCase().includes(term)
    )
  }, [collections, searchTerm])

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 section-overlap bg-background/95 backdrop-blur-sm">
      <div className="text-center mb-8">
        <h2 className="text-3xl sm:text-4xl font-bold mb-3">Available Collections</h2>
        <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
          Explore our unique NFT collections and discover your next favorite Pippa character
        </p>
      </div>

      {/* Search Bar */}
      <div className="max-w-md mx-auto mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
          <input
            type="text"
            placeholder="Search collections..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      {/* Collections Grid */}
      {filteredCollections.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredCollections.map((collection) => (
            <div
              key={collection.id}
              className="group rounded-lg border border-border overflow-hidden hover:shadow-lg transition-all duration-300 bg-card"
            >
              {/* Image Container */}
              <div className="relative w-full aspect-square overflow-hidden bg-muted">
                <Image
                  key={collection.image ?? collection.id}
                  src={collection.image || "/placeholder.svg"}
                  alt={collection.name}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                {collection.verified && (
                  <div className="absolute top-3 right-3 p-1.5 rounded-full bg-primary/90 backdrop-blur">
                    <Check size={16} className="text-primary-foreground" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="p-4 flex flex-col">
                <h3 className="font-semibold text-lg mb-2 truncate">{collection.name}</h3>
                {typeof collection.totalNfts === "number" && (
                  <p className="text-sm text-muted-foreground mb-3">{collection.totalNfts} NFTs</p>
                )}
                <Link
                  href="/roadmap"
                  className="mt-4 px-4 py-2 rounded-lg text-sm font-medium bg-primary text-primary-foreground hover:opacity-90 transition-opacity text-center"
                >
                  View Roadmap
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <p className="text-muted-foreground">No collections found matching your search.</p>
        </div>
      )}
    </section>
  )
}

