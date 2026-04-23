'use client'

import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { usePiNetwork } from "@/components/providers/pi-network-provider"
import { toast } from "sonner"

const allowedCountries = [
  "USA",
  "United States",
  "Canada",
  "United Kingdom",
  "France",
  "Germany",
  "Spain",
  "Italy",
  "Netherlands",
  "Belgium",
  "Portugal",
  "Ireland",
  "Sweden",
  "Norway",
  "Denmark",
  "Finland",
  "Switzerland",
  "Austria",
]

type MerchandisePurchaseButtonProps = {
  merchId: string
  title: string
  unitUsd: number
  unitPi: number | null
}

type FormState = {
  name: string
  email: string
  phone: string
  quantity: number
  address1: string
  address2: string
  city: string
  state: string
  postalCode: string
  country: string
}

const initialForm: FormState = {
  name: "",
  email: "",
  phone: "",
  quantity: 1,
  address1: "",
  address2: "",
  city: "",
  state: "",
  postalCode: "",
  country: allowedCountries[0],
}

export function MerchandisePurchaseButton({ merchId, title, unitUsd, unitPi }: MerchandisePurchaseButtonProps) {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState<FormState>(initialForm)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { isAuthenticated, authenticate, createPayment, isPaymentInProgress, user, piUserId } = usePiNetwork()

  const isBusy = useMemo(() => loading || isPaymentInProgress, [loading, isPaymentInProgress])

  useEffect(() => {
    if (typeof document === "undefined") {
      return
    }

    if (open) {
      const previousOverflow = document.documentElement.style.overflow
      const previousBodyOverflow = document.body.style.overflow
      document.documentElement.style.overflow = "hidden"
      document.body.style.overflow = "hidden"

      return () => {
        document.documentElement.style.overflow = previousOverflow
        document.body.style.overflow = previousBodyOverflow
      }
    }
  }, [open])

  const handleChange = (field: keyof FormState, value: string) => {
    setForm((prev) => ({
      ...prev,
      [field]: field === "quantity" ? Math.max(1, Number(value) || 1) : value,
    }))
  }

  const resetState = () => {
    setForm(initialForm)
    setError(null)
    setLoading(false)
  }

  const handleClose = () => {
    setOpen(false)
    resetState()
  }

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault()
    setLoading(true)
    setError(null)

    if (unitPi === null) {
      setError("Pi pricing is unavailable right now. Please try again later.")
      setLoading(false)
      return
    }

    let orderId: string | undefined

    try {
      if (!isAuthenticated) {
        try {
          await authenticate()
        } catch (authError) {
          throw new Error((authError as Error).message || "Pi authentication failed. Please try again in the Pi Browser.")
        }
      }

      const orderResponse = await fetch("/api/merchandise/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          merchId,
          quantity: form.quantity,
          customer: {
            name: form.name,
            email: form.email,
            phone: form.phone || undefined,
          },
          shipping: {
            address1: form.address1,
            address2: form.address2 || undefined,
            city: form.city,
            state: form.state || undefined,
            postalCode: form.postalCode,
            country: form.country,
          },
          piUserId: piUserId ?? user?.piUserId,
        }),
      })

      if (!orderResponse.ok) {
        const body = await orderResponse.json().catch(() => ({}))
        throw new Error(body.error ?? "Unable to create order")
      }

      const orderData = await orderResponse.json()
      orderId = orderData.orderId as string
      const totalPi = Number(orderData.totalPi)

      const paymentResult = await createPayment({
        orderId,
        amount: totalPi,
        memo: `${title} x${form.quantity}`,
        metadata: {
          merchId,
          quantity: form.quantity,
          unitUsd,
          unitPi,
        },
      })

      if (!paymentResult.success) {
        const reason = paymentResult.error ?? "Unable to initiate Pi payment."
        setError(reason)
        await fetch(`/api/merchandise/orders/${orderId}/cancel`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "FAILED", reason }),
        }).catch(() => undefined)
        return
      }

      toast.success("Pi payment request sent. Complete the transaction in the Pi Browser.")
      handleClose()
    } catch (err) {
      console.error("Pi payment failed", err)
      setError((err as Error).message || "Something went wrong")

      if (orderId) {
        await fetch(`/api/merchandise/orders/${orderId}/cancel`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: "FAILED",
            reason: (err as Error).message,
          }),
        }).catch(() => null)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full" disabled={unitPi === null}>
          {unitPi !== null ? "Checkout with Pi" : "Pi Price Unavailable"}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[min(100%,420px)] sm:max-w-lg max-h-[calc(100vh-2rem)] sm:max-h-[85vh] top-auto bottom-4 left-1/2 translate-y-0 sm:top-1/2 sm:bottom-auto sm:translate-y-[-50%] p-0 flex flex-col">
        <DialogHeader className="px-6 pt-6 pb-4 text-left shrink-0">
          <DialogTitle>Checkout</DialogTitle>
          <DialogDescription>
            Provide your details to reserve <strong>{title}</strong>. Delivery currently supports USA, Canada, and select European countries.
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto px-6 pb-6">
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" required value={form.name} onChange={(event) => handleChange("name", event.target.value)} />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                required
                value={form.email}
                onChange={(event) => handleChange("email", event.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone (optional)</Label>
              <Input id="phone" value={form.phone} onChange={(event) => handleChange("phone", event.target.value)} />
            </div>
            <div>
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                min={1}
                value={form.quantity}
                onChange={(event) => handleChange("quantity", event.target.value)}
              />
            </div>
          </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <Label htmlFor="address1">Address line 1</Label>
              <Input id="address1" required value={form.address1} onChange={(event) => handleChange("address1", event.target.value)} />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="address2">Address line 2 (optional)</Label>
              <Input id="address2" value={form.address2} onChange={(event) => handleChange("address2", event.target.value)} />
            </div>
            <div>
              <Label htmlFor="city">City</Label>
              <Input id="city" required value={form.city} onChange={(event) => handleChange("city", event.target.value)} />
            </div>
            <div>
              <Label htmlFor="state">State / Region</Label>
              <Input id="state" value={form.state} onChange={(event) => handleChange("state", event.target.value)} />
            </div>
            <div>
              <Label htmlFor="postalCode">Postal Code</Label>
              <Input
                id="postalCode"
                required
                value={form.postalCode}
                onChange={(event) => handleChange("postalCode", event.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="country">Country</Label>
              <select
                id="country"
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                value={form.country}
                onChange={(event) => handleChange("country", event.target.value)}
                aria-label="Delivery country"
              >
                {allowedCountries.map((country) => (
                  <option key={country} value={country}>
                    {country}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="rounded-md border border-border bg-muted/40 p-4 text-sm text-muted-foreground space-y-1">
            <p>
              Total: <strong>${(unitUsd * form.quantity).toFixed(2)}</strong>
            </p>
            <p>
              Approximate Pi amount: <strong>{unitPi !== null ? (unitPi * form.quantity).toFixed(4) : "--"} Pi</strong>
            </p>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <DialogFooter className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
            <Button type="button" variant="outline" onClick={handleClose} disabled={isBusy}>
              Cancel
            </Button>
            <Button type="submit" disabled={isBusy}>
              {isBusy ? "Processing…" : "Pay with Pi"}
            </Button>
          </DialogFooter>
        </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
