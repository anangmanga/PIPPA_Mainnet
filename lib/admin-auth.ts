import { cache } from "react"
import { headers } from "next/headers"
import { prisma } from "@/lib/prisma"

const DEFAULT_ADMIN_EMAIL = "nftpippa@gmail.com"
const DEFAULT_ADMIN_PASSWORD = "nftpi123"
const REALM = "Pippa Admin"

const ADMIN_EMAIL = process.env.ADMIN_BASIC_USER ?? DEFAULT_ADMIN_EMAIL
const ADMIN_PASSWORD = process.env.ADMIN_BASIC_PASSWORD ?? DEFAULT_ADMIN_PASSWORD

export type AdminSession =
  | { status: "ok"; email: string }
  | { status: "missing" }
  | { status: "invalid" }
  | { status: "not-allowed" }

function parseBasicAuth(headerValue: string | null) {
  if (!headerValue || !headerValue.startsWith("Basic ")) {
    return null
  }

  const base64Credentials = headerValue.slice(6).trim()

  try {
    const decoded = Buffer.from(base64Credentials, "base64").toString("utf8")
    const separatorIndex = decoded.indexOf(":")
    if (separatorIndex === -1) {
      return null
    }

    const email = decoded.slice(0, separatorIndex)
    const password = decoded.slice(separatorIndex + 1)

    return { email, password }
  } catch (error) {
    console.error("Failed to parse basic auth header", error)
    return null
  }
}

export const getAdminSession = cache(async (): Promise<AdminSession> => {
  const headerStore = await headers()
  const authorization = headerStore.get("authorization")
  const credentials = parseBasicAuth(authorization)

  if (!credentials) {
    return { status: "missing" }
  }

  const { email, password } = credentials

  if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
    return { status: "invalid" }
  }

  const adminRecord = await prisma.adminUser.findUnique({
    where: { email: email.toLowerCase() },
  })

  if (!adminRecord) {
    return { status: "not-allowed" }
  }

  return { status: "ok", email: adminRecord.email }
})

export async function requireAdmin() {
  const session = await getAdminSession()

  if (session.status === "ok") {
    return session
  }

  const error = new Error("Admin authentication failed")
  ;(error as Error & { reason?: AdminSession["status"] }).reason = session.status
  throw error
}

export function getAdminRealm() {
  return REALM
}
