"use client"

import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen" style={{ backgroundColor: "transparent" }}>
      <Header />

      <section className="bg-gradient-to-b from-primary/10 to-background py-12">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Privacy Policy</h1>
          <p className="text-sm text-muted-foreground">Last updated: April 19, 2026</p>
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-4 py-12 space-y-8 text-muted-foreground leading-relaxed">
        <p>
          This Privacy Policy is placeholder text. Replace it with a policy that matches your actual data practices and
          complies with applicable law (including any requirements for Pi Network–related products you offer).
        </p>

        <div className="space-y-3">
          <h2 className="text-xl font-semibold text-foreground">1. Information we may collect</h2>
          <p>
            Examples include technical logs (IP address, browser type), authentication or wallet identifiers you choose to
            provide, and communications you send to us.
          </p>
        </div>

        <div className="space-y-3">
          <h2 className="text-xl font-semibold text-foreground">2. How we use information</h2>
          <p>
            To operate the site, improve security and performance, respond to requests, and comply with legal obligations.
            Specific purposes should be listed here after you finalize product behavior.
          </p>
        </div>

        <div className="space-y-3">
          <h2 className="text-xl font-semibold text-foreground">3. Sharing</h2>
          <p>
            Describe any vendors (hosting, analytics, email), legal disclosures, or business transfers. State if you sell
            personal data (typically you should not without explicit disclosure and consent where required).
          </p>
        </div>

        <div className="space-y-3">
          <h2 className="text-xl font-semibold text-foreground">4. Your choices</h2>
          <p>
            Explain how users can access, correct, or delete data, and how to opt out of marketing or non-essential cookies,
            consistent with your implementation.
          </p>
        </div>

        <div className="space-y-3">
          <h2 className="text-xl font-semibold text-foreground">5. Contact</h2>
          <p>For privacy requests, provide a dedicated email or form once available.</p>
        </div>
      </section>

      <Footer />
    </main>
  )
}
