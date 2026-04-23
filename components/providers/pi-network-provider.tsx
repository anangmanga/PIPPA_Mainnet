"use client"

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react"
import { piConfig } from "@/lib/pi/config"

type PiAuthUser = {
  uid: string
  username?: string
  wallet_address?: string
  piUserId?: string
  walletAddress?: string
}

type PiAuthResult = {
  accessToken: string
  user: PiAuthUser
}

type CreatePaymentResult = {
  success: boolean
  paymentId?: string
  error?: string
}

type CreatePaymentInput = {
  orderId: string
  amount: number
  memo: string
  metadata?: Record<string, unknown>
}

type PiNetworkContextValue = {
  isAuthenticated: boolean
  isLoading: boolean
  isPaymentInProgress: boolean
  accessToken: string | null
  user: PiAuthUser | null
  piUserId: string | null
  authenticate: () => Promise<PiAuthResult>
  logout: () => void
  createPayment: (input: CreatePaymentInput) => Promise<CreatePaymentResult>
}

const PiNetworkContext = createContext<PiNetworkContextValue | undefined>(undefined)

const LOCAL_STORAGE_TOKEN_KEY = "pi_access_token"
const LOCAL_STORAGE_USER_KEY = "pi_user"
const LOCAL_STORAGE_PI_USER_ID = "pi_user_id"

const serverBaseUrl = process.env.NEXT_PUBLIC_SERVER_URL

function buildApiUrl(path: string) {
  if (serverBaseUrl) {
    return `${serverBaseUrl.replace(/\/$/, "")}${path}`
  }
  return path
}

