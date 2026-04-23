import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const BASIC_USER = process.env.ADMIN_BASIC_USER ?? "nftpippa@gmail.com"
const BASIC_PASSWORD = process.env.ADMIN_BASIC_PASSWORD ?? "nftpi123"
const REALM = "Pippa Admin"

function decodeBasicAuth(headerValue: string | null) {
  if (!headerValue || !headerValue.startsWith("Basic ")) {
    return null
  }

  const base64Credentials = headerValue.slice(6).trim()

  try {
    const decoded = atob(base64Credentials)
    const separatorIndex = decoded.indexOf(":")

    if (separatorIndex === -1) {
      return null
    }

    const email = decoded.slice(0, separatorIndex)
    const password = decoded.slice(separatorIndex + 1)
    return { email, password }
  } catch {
    return null
  }
}

function unauthorized() {
  return new NextResponse("Authentication required", {
    status: 401,
    headers: {
      "WWW-Authenticate": `Basic realm="${REALM}", charset="UTF-8"`,
    },
  })
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (!pathname.startsWith("/admin")) {
    return NextResponse.next()
  }

  const credentials = decodeBasicAuth(request.headers.get("authorization"))

  if (!credentials) {
    return unauthorized()
  }

  const { email, password } = credentials

  if (email !== BASIC_USER || password !== BASIC_PASSWORD) {
    return unauthorized()
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*"],
}

