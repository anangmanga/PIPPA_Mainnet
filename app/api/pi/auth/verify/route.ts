import { NextResponse } from "next/server"
import { verifyPiAccessToken } from "@/lib/pi/platform"
import { prisma } from "@/lib/prisma"

const db = prisma as any

type VerifyRequest = {
  accessToken?: string
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as VerifyRequest
  const accessToken = body.accessToken

  if (!accessToken) {
    return NextResponse.json({ error: "Missing access token." }, { status: 400 })
  }

  try {
    const piData = await verifyPiAccessToken(accessToken)
    const walletAddress = piData.wallets?.[0]?.address ?? null

    const dbUser = await db.piUser.upsert({
      where: { piUid: piData.uid },
      update: {
        username: piData.username ?? null,
        walletAddress,
        lastAuthenticatedAt: new Date(),
      },
      create: {
        piUid: piData.uid,
        username: piData.username ?? null,
        walletAddress,
        lastAuthenticatedAt: new Date(),
      },
    })

    return NextResponse.json({
      piUser: {
        id: dbUser.id,
        piUid: dbUser.piUid,
        username: dbUser.username,
        walletAddress: dbUser.walletAddress,
      },
    })
  } catch (error) {
    console.error("Failed to verify Pi access token", error)
    return NextResponse.json({ error: "Unable to verify Pi access token." }, { status: 502 })
  }
} 
