"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

const collections = [
  {
    id: 1,
    title: "About Pippa",
    description: "Learn the story behind Pippa and what makes her so delightful!",
    icon: "📖",
    href: "/explore#about-pippa",
  },
  {
    id: 2,
    title: "Roadmap",
    description: "Explore our future plans and the exciting journey ahead for the collection.",
    icon: "🗺️",
    href: "/roadmap",
  },
]

export function Collections() {
  return (
    <section className="relative w-full py-16 md:py-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12">
          <header className="text-center space-y-4">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight" style={{ fontFamily: "'Fjalla One', sans-serif" }}>
              Pippa Collections
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground max-w-3xl mx-auto">
              Discover curated sets crafted by the community and the creators of Pippa Pie. Every drop introduces new lore, art styles, and collectability.
        </p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
        {collections.map((collection) => (
          <Card key={collection.id} className="p-8 hover:shadow-lg transition-shadow border border-border">
            <div className="text-5xl mb-4">{collection.icon}</div>
            <h3 className="text-xl font-bold mb-3">{collection.title}</h3>
            <p className="text-muted-foreground mb-6">{collection.description}</p>
            <Button variant="outline" className="w-full bg-transparent" asChild>
              <Link href={collection.href}>Learn More</Link>
            </Button>
          </Card>
        ))}
          </div>
        </div>
      </div>
    </section>
  )
}
