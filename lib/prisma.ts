import { PrismaClient } from "@prisma/client"
import { withAccelerate } from "@prisma/extension-accelerate"

const createPrismaClient = () => {
  const connectionUrl = process.env.DATABASE_URL

  if (!connectionUrl) {
    throw new Error("DATABASE_URL is not defined")
  }

  const client = new PrismaClient({
    datasourceUrl: connectionUrl,
  })

  return client.$extends(withAccelerate()) as PrismaClient
}

type PrismaClientWithAccelerate = ReturnType<typeof createPrismaClient>

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClientWithAccelerate | undefined
}

export const prisma = global.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma
}
