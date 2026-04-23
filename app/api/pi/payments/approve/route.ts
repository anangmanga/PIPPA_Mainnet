import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { approvePiPayment } from "@/lib/pi/platform"

type ApproveRequest = {
  paymentId?: string
  orderId?: string
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as ApproveRequest
  const { paymentId, orderId } = body

  if (!paymentId || !orderId) {
    return NextResponse.json({ error: "paymentId and orderId are required." }, { status: 400 })
  }

  try {
    await approvePiPayment(paymentId)

    await prisma.order.update({
      where: { id: orderId },
      data: {
        piPaymentId: paymentId,
        status: "PENDING",
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to approve Pi payment", error)
    return NextResponse.json({ error: "Unable to approve Pi payment." }, { status: 502 })
  }
}

