const DEFAULT_PLATFORM_BASE_URL = "https://api.minepi.com/v2"

function getEnv(name: string): string | undefined {
  if (typeof process === "undefined") {
    return undefined
  }
  return process.env[name]
}

const platformBaseUrl = getEnv("PI_PLATFORM_API_URL") || DEFAULT_PLATFORM_BASE_URL
const apiKey = getEnv("PI_API_KEY")
const appId = getEnv("PI_APP_ID")
const sandboxFlag = getEnv("NEXT_PUBLIC_PI_SANDBOX") !== "false"
const serverBaseUrl = getEnv("NEXT_PUBLIC_SERVER_URL") || ""
const isServer = typeof window === "undefined"

if (isServer && !apiKey) {
  throw new Error("PI_API_KEY environment variable is required for Pi Platform integration.")
}

export const piConfig = {
  platformBaseUrl,
  apiKey,
  appId,
  sandbox: sandboxFlag,
  serverBaseUrl,
}

export type PiConfig = typeof piConfig