export function PiNetworkProvider({ children }: { children: ReactNode }) {
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [user, setUser] = useState<PiAuthUser | null>(null)
  const [piUserId, setPiUserId] = useState<string | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isPaymentInProgress, setIsPaymentInProgress] = useState(false)
  const piInitializedRef = useRef(false)
  const isPiBrowser = useMemo(() => {
    if (typeof navigator === "undefined") {
      return false
    }

    return /PiBrowser/i.test(navigator.userAgent || "")
  }, [])

  const ensurePiInitialized = useCallback(() => {
    if (typeof window === "undefined") {
      throw new Error("Pi SDK not available. Please open this experience in the Pi Browser.")
    }

    const pi = (window as any).Pi

    if (!pi) {
      throw new Error("Pi SDK not available. Please open this experience in the Pi Browser.")
    }

    if (!piInitializedRef.current) {
      try {
        pi.init({ version: "2.0" })
      } catch (initError) {
        console.warn("Pi SDK init error:", initError)
        throw new Error("Pi Network SDK could not be initialized.")
      }
    }

    return pi as any
  }, [])

  const saveAuth = useCallback((token: string, authUser: PiAuthUser) => {
    setAccessToken(token)
    setUser(authUser)
    setPiUserId(authUser.piUserId ?? null)
    setIsAuthenticated(true)
    if (typeof window !== "undefined") {
      localStorage.setItem(LOCAL_STORAGE_TOKEN_KEY, token)
      localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(authUser))
      if (authUser.piUserId) {
        localStorage.setItem(LOCAL_STORAGE_PI_USER_ID, authUser.piUserId)
      } else {
        localStorage.removeItem(LOCAL_STORAGE_PI_USER_ID)
      }
    }
  }, [])

  const clearAuth = useCallback(() => {
    setAccessToken(null)
    setUser(null)
    setPiUserId(null)
    setIsAuthenticated(false)
    if (typeof window !== "undefined") {
      localStorage.removeItem(LOCAL_STORAGE_TOKEN_KEY)
      localStorage.removeItem(LOCAL_STORAGE_USER_KEY)
      localStorage.removeItem(LOCAL_STORAGE_PI_USER_ID)
    }
  }, [])

  useEffect(() => {
    if (typeof window === "undefined") return

    const savedToken = localStorage.getItem(LOCAL_STORAGE_TOKEN_KEY)
    const savedUserRaw = localStorage.getItem(LOCAL_STORAGE_USER_KEY)
    const savedPiUserId = localStorage.getItem(LOCAL_STORAGE_PI_USER_ID)

    if (!savedToken || !savedUserRaw) {
      return
    }

    let parsedUser: PiAuthUser

    try {
      parsedUser = JSON.parse(savedUserRaw) as PiAuthUser
    } catch {
      localStorage.removeItem(LOCAL_STORAGE_TOKEN_KEY)
      localStorage.removeItem(LOCAL_STORAGE_USER_KEY)
      localStorage.removeItem(LOCAL_STORAGE_PI_USER_ID)
      return
    }

    const mergedStoredUser: PiAuthUser = {
      ...parsedUser,
      piUserId: parsedUser.piUserId ?? savedPiUserId ?? undefined,
      walletAddress: parsedUser.walletAddress ?? parsedUser.wallet_address,
    }

    setAccessToken(savedToken)
    setUser(mergedStoredUser)
    setPiUserId(mergedStoredUser.piUserId ?? null)
    setIsLoading(true)

    let cancelled = false

    ;(async () => {
      try {
        const response = await fetch(buildApiUrl("/api/pi/auth/verify"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ accessToken: savedToken }),
        })

        if (!response.ok) {
          throw new Error(`Pi verify failed with status ${response.status}`)
        }

        const data = (await response.json()) as {
          piUser?: { id: string; piUid: string; username?: string | null; walletAddress?: string | null }
        }

        const verifiedUser: PiAuthUser = data.piUser
          ? {
              ...mergedStoredUser,
              uid: mergedStoredUser.uid ?? data.piUser.piUid,
              piUserId: data.piUser.id,
              wallet_address: data.piUser.walletAddress ?? mergedStoredUser.wallet_address,
              walletAddress: data.piUser.walletAddress ?? mergedStoredUser.walletAddress ?? mergedStoredUser.wallet_address,
              username: data.piUser.username ?? mergedStoredUser.username,
            }
          : mergedStoredUser

        if (!cancelled) {
          saveAuth(savedToken, verifiedUser)
        }
      } catch (error) {
        console.warn("Pi auth restore failed:", error)
        if (!cancelled) {
          clearAuth()
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    })()

    return () => {
      cancelled = true
    }
  }, [clearAuth, saveAuth])

  const authenticate = useCallback(async (): Promise<PiAuthResult> => {
    setIsLoading(true)
    try {
      const pi = ensurePiInitialized()
      const onIncompletePaymentFound = (payment: unknown) => {
        console.warn("Incomplete Pi payment detected", payment)
      }

      const auth = (await pi.authenticate(
        ["username", "payments", "wallet_address"],
        onIncompletePaymentFound
      )) as PiAuthResult

      let mergedUser: PiAuthUser = {
        ...auth.user,
        walletAddress: auth.user.wallet_address,
      }

      try {
        const verifyResponse = await fetch(buildApiUrl("/api/pi/auth/verify"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ accessToken: auth.accessToken }),
        })

        if (verifyResponse.ok) {
          const data = (await verifyResponse.json()) as {
            piUser?: { id: string; piUid: string; username?: string | null; walletAddress?: string | null }
          }

          if (data.piUser) {
            mergedUser = {
              ...mergedUser,
              uid: mergedUser.uid ?? data.piUser.piUid,
              piUserId: data.piUser.id,
              wallet_address: data.piUser.walletAddress ?? mergedUser.wallet_address,
              walletAddress: data.piUser.walletAddress ?? mergedUser.walletAddress ?? mergedUser.wallet_address,
              username: data.piUser.username ?? mergedUser.username,
            }
          }
        } else {
          console.warn("Pi auth verification failed with status", verifyResponse.status)
        }
      } catch (error) {
        console.warn("Pi auth verification warning:", error)
      }

      saveAuth(auth.accessToken, mergedUser)

      return { accessToken: auth.accessToken, user: mergedUser }
    } finally {
      setIsLoading(false)
    }
  }, [ensurePiInitialized, saveAuth])

  const logout = useCallback(() => {
    clearAuth()
  }, [clearAuth])

  const createPayment = useCallback(
    async (input: CreatePaymentInput): Promise<CreatePaymentResult> => {
      if (!isAuthenticated) {
        return { success: false, error: "User is not authenticated with Pi Network." }
      }

      if (input.amount <= 0) {
        return { success: false, error: "Invalid payment amount." }
      }

      setIsPaymentInProgress(true)

      const attemptCreatePayment = async (): Promise<CreatePaymentResult> => {
        const pi = ensurePiInitialized()
        const paymentData = {
          amount: Number(input.amount.toFixed(4)),
          memo: input.memo,
          metadata: {
            ...input.metadata,
            orderId: input.orderId,
          },
        }

        return await new Promise<CreatePaymentResult>((resolve) => {
          const handleError = async (errorMessage: string) => {
            await fetch(buildApiUrl(`/api/merchandise/orders/${input.orderId}/cancel`), {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ status: "FAILED", reason: errorMessage }),
            }).catch(() => undefined)

            resolve({ success: false, error: errorMessage })
          }

          const callbacks = {
            onReadyForServerApproval: async (paymentId: string) => {
              try {
                await fetch(buildApiUrl("/api/pi/payments/approve"), {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    paymentId,
                    orderId: input.orderId,
                  }),
                })
              } catch (error) {
                console.error("Pi payment approval failed:", error)
                await handleError("Unable to approve Pi payment. Please try again.")
              }
            },
            onReadyForServerCompletion: async (paymentId: string, txid: string) => {
              try {
                await fetch(buildApiUrl("/api/pi/payments/complete"), {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    paymentId,
                    txid,
                    orderId: input.orderId,
                  }),
                })

                resolve({ success: true, paymentId })
              } catch (error) {
                console.error("Pi payment completion failed:", error)
                await handleError("Unable to confirm Pi payment. Please contact support.")
              } finally {
                setIsPaymentInProgress(false)
              }
            },
            onCancel: async (paymentId: string) => {
              console.warn("Pi payment cancelled", paymentId)
              await fetch(buildApiUrl(`/api/merchandise/orders/${input.orderId}/cancel`), {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  status: "CANCELLED",
                  reason: "User cancelled Pi payment",
                }),
              }).catch(() => undefined)

              resolve({ success: false, error: "Payment was cancelled." })
              setIsPaymentInProgress(false)
            },
            onError: async (error: Error) => {
              console.error("Pi payment error:", error)
              await handleError(error.message || "Pi payment failed.")
              setIsPaymentInProgress(false)
            },
          }

          pi.createPayment(paymentData, callbacks)
        })
      }

      try {
        return await attemptCreatePayment()
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error)
        if (errorMessage.toLowerCase().includes("payments")) {
          try {
            await authenticate()
            piInitializedRef.current = false
            return await attemptCreatePayment()
          } catch (authError) {
            const authMessage = authError instanceof Error ? authError.message : String(authError)
            console.error("Pi payment auth retry failed:", authMessage)
            return {
              success: false,
              error: authMessage || "Pi authentication is required to create payments.",
            }
          }
        }

        console.error("Pi payment creation failed:", error)
        return {
          success: false,
          error: error instanceof Error ? error.message : "Unable to start Pi payment.",
        }
      } finally {
        setIsPaymentInProgress(false)
      }
    },
    [authenticate, ensurePiInitialized, isAuthenticated]
  )

  const value = useMemo<PiNetworkContextValue>(
    () => ({
      isAuthenticated,
      isLoading,
      isPaymentInProgress,
      accessToken,
      user,
      piUserId,
      authenticate,
      logout,
      createPayment,
    }),
    [
      isAuthenticated,
      isLoading,
      isPaymentInProgress,
      accessToken,
      user,
      piUserId,
      authenticate,
      logout,
      createPayment,
    ]
  )

  return <PiNetworkContext.Provider value={value}>{children}</PiNetworkContext.Provider>
}

export function usePiNetwork() {
  const context = useContext(PiNetworkContext)
  if (!context) {
    throw new Error("usePiNetwork must be used within a PiNetworkProvider")
  }
  return context
}

