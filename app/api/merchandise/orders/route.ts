import { NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { Prisma } from "@prisma/client"
import { getLatestPiPriceSnapshot } from "@/lib/data/merchandise"

const allowedCountries = new Set([
  "USA",
  "United States",
  "Canada",
  "France",
  "Germany",
  "Spain",
  "Italy",
  "Netherlands",
  "Belgium",
  "Portugal",
  "Ireland",
  "United Kingdom",
  "UK",
  "Sweden",
  "Norway",
  "Denmark",
  "Finland",
  "Switzerland",
  "Austria",
])

const orderSchema = z.object({
  merchId: z.string().min(1),
  quantity: z.number().int().positive().default(1),
  customer: z.object({
    name: z.string().min(1),
    email: z.string().email(),
    phone: z.string().optional(),
  }),
  shipping: z
    .object({
      address1: z.string().min(1),
      address2: z.string().optional(),
      city: z.string().min(1),
      state: z.string().optional(),
      postalCode: z.string().min(1),
      country: z.string().min(1),
    })
    .optional(),
  piUserId: z.string().min(1).optional(),
})

type OrderRequest = z.infer<typeof orderSchema>

export async function POST(request: Request) {
  let payload: OrderRequest

  try {
    const json = await request.json()
    payload = orderSchema.parse(json)
  } catch (error) {
    return NextResponse.json({ error: "Invalid request", details: (error as Error).message }, { status: 400 })
  }

  if (
    payload.shipping &&
    payload.shipping.country &&
    !allowedCountries.has(payload.shipping.country)
  ) {
    return NextResponse.json({ error: "Delivery is limited to USA, Canada, or select European countries." }, { status: 422 })
  }

  const merchItem = await prisma.merchItem.findUnique({
    where: { id: payload.merchId },
  })

  if (!merchItem) {
    return NextResponse.json({ error: "Merchandise item not found" }, { status: 404 })
  }

  if (!merchItem.isActive) {
    return NextResponse.json({ error: "Merchandise item is not available" }, { status: 409 })
  }

  const latestSnapshot = await getLatestPiPriceSnapshot()

  if (!latestSnapshot) {
    return NextResponse.json({ error: "Pi pricing unavailable. Try again later." }, { status: 503 })
  }

  let piUserConnect: { connect: { id: string } } | undefined

  if (payload.piUserId) {
    const piUser = await prisma.piUser.findUnique({ where: { id: payload.piUserId } })

    if (!piUser) {
      return NextResponse.json({ error: "Pi user not found" }, { status: 404 })
    }

    piUserConnect = { connect: { id: piUser.id } }
  }

  const piRate = Number(latestSnapshot.piToUsdRate)
  const quantity = payload.quantity
  const unitUsd = Number(merchItem.baseUsdPrice)
  const unitPi = unitUsd / piRate
  const totalUsd = unitUsd * quantity
  const totalPi = unitPi * quantity

  try {
    const order = await prisma.order.create({
      data: {
        merchItem: { connect: { id: merchItem.id } },
        quantity,
        unitUsdPrice: new Prisma.Decimal(unitUsd),
        unitPiPrice: new Prisma.Decimal(unitPi),
        totalUsd: new Prisma.Decimal(totalUsd),
        totalPi: new Prisma.Decimal(totalPi),
        customerName: payload.customer.name,
        customerEmail: payload.customer.email,
        customerPhone: payload.customer.phone,
        shippingAddress: payload.shipping
          ? {
              create: {
                address1: payload.shipping.address1,
                address2: payload.shipping.address2,
                city: payload.shipping.city,
                state: payload.shipping.state,
                postalCode: payload.shipping.postalCode,
                country: payload.shipping.country,
              },
            }
          : undefined,
        piUser: piUserConnect,
      },
      include: {
        shippingAddress: true,
      },
    })

    return NextResponse.json({
      orderId: order.id,
      unitUsd,
      unitPi,
      totalUsd,
      totalPi,
    })
  } catch (error) {
    console.error("Failed to create order", error)
    return NextResponse.json({ error: "Unable to create order" }, { status: 500 })
  }
}
