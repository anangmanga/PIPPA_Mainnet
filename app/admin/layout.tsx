import type { Metadata } from "next"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { getAdminSession } from "@/lib/admin-auth"

export const metadata: Metadata = {
  title: "Pippa Admin",
  description: "Manage collections, merchandise, and promos for the Pippa Pie experience.",
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getAdminSession()
  const adminEmail = session.status === "ok" ? session.email : null

  return (
    <div className="min-h-screen bg-muted/40">
      <header className="border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <p className="text-sm uppercase tracking-wide text-muted-foreground">Administration</p>
            <h1 className="text-xl font-semibold">Pippa Pie Control Center</h1>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {adminEmail ? (
              <Badge variant="secondary" className="px-3 py-1 text-xs sm:text-sm">
                Signed in as {adminEmail}
              </Badge>
            ) : (
              <Badge variant="destructive" className="px-3 py-1 text-xs sm:text-sm">
                Admin access pending
              </Badge>
            )}
            <Link href="/" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
              View Site
            </Link>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">{children}</main>
    </div>
  )
}

