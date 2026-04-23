# PIPAPPA

Modern Pi Network-powered storefront and collection explorer for the **Pippa Pie** IP.  
The project now supports dynamic content (via Prisma + Prisma Accelerate), ZyraChain-backed Pi pricing, Pi Browser payments, and an authenticated admin dashboard for managing content.

---

## ⚙️ Requirements

- Node.js 20+
- pnpm (`npm install -g pnpm`) or npm
- PostgreSQL database (local or managed; Prisma Accelerate optional but recommended)
- Pi Developer credentials (API key, App ID)
- ZyraChain API (public) for Pi ↔ USD price snapshots [docs](https://www.zyrachain.org/api/v1/price)

---

## 📦 Installation

```bash
pnpm install          # install dependencies
pnpm prisma generate  # generate Prisma Client (required after schema updates)
pnpm dev              # start Next.js dev server
```

> **Important:** Re-run `pnpm prisma generate` any time you edit `prisma/schema.prisma` so TypeScript sees the latest model delegates.

---

## 🔐 Environment Variables

Create `.env` with these values:

```dotenv
DATABASE_URL="postgres://..."
PRISMA_ACCELERATE_URL="..."           # optional, use if Prisma Accelerate enabled

# Admin dashboard
ADMIN_SECRET="choose-a-strong-passcode"

# Pi integration
PI_API_KEY="your-pi-platform-api-key"
PI_APP_ID="your-pi-app-id"            # optional, for analytics/auditing
NEXT_PUBLIC_PI_SANDBOX="true"         # false in production
NEXT_PUBLIC_SERVER_URL="https://your-domain.com" # used by client actions

# ZyraChain (optional – uses default public endpoint otherwise)
ZYRACHAIN_BASE_URL="https://www.zyrachain.org"
```

For development you can point `NEXT_PUBLIC_SERVER_URL` to `http://localhost:3000`.

---

## 🗄️ Database & Content

- Prisma schema lives in `prisma/schema.prisma`.
- Seed script (`prisma/seed.ts`) migrates existing hard-coded Explore/Merchandise copy into the database, including:
  - Collections, traits, rarity tiers, hero media
  - Featured NFTs
  - Merchandise catalog (with gallery media + USD pricing)
  - Promo blocks, community links, footer links
  - Initial Pi price snapshot
- Run `pnpm prisma db push` to sync schema, then `pnpm prisma db seed` (or `node prisma/seed.ts`) to populate.

---

## 🛠️ Admin Dashboard

Available at `/admin` (protected by `admin/middleware.ts`). First visit `/admin/login` and submit the `ADMIN_SECRET`.

### Features

- **Collections**: Update copy, hero image URL, minting link, order, verification flag.
- **Merchandise**: Update details, price, delivery regions, optional external link, upload a new product image.
- **Promo Blocks**: Manage homepage hero narrative, merchandise promo, lore callout, footer ticker.
- **Community Links**: CRUD for Discord/Twitter/etc.
- **Footer Links**: Manage legal navigation.
- **Pi Pricing Monitor**: Shows latest ZyraChain snapshot with manual sync button.

Uploads automatically store files in `/public/uploads` during development and in Vercel Blob storage when deployed (via `lib/services/uploads.ts`).

---

## 💳 Pi Network Integration

- SDK bootstrapped globally in `app/layout.tsx` (respects `NEXT_PUBLIC_PI_SANDBOX`).
- `PiNetworkProvider` (`components/providers/pi-network-provider.tsx`) handles:
  - Authentication via Pi Browser (`Pi.authenticate`) with persistent tokens.
  - Payment lifecycle: create order → request Pi payment → approve/complete via Next API routes.
  - Graceful cancellation & error handling (orders roll back if payment fails).
- API routes under `app/api/pi` proxy to the Pi Platform REST API using `lib/pi/platform.ts`.

**Merchandise checkout** (`components/merchandise/purchase-button.tsx`) now requires Pi auth, creates an order, kicks off a Pi payment, and tracks status updates from approval → completion → cancellation, showing clear user messaging throughout.

---

## 💸 Pricing / ZyraChain

- ZyraChain [price endpoint](https://www.zyrachain.org/api/v1/price) pulled hourly (cron-compatible route `app/api/admin/sync-pi-price/route.ts`).
- Latest snapshot cached via Prisma (`PiPriceSnapshot`) and rendered on `/merchandise` along with a “last updated” hint.
- Merchandise cards display both USD and derived Pi price per the latest rate.

---

## 🧪 Testing Guide

Manual smoke-test plan after each deployment (also tucked under `docs/testing.md` if you prefer a checklist):

1. **Admin Auth**
   - Visit `/admin/login`, enter `ADMIN_SECRET`, expect redirect to `/admin`.
   - Sign out, ensure guard prevents accessing `/admin` without logging back in.
2. **Collections & Promo updates**
   - Change a collection title, save, refresh `/explore` to confirm.
   - Update hero promo block text/media, verify homepage reflects change.
3. **Merchandise editing**
   - Change USD price and image for an item; confirm Pi price auto-updates and new image renders.
   - Ensure delivery disclaimer banner persists.
4. **Pi Pricing sync**
   - Hit “Sync latest price” in admin, verify timestamp changes and Pi-to-USD rate updates on `/merchandise`.
5. **Checkout flow (Pi Browser)**
   - Authenticate in Pi Browser, submit an order, ensure payment prompt appears.
   - Cancel payment, confirm admin order status moves to “Cancelled”.
6. **Error handling**
   - Temporarily disable ZyraChain endpoint (e.g. via dev tools) and confirm fallback messaging appears.

> For automation, you can extend the testing doc with Playwright or Cypress scripts once headless Pi Browser testing support is available.

---

## 🚀 Deployment Notes

- Set environment variables in your platform (Vercel, Render, etc.).
- Ensure Prisma Accelerate datasource is reachable if `PRISMA_ACCELERATE_URL` is set.
- For image uploads: grant write access to Vercel Blob (automatically handled when on Vercel; configure `BLOB_READ_WRITE_TOKEN` if using the API).
- Run `pnpm prisma generate` during CI/CD prior to building so the client matches the schema.
- Sanity-check pricing via `/admin` after deploy, then run through the testing checklist above.

---

## 🧑‍🍳 Lore (optional site copy)

Feel free to keep or remix this origin story for the marketing site:

> In the decentralized realm of the Pi Network, where mobile mining and peer-to-peer transactions reign supreme, a non conformist emerged from the blockchain—a sentient pie named Pippa…