import { authenticateAdmin } from "../actions"

type LoginPageProps = {
  searchParams: {
    redirect?: string
    error?: string
  }
}

export default function LoginPage({ searchParams }: LoginPageProps) {
  const redirectTo = searchParams.redirect ?? "/admin"
  const hasError = Boolean(searchParams.error)

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 px-4">
      <div className="w-full max-w-md rounded-lg border border-border bg-background/95 p-8 shadow-xl backdrop-blur">
        <div className="space-y-2 text-center">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Pippa Pie Admin</p>
          <h1 className="text-2xl font-semibold">Sign in to continue</h1>
        </div>

        <form action={authenticateAdmin} className="mt-8 space-y-5">
          <input type="hidden" name="redirect" value={redirectTo} />

          <div className="space-y-2 text-left">
            <label htmlFor="password" className="text-sm font-medium text-muted-foreground">
              Admin Passcode
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none ring-offset-background transition focus:ring-2 focus:ring-primary/60 focus:ring-offset-2"
              placeholder="Enter passcode"
            />
          </div>

          {hasError && (
            <p className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              Invalid passcode. Please try again.
            </p>
          )}

          <button
            type="submit"
            className="w-full rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  )
}

