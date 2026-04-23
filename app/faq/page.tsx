"use client"

import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

const faqs = [
  {
    question: "What is Pippa?",
    answer:
      "Pippa is a unique NFT collection featuring adorable pi  characters with different traits, accessories, and personalities. Each Pippa is a one-of-a-kind digital collectible built on Pi Network.",
  },
  {
    question: "How much does it cost to mint a Pippa NFT?",
    answer:
      "Minting costs vary based on market conditions and rarity. Visit our minting platform for current pricing. All transactions are conducted in Pi coins on the Pi Network.",
  },
  {
    question: "Can I trade my Pippa NFTs?",
    answer:
      "Yes! Once you mint your Pippa NFT, you can buy, sell, and trade them on supported Pi Network marketplaces. Your NFT will remain in your wallet with full ownership rights.",
  },
  {
    question: "What makes Pippa NFTs valuable?",
    answer:
      "Pippa NFTs have value based on rarity tiers, trait combinations, and community demand. Limited supply and unique characteristics make certain Pippas more sought after by collectors.",
  },
  {
    question: "How do I store my Pippa NFTs?",
    answer:
      "Your Pippa NFTs are stored in your Pi Network wallet. The wallet securely holds your NFT metadata and ownership information on the Pi blockchain and a IPFS link to the image.",
  },
  {
    question: "Is there a royalty system?",
    answer:
      "Yes, creators receive royalties on secondary sales. This supports the continued development of the Pippa collection and community. 5% of all secondary sales are donated to the Pippa community fund.",
  },
  // {
  //   question: "Can I create custom Pippas?",
  //   answer:
  //     "You cannot customize your Pippa.",
  // },
  {
    question: "What if I lose access to my wallet?",
    answer:
      "Your Pippa NFTs are tied to your wallet's private keys. Always backup your seed phrase in a safe location. If you lose access, your NFTs may be unrecoverable.",
  },
  {
    question: "Is the Pippa collection limited?",
    answer:
      "Yes. The main collection is capped at 10,000 unique Pippa NFTs. The number 314 is a Pi Day–inspired rarity motif (3.14)—a memorable rare tier, not the total supply.",
  },
  {
    question: "How can I stay updated on new releases?",
    answer:
      "Follow our official social media channels and subscribe to our newsletter for announcements about new releases, events, and community initiatives.",
  },
]

export default function FAQPage() {
  return (
    <main className="min-h-screen" style={{ backgroundColor: 'transparent' }}>
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-primary/10 to-background py-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Frequently Asked Questions</h1>
          <p className="text-lg text-muted-foreground">Everything you need to know about Pippa NFTs</p>
        </div>
      </section>

      {/* FAQ Accordion */}
      <section className="max-w-4xl mx-auto px-4 py-12">
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{faq.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      <Footer />
    </main>
  )
}
