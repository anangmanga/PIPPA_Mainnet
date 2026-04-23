import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { cancelPiPayment } from "@/lib/pi/platform"

type CancelRequest = {
  paymentId?: string
  orderId?: string
  reason?: string
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as CancelRequest
  const { paymentId, orderId, reason } = body

  if (!paymentId || !orderId) {
    return NextResponse.json({ error: "paymentId and orderId are required." }, { status: 400 })
  }

  try {
    await cancelPiPayment(paymentId)

    await prisma.order.update({
      where: { id: orderId },
      data: {
        status: "CANCELLED",
        customerPhone: reason ? `Note: ${reason}` : undefined,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to cancel Pi payment", error)
    return NextResponse.json({ error: "Unable to cancel Pi payment." }, { status: 502 })
  }
}

