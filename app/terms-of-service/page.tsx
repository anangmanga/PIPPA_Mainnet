"use client"

import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"

export default function TermsOfServicePage() {
  return (
    <main className="min-h-screen" style={{ backgroundColor: "transparent" }}>
      <Header />

      <section className="bg-gradient-to-b from-primary/10 to-background py-12">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Terms of Service</h1>
          <p className="text-sm text-muted-foreground">Last updated: April 19, 2026</p>
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-4 py-12 space-y-8 text-muted-foreground leading-relaxed">
        <p>
          These Terms of Service are placeholder text. Replace this page with terms reviewed by your legal counsel before
          launch. They will govern use of the Pippa website, NFT collection participation when available, and related
          services.
        </p>

        <div className="space-y-3">
          <h2 className="text-xl font-semibold text-foreground">1. Acceptance of terms</h2>
          <p>
            By accessing this site you agree to be bound by these terms and all applicable laws. If you do not agree, do
            not use the site or services.
          </p>
        </div>

        <div className="space-y-3">
          <h2 className="text-xl font-semibold text-foreground">2. Not financial advice</h2>
          <p>
            Nothing on this site is investment, legal, or tax advice. Digital assets involve risk; you are solely
            responsible for your decisions.
          </p>
        </div>

        <div className="space-y-3">
          <h2 className="text-xl font-semibold text-foreground">3. NFTs and third parties</h2>
          <p>
            Minting, wallets, and marketplaces may involve third-party platforms (for example Pi Network). We are not
            responsible for third-party outages, policy changes, or losses arising from their use.
          </p>
        </div>

        <div className="space-y-3">
          <h2 className="text-xl font-semibold text-foreground">4. Contact</h2>
          <p>For questions about these terms, contact the project team using your official support channel.</p>
        </div>
      </section>

      <Footer />
    </main>
  )
}
