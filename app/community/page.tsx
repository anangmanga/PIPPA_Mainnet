"use client"

import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

const communityLinks = [
  {
    name: "Twitter/X",
    description: "Follow us for announcements, updates, and community highlights",
    icon: "𝕏",
    url: "https://x.com/pippathepie?s=21",
  },
  {
    name: "Telegram",
    description: "Get instant notifications about new releases and marketplace updates",
    icon: "📱",
    url: "https://t.me/pippanft",
  },
  {
    name: "Instagram",
    description: "See beautiful Pippa art, community showcases, and behind-the-scenes content",
    icon: "📷",
    url: "#https://www.instagram.com/pippa.thepie?igsh=b2g3aDRhZ2lvdWhw&utm_source=qr",
  },
  {
    name: "Facebook",
    description: "Browse and trade Pippa NFTs on the decentralized marketplace",
    icon: "🌊",
    url: "https://www.facebook.com/share/1GSfk1qZ2j/?mibextid=wwXIfr",
  },
  {
    name: "YouTube",
    description: "Read detailed guides, news, and stories about the Pippa collection",
    icon: "📝",
    url: "https://www.youtube.com/@Pippa.thepie",
  },
]

export default function CommunityPage() {
  return (
    <main className="min-h-screen" style={{ backgroundColor: 'transparent' }}>
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-primary/10 to-background py-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Join the Pippa Community</h1>
          <p className="text-lg text-muted-foreground mb-8">
            Connect with collectors, artists, and NFT enthusiasts from around the world
          </p>
        </div>
      </section>

      {/* Community Links */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {communityLinks.map((link) => (
            <Link key={link.name} href={link.url} target="_blank" rel="noopener noreferrer">
              <Card className="hover:border-primary transition-colors h-full cursor-pointer">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-2xl">{link.name}</CardTitle>
                      <CardDescription>{link.description}</CardDescription>
                    </div>
                    <span className="text-4xl">{link.icon}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full bg-transparent">
                    Visit →
                  </Button>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>
      <Footer />
    </main>
  )
}
