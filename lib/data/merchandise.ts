import { prisma } from "@/lib/prisma"

const db = prisma as any

export async function getMerchandise() {
  return db.merchItem.findMany({
    where: { isActive: true },
    orderBy: { createdAt: "asc" },
    include: {
      gallery: { orderBy: { priority: "asc" } },
    },
  })
}

export async function getLatestPiPriceSnapshot() {
  return db.piPriceSnapshot.findFirst({
    orderBy: { fetchedAt: "desc" },
  })
}
