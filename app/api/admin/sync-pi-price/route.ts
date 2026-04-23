import { NextResponse } from "next/server"
import { syncPiPrice } from "@/lib/services/pi-pricing"

export const dynamic = "force-dynamic"

function isAuthorized(request: Request) {
  const secret = process.env.CRON_SECRET
  if (!secret) return true

  const authHeader = request.headers.get("authorization") || ""
  return authHeader === `Bearer ${secret}`
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { snapshot } = await syncPiPrice()

    return NextResponse.json({
      success: true,
      rate: snapshot.piToUsdRate.toNumber(),
      fetchedAt: snapshot.fetchedAt,
    })
  } catch (error) {
    console.error("Failed to sync Pi price", error)
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 })
  }
}
