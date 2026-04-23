"use client"

import type { ComponentProps } from "react"

import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

type RoadmapPhaseStatus = "completed" | "current" | "upcoming"

type RoadmapPhase = {
  id: number
  label: string
  title: string
  goal: string
  highlights: string[]
  status: RoadmapPhaseStatus
}

const roadmapPhases: RoadmapPhase[] = [
  {
    id: 1,
    label: "Phase 1",
    title: "Artwork & Concept Development",
    goal: "Finalize character design styles and define traits and rarity tiers.",
    highlights: [
      "Create mood boards and sample characters.",
      "Decide on metadata structure (e.g., JSON format for traits).",
      "Develop lore or backstory for Pie and the Pieverse.",
    ],
    status: "completed",
  },
  {
    id: 2,
    label: "Phase 2",
    title: "Foundation & Community Building",
    goal: "Establish brand identity and engage early adopters.",
    highlights: [
      "Launch 10K pie character NFTs.",
      "Host community art contests (e.g., \"Design Your Pie\").",
      "Twitter/X Spaces, community AMAs, and meme campaigns.",
      "Airdrops or whitelist spots for early supporters.",
    ],
    status: "current",
  },
  {
    id: 3,
    label: "Phase 3",
    title: "Merch & Brand Expansion",
    goal: "Turn characters into lifestyle products.",
    highlights: [
      "Launch merch store (T-shirts, plushies, mugs).",
      "Feature rare pies in exclusive merch drops.",
      "Collaborate with dessert brands or bakeries for real-world tie-ins.",
      "Develop plushie prototypes.",
    ],
    status: "upcoming",
  },
  {
    id: 4,
    label: "Phase 4",
    title: "Web3 Utility & Gamification",
    goal: "Add utility and deepen engagement.",
    highlights: [
      "Introduce Pie staking or rewards system.",
      "Launch mini-games such as Pie Toss or Pie Factory Tycoon.",
      "Create trait-based quests or challenges.",
      "Open a token-gated merch store for holders.",
    ],
    status: "upcoming",
  },
  {
    id: 5,
    label: "Phase 5",
    title: "IRL & Licensing",
    goal: "Expand beyond Web3.",
    highlights: [
      "Secure retail partnerships for physical products.",
      "Host IRL events or pop-ups like a Pie Day celebration.",
      "Explore animation shorts or comic series.",
      "License pie characters for other brands or creators.",
    ],
    status: "upcoming",
  },
  {
    id: 6,
    label: "Phase 6",
    title: "Ecosystem Growth",
    goal: "Sustain long-term value.",
    highlights: [
      "Launch Lil Pie as a companion collection.",
      "Produce educational content covering baking and Web3 basics.",
      "Create a DAO or community council for roadmap decisions.",
      "Experiment with burn-to-evolve mechanics or fusion pies.",
    ],
    status: "upcoming",
  },
]

const statusStyles = {
  completed: {
    label: "Completed",
    badgeVariant: "secondary",
    accentClass: "border-l-4 border-secondary",
    dotClass: "bg-secondary",
  },
  current: {
    label: "In progress",
    badgeVariant: "default",
    accentClass: "border-l-4 border-primary",
    dotClass: "bg-primary",
  },
  upcoming: {
    label: "Upcoming",
    badgeVariant: "outline" as ComponentProps<typeof Badge>["variant"],
    accentClass: "border-l-4 border-border",
    dotClass: "bg-muted-foreground",
  },
} satisfies Record<
  RoadmapPhaseStatus,
  {
    label: string
    badgeVariant: ComponentProps<typeof Badge>["variant"]
    accentClass: string
    dotClass: string
  }
>

const pdfPath = "/Roadmap_Pienft.pdf"

export default function RoadmapPage() {
  return (
    <main className="min-h-screen bg-background">
      <Header />

      <section className="bg-gradient-to-b from-primary/10 via-background to-background py-16">
        <div className="mx-auto flex max-w-4xl flex-col items-center gap-6 px-4 text-center">
          <Badge variant="outline" className="border-primary/40 text-primary">
            Pippa Expansion Plan
          </Badge>
          <h1 className="text-4xl font-bold md:text-5xl">PippaNFT Roadmap</h1>
          <p className="text-lg text-muted-foreground">
            Explore how Pippa evolves from beloved characters into a connected Web3 ecosystem. Track each
            milestone, celebrate community wins, and stay ready for what is baking next.
          </p>
          <div className="flex flex-col items-center gap-4 sm:flex-row">
            <Button asChild size="lg">
              <a href={pdfPath} download>
                Download PDF Roadmap
              </a>
            </Button>
            <Button asChild size="lg" variant="outline">
              <a href="#phases">View Timeline</a>
            </Button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl space-y-12 px-4 py-16">
        <Card className="border-primary/30 bg-primary/5">
          <CardHeader>
            <CardTitle className="text-2xl">We are here</CardTitle>
            <CardDescription>
              Phase 2 focuses on establishing the Pippa presence, deepening community engagement, and rewarding
              the earliest supporters.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Join live conversations, share your Pippa concepts, and claim early supporter perks as the collection
              scales to its first 10,000 characters.
            </p>
            <Button asChild>
              <a href={pdfPath} download>
                Save the full roadmap
              </a>
            </Button>
          </CardContent>
        </Card>

        <div id="phases" className="space-y-10">
          {roadmapPhases.map((phase) => {
            const state = statusStyles[phase.status]

            return (
              <Card
                key={phase.id}
                className={cn(
                  "relative overflow-hidden border border-border/70 bg-background/90 backdrop-blur",
                  state.accentClass,
                  phase.status === "current" && "shadow-lg shadow-primary/15",
                )}
              >
                {phase.status === "current" && (
                  <div className="pointer-events-none absolute inset-0 bg-primary/5" aria-hidden />
                )}
                <CardHeader className="relative">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <CardTitle className="text-2xl">
                        {phase.label}: {phase.title}
                      </CardTitle>
                      <CardDescription className="text-base">
                        Goal: {phase.goal}
                      </CardDescription>
                    </div>
                    <Badge variant={state.badgeVariant}>{state.label}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="relative">
                  <ul className="space-y-3">
                    {phase.highlights.map((item) => (
                      <li key={item} className="flex gap-3">
                        <span className={cn("mt-2 h-2 w-2 rounded-full", state.dotClass)} aria-hidden />
                        <span className="text-muted-foreground">{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </section>

      <section className="bg-muted/20 py-16">
        <div className="mx-auto max-w-5xl px-4">
          <Card className="border-dashed border-primary/40">
            <CardHeader>
              <CardTitle className="text-2xl">Need the detailed version?</CardTitle>
              <CardDescription>
                The downloadable PDF includes visual timelines, extended lore, and artwork previews that complement
                the live roadmap.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4 text-muted-foreground md:flex-row md:items-center md:justify-between">
              <p>
                Keep the Roadmap of Pippa NFT.
              </p>
              <Button asChild size="lg">
                <a href={pdfPath} download>
                  Download the roadmap
                </a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      <Footer />
    </main>
  )
}
