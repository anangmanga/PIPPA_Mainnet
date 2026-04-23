import { Prisma } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import { fetchZyraChainPrice } from "@/lib/external/zyrachain"

export async function syncPiPrice() {
  const { rate, raw } = await fetchZyraChainPrice()

  const snapshot = await prisma.piPriceSnapshot.create({
    data: {
      piToUsdRate: new Prisma.Decimal(rate),
      source: "zyrachain",
    },
  })

  return { snapshot, raw }
}
