import { piConfig } from "@/lib/pi/config"

type VerifyResponse = {
  uid: string
  username?: string
  wallets?: Array<{ network: string; address: string }>
}

type ApproveResponse = {
  identifier: string
  developer_approved: boolean
}

type CompleteResponse = {
  identifier: string
  developer_completed: boolean
}

function createRequest(path: string, init?: RequestInit) {
  const baseUrl = piConfig.platformBaseUrl?.replace(/\/$/, "") || ""
  const headers = new Headers(init?.headers)

  if (!headers.has("Authorization")) {
    headers.set("Authorization", `Key ${piConfig.apiKey}`)
  }

  if (init?.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json")
  }

  return fetch(`${baseUrl}${path}`, {
    ...init,
    headers,
    cache: "no-store",
  })
}

export async function verifyPiAccessToken(accessToken: string) {
  const response = await createRequest("/me", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })

  if (!response.ok) {
    throw new Error(`Pi verify request failed: ${response.status}`)
  }

  return (await response.json()) as VerifyResponse
}

export async function approvePiPayment(paymentId: string) {
  const response = await createRequest(`/payments/${paymentId}/approve`, {
    method: "POST",
  })

  if (!response.ok) {
    throw new Error(`Pi approval failed: ${response.status}`)
  }

  return (await response.json()) as ApproveResponse
}

export async function completePiPayment(paymentId: string, txid: string) {
  const response = await createRequest(`/payments/${paymentId}/complete`, {
    method: "POST",
    body: JSON.stringify({ txid }),
  })

  if (!response.ok) {
    throw new Error(`Pi completion failed: ${response.status}`)
  }

  return (await response.json()) as CompleteResponse
}

export async function cancelPiPayment(paymentId: string) {
  const response = await createRequest(`/payments/${paymentId}/cancel`, {
    method: "POST",
  })

  if (!response.ok) {
    throw new Error(`Pi cancel failed: ${response.status}`)
  }
}

