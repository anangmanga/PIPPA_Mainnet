"use client"

import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export default function HowToGetPage() {
  const steps = [
    {
      number: 1,
      title: "Set Up Pi Network Wallet",
      description: "Download the Pi Network app and create your wallet. Make sure you have completed KYC verification.",
      details: "Visit an nft mining site and follow the onboarding process to secure your Pi wallet.",
    },
    {
      number: 2,
      title: "Get Pi Coins",
      description: "Earn Pi through mining or purchase Pi coins to fund your wallet for minting.",
      details: "Join the Pi mining community and earn daily rewards to build your Pi balance.",
    },
    {
      number: 3,
      title: "Mint Your Pippa NFT",
      description: "Visit our minting platform and create your unique PippaNFT.",
      details: "Select your preferred traits and mint directly to your wallet.",
    },
    {
      number: 4,
      title: "Trade & Collect",
      description: "Buy, sell, and trade Pippa NFTs on supported marketplaces.",
      details: "Connect your wallet to Pi Network marketplaces to start trading your collection.",
    },
  ]

  return (
    <main className="min-h-screen" style={{ backgroundColor: 'transparent' }}>
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-primary/10 to-background py-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">How to Get Your Pippa NFT</h1>
          <p className="text-lg text-muted-foreground mb-8">
            Follow these simple steps to mint and own your own Pippa Pie character
          </p>
        </div>
      </section>

      {/* Steps Section */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {steps.map((step) => (
            <Card key={step.number} className="border-l-4 border-l-primary">
              <CardHeader>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg">
                    {step.number}
                  </div>
                  <div>
                    <CardTitle>{step.title}</CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-muted-foreground">{step.description}</p>
                <p className="text-sm bg-secondary/50 p-3 rounded">{step.details}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* CTA Section */}
        {/* <div className="bg-card border-2 border-primary rounded-lg p-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Your Pippa?</h2>
          <p className="text-lg text-muted-foreground mb-8">
            Visit our minting platform to create your unique Pippa Pie NFT today
          </p>
          <Link href="https://pi-nft-minting.example.com" target="_blank" rel="noopener noreferrer">
            <Button size="lg" className="bg-primary hover:bg-primary/90 text-lg px-8">
              Mint Your Pippa NFT
            </Button>
          </Link>
        </div> */}

        {/* Requirements Section */}
        <div className="mt-12 bg-secondary/50 rounded-lg p-8">
          <h3 className="text-2xl font-bold mb-6">Requirements</h3>
          <ul className="space-y-3">
            <li className="flex gap-3">
              <span className="text-primary font-bold">✓</span>
              <span>Active Pi Network account with completed KYC</span>
            </li>
            <li className="flex gap-3">
              <span className="text-primary font-bold">✓</span>
              <span>Sufficient Pi coins in your wallet</span>
            </li>
            <li className="flex gap-3">
              <span className="text-primary font-bold">✓</span>
              <span> Pi Mobile Wallet access</span>
            </li>
            <li className="flex gap-3">
              <span className="text-primary font-bold">✓</span>
              <span>Basic understanding of NFTs and blockchain</span>
            </li>
          </ul>
        </div>
      </section>

      <Footer />
    </main>
  )
}
