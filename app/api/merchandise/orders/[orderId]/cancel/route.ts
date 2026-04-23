import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

type Params = {
  params: {
    orderId: string
  }
}

const cancelSchema = z.object({
  reason: z.string().optional(),
  status: z.enum(["FAILED", "CANCELLED"]).default("CANCELLED"),
})

export async function POST(request: Request, { params }: Params) {
  let payload: z.infer<typeof cancelSchema>

  try {
    payload = cancelSchema.parse(await request.json().catch(() => ({})))
  } catch (error) {
    return NextResponse.json({ error: "Invalid payload", details: (error as Error).message }, { status: 400 })
  }

  try {
    const order = await prisma.order.update({
      where: { id: params.orderId },
      data: {
        status: payload.status,
        customerPhone: payload.reason ? `Note: ${payload.reason}` : undefined,
      },
    })

    return NextResponse.json({ success: true, order })
  } catch (error) {
    console.error("Failed to cancel order", error)
    return NextResponse.json({ error: "Unable to update order" }, { status: 500 })
  }
}
