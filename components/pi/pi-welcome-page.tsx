"use client"

import { useEffect, useState, useCallback, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Plug, Loader2, CheckCircle, AlertCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { usePiNetwork } from "@/components/providers/pi-network-provider"

export function PiWelcomePage() {
  const router = useRouter()
  const { isAuthenticated, authenticate, user } = usePiNetwork()
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState<string>("")
  const [isAuthenticating, setIsAuthenticating] = useState(false)
  const [sdkAvailable, setSdkAvailable] = useState<boolean | null>(null)
  const [autoAttempted, setAutoAttempted] = useState(false)
  const isPiBrowser = useMemo(() => {
    if (typeof navigator === "undefined") {
      return false
    }

    return /PiBrowser/i.test(navigator.userAgent || "")
  }, [])

  useEffect(() => {
    if (typeof window === "undefined") return

    const hasPi = typeof (window as any).Pi !== "undefined"
    setSdkAvailable(hasPi)
  }, [])

  useEffect(() => {
    if (!isAuthenticated) return

    localStorage.setItem("pi_has_authenticated", "true")
    const redirectTimer = setTimeout(() => {
      router.replace("/")
    }, 1200)

    return () => clearTimeout(redirectTimer)
  }, [isAuthenticated, router])

  const handleAuthenticate = useCallback(async () => {
    setError(null)
    setStatus("Checking Pi Browser...")
    setIsAuthenticating(true)

    try {
      if (typeof window === "undefined" || !(window as any).Pi) {
        throw new Error("Pi SDK not available. Please open this app in Pi Browser.")
      }

      setStatus("Connecting to Pi Network...")
      await authenticate()

      setStatus("Authentication successful!")
    } catch (authError) {
      console.error("Pi authentication error:", authError)
      const message =
        authError instanceof Error
          ? authError.message || "Authentication failed. Please try again."
          : "Authentication failed. Please try again."
      setError(message)
      setStatus("")
    } finally {
      setIsAuthenticating(false)
    }
  }, [authenticate])

  const handleSkip = useCallback(() => {
    router.replace("/")
  }, [router])

  useEffect(() => {
    if (sdkAvailable === true && isPiBrowser && !isAuthenticated && !autoAttempted) {
      setAutoAttempted(true)
      void handleAuthenticate()
    }
  }, [autoAttempted, handleAuthenticate, isAuthenticated, isPiBrowser, sdkAvailable])

  useEffect(() => {
    if (sdkAvailable === false && !isPiBrowser && !autoAttempted) {
      setAutoAttempted(true)
      handleSkip()
    }
  }, [autoAttempted, handleSkip, isPiBrowser, sdkAvailable])

  return (
    <div className="flex min-h-screen items-center justify-center bg-jet-black">
      <Card className="w-full max-w-md border-mint-blue/20 bg-card/80 backdrop-blur">
        <CardHeader className="text-center space-y-3">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-mint-blue/20">
            <Plug className="h-8 w-8 text-mint-blue" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight text-foreground">
            Welcome to PIPPA
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Authenticate with your Pi Browser to continue.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {sdkAvailable === false && (
            <div className="flex items-center gap-2 rounded-lg border border-yellow-500/40 bg-yellow-500/10 p-3 text-sm text-yellow-200">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>Please open this experience inside the Pi Browser to enable wallet access.</span>
            </div>
          )}

          {!isPiBrowser && sdkAvailable === false && (
            <div className="flex items-center gap-2 rounded-lg border border-blue-500/40 bg-blue-500/10 p-3 text-sm text-blue-200">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>You are viewing the read-only experience. Pi authentication is skipped outside the Pi Browser.</span>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-200">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {isAuthenticated ? (
            <div className="text-center space-y-2">
              <CheckCircle className="mx-auto h-10 w-10 text-solar-lime" />
              <p className="text-sm font-medium text-muted-foreground">
                {user?.username ? `Welcome back, ${user.username}!` : "Pi wallet connected."}
              </p>
              <p className="text-xs text-muted-foreground/80">Redirecting you ...</p>
            </div>
          ) : (
            <>
              {sdkAvailable !== false && (
                <Button
                  onClick={handleAuthenticate}
                  disabled={isAuthenticating}
                  className="w-full bg-mint-blue text-jet-black hover:bg-mint-blue/90"
                >
                  {isAuthenticating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {status || "Connecting..."}
                    </>
                  ) : (
                    <>
                      <Plug className="mr-2 h-4 w-4" />
                      Connect Pi Browser
                    </>
                  )}
                </Button>
              )}

              {/* <Button
                variant="outline"
                onClick={handleSkip}
                disabled={isAuthenticating}
                className="w-full border-mint-blue text-mint-blue hover:bg-mint-blue/10"
              >
                Enter without Pi Auth
              </Button> */}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

