"use client"

import { ScrollReveal } from "@/components/animations/scroll-reveal"
import Link from "next/link"
import { ArrowUpRight } from "lucide-react"
import Image from "next/image"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

type CommunityLinkItem = {
  id?: string
  name: string
  description?: string | null
  icon?: string | null
  url: string
}

type CommunitySectionProps = {
  links?: CommunityLinkItem[]
}

const fallbackLinks: CommunityLinkItem[] = [
  {
    name: "Pippa Media",
    description: "Inspire, participate, and create with your fellow Pippas.",
    icon: "📱",
    url: "https://twitter.com/pippanft",
  },
  {
    name: "YouTube",
    description: "Watch lore, updates, and community highlights from the Pippa world.",
    icon: "▶️",
    url: "https://www.youtube.com/@Pippa.thepie",
  },
]

export function CommunitySection({ links }: CommunitySectionProps) {
  const items = links && links.length > 0 ? links : fallbackLinks

  return (
    <ScrollReveal animation="fadeIn" delay={0.2}>
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-16 section-overlap bg-background/95 backdrop-blur-sm">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {items.map((link, index) => {
            const heading = (link.name || "PIPPA COMMUNITY").toUpperCase()

            return (
              <ScrollReveal key={link.id ?? link.name} animation={index === 0 ? "slideRight" : "slideLeft"} delay={index * 0.1}>
                <Card className="bg-card/95 backdrop-blur-sm border border-border rounded-2xl hover:border-primary transition-all duration-300 h-full overflow-hidden relative">
                  <CardHeader className="p-6 sm:p-8 md:p-10">
                    <div className="flex items-start justify-between gap-4 mb-6">
                      <div className="flex-1">
                        <CardTitle className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 text-foreground" style={{ fontFamily: "'Fjalla One', sans-serif" }}>
                          {heading}
                        </CardTitle>
                        <CardDescription className="text-sm sm:text-base text-muted-foreground">
                          {link.description ?? "Connect with fellow collectors and stay in the loop."}
                        </CardDescription>
                      </div>
                      <span className="text-4xl sm:text-5xl md:text-6xl">{link.icon ?? "✨"}</span>
                    </div>
                  </CardHeader>

                  <CardContent className="px-6 sm:px-8 md:px-10 pb-6 sm:pb-8 md:pb-10">
                    <Link href={link.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-3 sm:gap-4 group">
                      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full border-2 border-foreground flex items-center justify-center group-hover:bg-foreground transition-colors">
                        <ArrowUpRight className="w-5 h-5 sm:w-6 sm:h-6 text-foreground group-hover:text-background transition-colors" />
                      </div>
                      <span className="text-base sm:text-lg md:text-xl font-bold uppercase tracking-wide">Visit</span>
                    </Link>
                  </CardContent>

                  {/* Character Image */}
                  <div className={`absolute bottom-0 ${index % 2 === 0 ? "right-0" : "left-0"} w-28 h-28 sm:w-36 sm:h-36 md:w-48 md:h-48 opacity-10 pointer-events-none`}>
                    <Image
                      src={`/bg/${(index % 3) + 1}.png`}
                      alt="Pippa Character"
                      fill
                      className="object-contain"
                    />
                  </div>
                </Card>
              </ScrollReveal>
            )
          })}
        </div>
      </section>
    </ScrollReveal>
  )
}
