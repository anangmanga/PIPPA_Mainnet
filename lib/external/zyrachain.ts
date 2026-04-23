const BASE_URL = process.env.ZYRACHAIN_BASE_URL ?? "https://www.zyrachain.org"

export type ZyraChainPriceResponse = {
  price?: number | string
  data?:
    | {
        price?: number | string
        usd?: number | string
        value?: number | string
        priceUsd?: number | string
        price_usd?: number | string
        piToUsd?: number | string
        pi_to_usd?: number | string
        result?: number | string
        rates?: Record<string, number | string>
        [key: string]: unknown
      }
    | Array<Record<string, unknown>>
  usd?: number | string
  value?: number | string
  result?: number | string
  rates?: Record<string, number | string>
  meta?: Record<string, unknown>
  [key: string]: unknown
}

export async function fetchZyraChainPrice(signal?: AbortSignal): Promise<{ rate: number; raw: unknown }> {
  const url = `${BASE_URL.replace(/\/$/, "")}/api/v1/price`

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
    cache: "no-store",
    signal,
  })

  if (!response.ok) {
    throw new Error(`ZyraChain price request failed with status ${response.status}`)
  }

  const json = (await response.json()) as ZyraChainPriceResponse
  const rate = extractRate(json)

  if (!rate || Number.isNaN(rate)) {
    const preview = JSON.stringify(json)?.slice(0, 180) ?? "(no payload)"
    throw new Error(`Could not determine Pi price from ZyraChain response. Sample: ${preview}`)
  }

  return { rate, raw: json }
}

function extractRate(payload: ZyraChainPriceResponse): number | null {
  const visited = new Set<unknown>()

  const attempt = (value: unknown): number | null => {
    if (value === null || value === undefined) {
      return null
    }

    if (typeof value === "number") {
      return Number.isFinite(value) ? value : null
    }

    if (typeof value === "string") {
      const cleaned = value.replace(/[,$\s]/g, "")
      const parsed = Number.parseFloat(cleaned)
      return Number.isFinite(parsed) ? parsed : null
    }

    if (Array.isArray(value)) {
      for (const item of value) {
        const maybe = attempt(item)
        if (maybe) return maybe
      }
      return null
    }

    if (typeof value === "object") {
      if (visited.has(value)) {
        return null
      }
      visited.add(value)

      const objectValue = value as Record<string, unknown>
      const prioritizedKeys = [
        "priceUsd",
        "price_usd",
        "priceUSD",
        "price",
        "usd",
        "value",
        "piToUsd",
        "pi_to_usd",
        "piusd",
        "pi_usd",
        "pi_to_usd_rate",
        "pi",
        "result",
      ]

      for (const key of prioritizedKeys) {
        if (key in objectValue) {
          const maybe = attempt(objectValue[key])
          if (maybe) return maybe
        }
      }

      if ("rates" in objectValue && typeof objectValue.rates === "object" && objectValue.rates !== null) {
        const rates = objectValue.rates as Record<string, unknown>
        const maybeUsd = rates.usd ?? rates.USD ?? rates.piToUsd ?? rates.pi_to_usd
        const maybe = attempt(maybeUsd)
        if (maybe) return maybe

        for (const value of Object.values(rates)) {
          const candidate = attempt(value)
          if (candidate) return candidate
        }
      }

      for (const value of Object.values(objectValue)) {
        const candidate = attempt(value)
        if (candidate) return candidate
      }
    }

    return null
  }

  return attempt(payload)
}
