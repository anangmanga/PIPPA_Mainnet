import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { Prisma } from "@prisma/client"
import { z } from "zod"

const confirmSchema = z.object({
  piPaymentId: z.string().min(1),
  totalUsd: z.number().positive(),
  totalPi: z.number().positive(),
})

type Params = {
  params: {
    orderId: string
  }
}

export async function POST(request: Request, { params }: Params) {
  let data: z.infer<typeof confirmSchema>

  try {
    data = confirmSchema.parse(await request.json())
  } catch (error) {
    return NextResponse.json({ error: "Invalid payload", details: (error as Error).message }, { status: 400 })
  }

  try {
    const order = await prisma.order.update({
      where: { id: params.orderId },
      data: {
        status: "CONFIRMED",
        piPaymentId: data.piPaymentId,
        totalUsd: new Prisma.Decimal(data.totalUsd),
        totalPi: new Prisma.Decimal(data.totalPi),
      },
    })

    return NextResponse.json({ success: true, order })
  } catch (error) {
    console.error("Failed to confirm order", error)
    return NextResponse.json({ error: "Unable to confirm order" }, { status: 500 })
  }
}
