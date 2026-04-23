"use client"

import Image from "next/image"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

type CharacterHighlight = {
  id: string
  name: string
  description?: string | null
  image: string
  traits?: string[]
  variants?: number | null
}

type CharacterShowcaseProps = {
  heading?: string
  subheading?: string
  characters: CharacterHighlight[]
}

export function CharacterShowcase({
  heading = "Meet the Characters",
  subheading = "Get to know the unique personalities in the Pippa universe.",
  characters,
}: CharacterShowcaseProps) {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 bg-secondary/50">
      <div className="text-center mb-12 space-y-4">
        <h2 className="text-3xl sm:text-4xl font-bold">{heading}</h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">{subheading}</p>
      </div>

      {characters.length > 0 ? (
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
        {characters.map((character) => (
            <Card key={character.id} className="overflow-hidden border border-border hover:shadow-lg transition-shadow">
              <div className="relative h-80 overflow-hidden bg-muted">
                <Image
                src={character.image || "/placeholder.svg"}
                alt={character.name}
                  fill
                  className="object-cover transition-transform duration-500 hover:scale-105"
              />
            </div>
              <div className="p-6 space-y-4">
                <div>
                  <h3 className="text-2xl font-bold">{character.name}</h3>
                  {character.description && <p className="text-muted-foreground mt-2">{character.description}</p>}
                </div>

                {character.traits && character.traits.length > 0 && (
                  <div>
                    <p className="text-sm font-semibold mb-2">Traits</p>
                <div className="flex flex-wrap gap-2">
                  {character.traits.map((trait) => (
                    <Badge key={trait} variant="secondary">
                      {trait}
                    </Badge>
                  ))}
                </div>
              </div>
                )}

                {typeof character.variants === "number" && (
              <p className="text-sm text-muted-foreground">
                <span className="font-semibold">{character.variants}</span> variants available
              </p>
                )}
            </div>
          </Card>
        ))}
      </div>
      ) : (
        <div className="rounded border border-dashed border-border p-10 text-center text-muted-foreground">
          Character highlights will appear here once you feature them from the admin dashboard.
        </div>
      )}
    </section>
  )
}