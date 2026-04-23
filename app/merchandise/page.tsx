import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { ScrollReveal } from "@/components/animations/scroll-reveal"
import Image from "next/image"
import { getMerchandise, getLatestPiPriceSnapshot } from "@/lib/data/merchandise"
import { formatDistanceToNow } from "date-fns"
import { MerchandisePurchaseButton } from "@/components/merchandise/purchase-button"

type MerchandiseRecord = Awaited<ReturnType<typeof getMerchandise>>[number]

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value)
}

function formatPi(value: number | null) {
  if (!value) return "--"
  return `${value.toFixed(4)} Pi`
}

export default async function MerchandisePage() {
  const [items, latestPrice] = await Promise.all([
    getMerchandise(),
    getLatestPiPriceSnapshot(),
  ])

  const piToUsdRate = latestPrice ? Number(latestPrice.piToUsdRate) : null
  const lastUpdated = latestPrice?.fetchedAt

  return (
    <main className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <ScrollReveal animation="fadeIn">
        <section className="relative w-full overflow-hidden bg-linear-to-r from-primary/20 to-accent/20 pt-24 pb-16 sm:pt-28 sm:pb-20 md:py-24">
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <Image src="/bg/1.png" alt="Background" fill className="object-cover" />
          </div>
          <div className="relative flex flex-col items-center justify-center gap-4 text-center px-4 sm:px-6">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              Shop PippaNFT Merchandise
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl">
              Get your favorite PippaNFT characters on physical products.
            </p>
            <div className="bg-card/80 border border-border px-4 py-2 sm:px-6 sm:py-3 rounded-xl text-xs sm:text-sm text-muted-foreground shadow-lg backdrop-blur">
              {piToUsdRate ? (
                <span>
                  Conversion rate: 1 Pi ≈ {formatCurrency(piToUsdRate)} (updated {lastUpdated ? formatDistanceToNow(lastUpdated, { addSuffix: true }) : "recently"})
                </span>
              ) : (
                <span>Pi price data unavailable. Prices shown in USD.</span>
              )}
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* Merchandise Grid */}
      <ScrollReveal animation="fadeIn" delay={0.2}>
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
            {items.map((item: MerchandiseRecord, index: number) => {
              const usdPrice = Number(item.baseUsdPrice)
              const piPrice = piToUsdRate ? usdPrice / piToUsdRate : null
              const primaryImage = item.imageUrl ?? item.gallery[0]?.url ?? "/placeholder.svg"

              return (
                <ScrollReveal key={item.id} animation="scale" delay={index * 0.1}>
                  <div className="bg-card rounded-2xl border border-border overflow-hidden hover:shadow-xl transition-all">
                    <div className="relative w-full aspect-[4/3] sm:aspect-square overflow-hidden bg-muted">
                      <Image
                        src={primaryImage}
                        alt={item.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="p-5 sm:p-6 space-y-4">
                      <div>
                        <h3 className="text-lg sm:text-xl font-bold mb-2">{item.title}</h3>
                        {item.description && (
                          <p className="text-sm sm:text-base text-muted-foreground line-clamp-3">{item.description}</p>
                        )}
                      </div>
                      <div>
                        <p className="text-xl sm:text-2xl font-bold text-primary">{formatCurrency(usdPrice)}</p>
                        <p className="text-xs sm:text-sm text-muted-foreground">≈ {formatPi(piPrice)}</p>
                      </div>
                      <MerchandisePurchaseButton
                        merchId={item.id}
                        title={item.title}
                        unitUsd={usdPrice}
                        unitPi={piPrice}
                      />
                    </div>
                  </div>
                </ScrollReveal>
              )
            })}
          </div>
          <div className="mt-10 sm:mt-12 text-xs sm:text-sm text-muted-foreground text-center max-w-2xl mx-auto">
            Delivery currently available to the USA, Canada, and select European countries. Orders outside these regions are not supported at this time.
          </div>
        </section>
      </ScrollReveal>

      <ScrollReveal animation="fadeIn" delay={0.1}>
        <Footer />
      </ScrollReveal>
    </main>
  )
}

