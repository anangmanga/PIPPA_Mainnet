import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { completePiPayment } from "@/lib/pi/platform"

type CompleteRequest = {
  paymentId?: string
  txid?: string
  orderId?: string
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as CompleteRequest
  const { paymentId, txid, orderId } = body

  if (!paymentId || !txid || !orderId) {
    return NextResponse.json({ error: "paymentId, txid, and orderId are required." }, { status: 400 })
  }

  try {
    await completePiPayment(paymentId, txid)

    const order = await prisma.order.update({
      where: { id: orderId },
      data: {
        piPaymentId: paymentId,
        status: "CONFIRMED",
      },
    })

    return NextResponse.json({ success: true, order })
  } catch (error) {
    console.error("Failed to complete Pi payment", error)
    return NextResponse.json({ error: "Unable to complete Pi payment." }, { status: 502 })
  }
}

