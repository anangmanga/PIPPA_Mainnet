import { PromoPlacement } from "@prisma/client"
import { prisma } from "@/lib/prisma"

export type PromoBlockMap = Partial<Record<PromoPlacement, PromoBlockRecord>>

type PromoBlockRecord = Awaited<ReturnType<typeof prisma.promoBlock.findMany>>[number]

export async function getPromoBlocksByPlacement(placements: PromoPlacement[]): Promise<PromoBlockMap> {
  if (placements.length === 0) {
    return {}
  }

  const promos = await prisma.promoBlock.findMany({
    where: {
      placement: {
        in: placements,
      },
    },
  })

  return promos.reduce<PromoBlockMap>((acc, promo) => {
    acc[promo.placement] = promo
    return acc
  }, {})
}

export async function getCommunityLinks() {
  const links = await prisma.communityLink.findMany({
    where: {
      isActive: true,
    },
    orderBy: [
      { displayOrder: "asc" },
      { name: "asc" },
    ],
  })

  return links.filter((link) => {
    const name = link.name.toLowerCase()
    const url = link.url.toLowerCase()
    return !name.includes("discord") && !url.includes("discord")
  })
}

export async function getFooterLinks() {
  return prisma.footerLink.findMany({
    where: {
      isActive: true,
    },
    orderBy: [
      { displayOrder: "asc" },
      { label: "asc" },
    ],
  })
}

