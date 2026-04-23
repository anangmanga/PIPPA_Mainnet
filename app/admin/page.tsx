import { formatDistanceToNow } from "date-fns"
import {
  Prisma,
  OrderStatus,
  PromoPlacement,
  type Collection,
  type CommunityLink,
  type FooterLink,
  type MerchItem,
  type PiPriceSnapshot,
  type PromoBlock,
} from "@prisma/client"
import { prisma } from "@/lib/prisma"
import { requireAdmin } from "@/lib/admin-auth"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  addAdminUserAction,
  createCommunityLinkAction,
  createNftAction,
  deleteCommunityLinkAction,
  deleteNftAction,
  removeAdminUserAction,
  syncPiPriceAction,
  updateCollectionAction,
  updateCommunityLinkAction,
  updateFooterLinkAction,
  updateMerchItemAction,
  updateNftAction,
  updatePromoBlockAction,
} from "./actions"
import { getNfts, type NftWithCollection } from "@/lib/data/collections"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export const revalidate = 0
export const dynamic = "force-dynamic"

const promoPlacements: PromoPlacement[] = [
  PromoPlacement.MERCHANDISE_HERO,
  PromoPlacement.WELCOME_NARRATIVE,
  PromoPlacement.COMMUNITY_CALLOUT,
  PromoPlacement.FOOTER_CALLOUT,
]

const orderStatusLabels: Record<OrderStatus, string> = {
  [OrderStatus.PENDING]: "Pending",
  [OrderStatus.CONFIRMED]: "Confirmed",
  [OrderStatus.FAILED]: "Failed",
  [OrderStatus.CANCELLED]: "Cancelled",
  [OrderStatus.FULFILLED]: "Fulfilled",
}

const orderStatusDisplayOrder: OrderStatus[] = [
  OrderStatus.PENDING,
  OrderStatus.CONFIRMED,
  OrderStatus.FULFILLED,
  OrderStatus.FAILED,
  OrderStatus.CANCELLED,
]

const orderStatusVariants: Record<OrderStatus, "default" | "secondary" | "outline" | "destructive"> = {
  [OrderStatus.PENDING]: "secondary",
  [OrderStatus.CONFIRMED]: "default",
  [OrderStatus.FULFILLED]: "default",
  [OrderStatus.FAILED]: "destructive",
  [OrderStatus.CANCELLED]: "outline",
  }

type AdminNft = NftWithCollection

function formatGalleryValue(gallery: string[] | null | undefined) {
  return gallery?.join("\n") ?? ""
}

function formatAttributesValue(attributes: Prisma.JsonValue | null | undefined) {
  if (!attributes) return ""
  try {
    return JSON.stringify(attributes, null, 2)
  } catch (error) {
    console.error("Failed to stringify attributes", error)
    return ""
  }
}

type AdminOrder = Prisma.OrderGetPayload<{
  include: {
    merchItem: { select: { title: true } }
    shippingAddress: true
    piUser: { select: { piUid: true; username: true } }
  }
}>

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value)

const toNumber = (value: Prisma.Decimal | number | string | null | undefined) =>
  value === null || value === undefined ? 0 : Number(value)

const formatPiAmount = (value: number) => `${value.toFixed(4)} π`

export default async function AdminPage() {
  await requireAdmin()

  const collections: Collection[] = await prisma.collection.findMany({
    orderBy: { displayOrder: "asc" },
  })
  const merchItems: MerchItem[] = await prisma.merchItem.findMany({
    orderBy: { createdAt: "asc" },
  })
  const promoBlocks: PromoBlock[] = await prisma.promoBlock.findMany()
  const communityLinks: CommunityLink[] = await prisma.communityLink.findMany({
    orderBy: [{ displayOrder: "asc" }, { name: "asc" }],
  })
  const footerLinks: FooterLink[] = await prisma.footerLink.findMany({
    orderBy: [{ displayOrder: "asc" }, { label: "asc" }],
  })
  const priceSnapshots: PiPriceSnapshot[] = await prisma.piPriceSnapshot.findMany({
    orderBy: { fetchedAt: "desc" },
    take: 5,
  })
  const adminUsers = (await (prisma as any).adminUser.findMany({
    orderBy: { createdAt: "asc" },
  })) as Array<{ id: string; email: string; createdAt: Date; updatedAt: Date }>
  const orders: AdminOrder[] = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      merchItem: { select: { title: true } },
      shippingAddress: true,
      piUser: { select: { piUid: true, username: true } },
    },
  })
  const nfts = (await getNfts()) as AdminNft[]

  const totalOrders = await prisma.order.count()
  const orderStatusGroupsRaw = await prisma.order.groupBy({
    by: ["status"],
    _count: { _all: true },
  })
  const orderStatusGroups = orderStatusGroupsRaw as Array<{ status: OrderStatus; _count: { _all: number } }>
  const revenueAggregate = await prisma.order.aggregate({
    _sum: { totalUsd: true, totalPi: true },
  })
  const piUserCount = await prisma.piUser.count()
  const totalNfts = nfts.length
  const featuredCount = nfts.filter((nft) => nft.isFeatured).length
  const collectionOptions = collections.map((collection) => ({
    id: collection.id,
    name: collection.name,
  }))

  const promoMap = new Map<PromoPlacement, PromoBlock>(
    promoBlocks.map((block: PromoBlock) => [block.placement, block]),
  )
  const statusCounts = new Map<OrderStatus, number>(
    orderStatusGroups.map((group) => [group.status, group._count._all]),
  )
  const verifiedCollections = collections.filter((collection) => collection.verified).length
  const activeCommunity = communityLinks.filter((link) => link.isActive).length
  const latestSnapshot = priceSnapshots[0] ?? null
  const totalUsd = revenueAggregate._sum.totalUsd ? Number(revenueAggregate._sum.totalUsd) : 0
  const totalPi = revenueAggregate._sum.totalPi ? Number(revenueAggregate._sum.totalPi) : 0

  const metrics = [
    {
      label: "Collections",
      value: collections.length.toLocaleString(),
      helper: `${verifiedCollections} verified`,
    },
    {
      label: "NFTs",
      value: totalNfts.toLocaleString(),
      helper: `${featuredCount} featured`,
    },
    {
      label: "Merchandise",
      value: merchItems.length.toLocaleString(),
      helper: `${merchItems.length} items live`,
    },
    {
      label: "Community Links",
      value: communityLinks.length.toLocaleString(),
      helper: `${activeCommunity} active`,
    },
    {
      label: "Admin Accounts",
      value: adminUsers.length.toLocaleString(),
      helper: "Email-restricted access",
    },
    {
      label: "Orders",
      value: totalOrders.toLocaleString(),
      helper: `${statusCounts.get(OrderStatus.PENDING) ?? 0} pending`,
    },
    {
      label: "Total USD Volume",
      value: formatCurrency(totalUsd),
      helper: `${totalPi.toFixed(2)} π lifetime`,
    },
  ]

  const orderStatusRows = orderStatusDisplayOrder.map((status) => ({
    status,
    count: statusCounts.get(status) ?? 0,
  }))

  return (
    <div className="space-y-10 pb-16">
      <section className="rounded-xl border border-border/60 bg-background/80 p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="space-y-3">
            <Badge variant="secondary" className="w-fit uppercase tracking-wide">
              Dashboard
            </Badge>
            <h1 className="text-3xl font-bold tracking-tight">Pippa Admin Dashboard</h1>
            <p className="max-w-2xl text-muted-foreground">
              Monitor key content, manage storefront data, and keep the Pippa community experiences fresh across
              the ecosystem.
            </p>
          </div>
          <div className="w-full max-w-sm">
            <Card className="border-primary/30 bg-primary/5">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-primary">Latest Pi Price</CardTitle>
                <CardDescription>
                  {latestSnapshot ? `1 π ≈ $${Number(latestSnapshot.piToUsdRate).toFixed(4)}` : "No snapshots yet"}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-xs text-muted-foreground">
                  {latestSnapshot
                    ? `Updated ${formatDistanceToNow(latestSnapshot.fetchedAt, { addSuffix: true })}`
                    : "Run a sync to record the first snapshot."}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {metrics.map((metric) => (
            <Card key={metric.label} className="border-border/60 bg-card/70">
              <CardHeader className="pb-2">
                <CardDescription>{metric.label}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-1">
                <p className="text-2xl font-semibold text-foreground">{metric.value}</p>
                {metric.helper ? <p className="text-xs text-muted-foreground">{metric.helper}</p> : null}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <Card className="border-border/60 bg-card/70">
          <CardHeader>
            <CardTitle>Operational Snapshot</CardTitle>
            <CardDescription>Track orders and Pi Network users at a glance.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {orderStatusRows.map((row) => (
                <div
                  key={row.status}
                  className="flex items-center justify-between rounded-lg border border-border/60 bg-background/60 px-3 py-2"
                >
                  <span className="text-sm font-medium text-foreground">{orderStatusLabels[row.status]}</span>
                  <Badge variant="outline" className="px-3">
                    {row.count}
                  </Badge>
                </div>
              ))}
            </div>
            <div className="rounded-lg border border-dashed border-primary/40 bg-primary/5 px-4 py-3 text-sm text-primary">
              {piUserCount.toLocaleString()} Pi Network profiles tracked
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card/70">
          <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Pi Pricing Monitor</CardTitle>
              <CardDescription>
                Pricing conversions refresh hourly. Trigger a manual sync when updating merchandise amounts.
              </CardDescription>
            </div>
            <form action={syncPiPriceAction}>
              <Button
                type="submit"
                variant="outline"
                className="border-primary/60 text-primary hover:bg-primary/10 hover:text-primary"
              >
                Sync latest price
              </Button>
            </form>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            {latestSnapshot ? (
              <p>
                Current rate:{" "}
                <span className="font-semibold text-foreground">
                  1 π ≈ ${Number(latestSnapshot.piToUsdRate).toFixed(4)}
                </span>{" "}
                (updated {formatDistanceToNow(latestSnapshot.fetchedAt, { addSuffix: true })})
              </p>
            ) : (
              <p>No price snapshots recorded yet.</p>
            )}

            {priceSnapshots.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Recent snapshots</h3>
                <ul className="space-y-1 text-xs">
                  {priceSnapshots.map((snapshot: PiPriceSnapshot) => (
                    <li
                      key={snapshot.id}
                      className="flex justify-between rounded-md border border-border/40 bg-background/80 px-3 py-2"
                    >
                      <span>1 π ≈ ${Number(snapshot.piToUsdRate).toFixed(4)}</span>
                      <span>{formatDistanceToNow(snapshot.fetchedAt, { addSuffix: true })}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      <Tabs defaultValue="collections" className="space-y-6 lg:space-y-8">
        <TabsList className="grid w-full gap-1.5 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-8">
          <TabsTrigger value="collections">Collections</TabsTrigger>
          <TabsTrigger value="nfts">NFTs</TabsTrigger>
          <TabsTrigger value="merchandise">Merchandise</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="promotions">Promotions</TabsTrigger>
          <TabsTrigger value="community">Community</TabsTrigger>
          <TabsTrigger value="footer">Footer</TabsTrigger>
          <TabsTrigger value="access">Admin Access</TabsTrigger>
        </TabsList>

        <TabsContent value="collections" className="space-y-4">
          <section className="space-y-3">
        <header>
          <h2 className="text-xl font-semibold">Collections</h2>
          <p className="text-xs text-muted-foreground">
            Manage collection details that power the Explore experience and hero carousel.
          </p>
        </header>

        <div className="grid gap-4">
              {collections.map((collection: Collection) => (
            <form
              key={collection.id}
              action={updateCollectionAction}
              className="grid gap-3 rounded-lg border border-border bg-card/70 p-3 shadow-sm transition hover:border-primary/60 md:grid-cols-2"
            >
              <input type="hidden" name="id" value={collection.id} />

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground" htmlFor={`collection-name-${collection.id}`}>
                  Name
                </label>
                <input
                  id={`collection-name-${collection.id}`}
                  name="name"
                  defaultValue={collection.name}
                  required
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/60"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground" htmlFor={`collection-mint-${collection.id}`}>
                  Minting URL
                </label>
                <input
                  id={`collection-mint-${collection.id}`}
                  name="mintingUrl"
                  defaultValue={collection.mintingUrl ?? ""}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/60"
                  placeholder="https://"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium text-muted-foreground" htmlFor={`collection-summary-${collection.id}`}>
                  Summary
                </label>
                <textarea
                  id={`collection-summary-${collection.id}`}
                  name="summary"
                  defaultValue={collection.summary ?? ""}
                  className="min-h-[80px] w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/60"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium text-muted-foreground" htmlFor={`collection-heroCopy-${collection.id}`}>
                  Hero Copy
                </label>
                <textarea
                  id={`collection-heroCopy-${collection.id}`}
                  name="heroCopy"
                  defaultValue={collection.heroCopy ?? ""}
                  className="min-h-[60px] w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/60"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground" htmlFor={`collection-heroImage-${collection.id}`}>
                  Hero Image URL
                </label>
                <input
                  id={`collection-heroImage-${collection.id}`}
                  name="heroImage"
                  defaultValue={collection.heroImage ?? ""}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/60"
                  placeholder="/pippa/B4.png"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground" htmlFor={`collection-display-${collection.id}`}>
                  Display Order
                </label>
                <input
                  id={`collection-display-${collection.id}`}
                  name="displayOrder"
                  type="number"
                  defaultValue={collection.displayOrder ?? 0}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/60"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  id={`collection-verified-${collection.id}`}
                  name="verified"
                  type="checkbox"
                  defaultChecked={collection.verified}
                  className="h-4 w-4 rounded border-border accent-primary"
                />
                <label htmlFor={`collection-verified-${collection.id}`} className="text-sm text-muted-foreground">
                  Verified collection
                </label>
              </div>

              <Button type="submit" className="md:col-span-2 w-full md:w-fit">Save Collection</Button>
            </form>
          ))}
        </div>
      </section>
        </TabsContent>

        <TabsContent value="nfts" className="space-y-4">
          <section className="space-y-4">
            <header className="space-y-1.5">
              <h2 className="text-xl font-semibold">NFT Library</h2>
              <p className="text-xs text-muted-foreground">
                Create and manage NFTs for each collection. Use the featured toggle to surface items across the public site.
              </p>
            </header>

            <Card className="border-dashed border-border/60 bg-card/60">
              <CardHeader>
                <CardTitle>Add New NFT</CardTitle>
                <CardDescription>Seed fresh characters, artwork, or lore into the Pieverse.</CardDescription>
              </CardHeader>
              <CardContent>
                <form action={createNftAction} className="grid gap-3 md:grid-cols-2">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground" htmlFor="nft-create-name">
                      Name
                    </label>
                    <input
                      id="nft-create-name"
                      name="name"
                      required
                      className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/60"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground" htmlFor="nft-create-slug">
                      Slug
                    </label>
                    <input
                      id="nft-create-slug"
                      name="slug"
                      required
                      className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/60"
                      placeholder="pippa-classic"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground" htmlFor="nft-create-subtitle">
                      Subtitle
                    </label>
                    <input
                      id="nft-create-subtitle"
                      name="subtitle"
                      className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/60"
                      placeholder="Short tagline"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground" htmlFor="nft-create-rarity">
                      Rarity
                    </label>
                    <input
                      id="nft-create-rarity"
                      name="rarity"
                      className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/60"
                      placeholder="Common, Rare..."
                    />
                  </div>

                  <div className="space-y-1 md:col-span-2">
                    <label className="text-xs font-medium text-muted-foreground" htmlFor="nft-create-description">
                      Description
                    </label>
                    <textarea
                      id="nft-create-description"
                      name="description"
                      className="min-h-[80px] w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/60"
                      placeholder="Story, lore, or drop details."
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground" htmlFor="nft-create-image">
                      Image URL
                    </label>
                    <input
                      id="nft-create-image"
                      name="image"
                      required
                      className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/60"
                      placeholder="/bg/1.png"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground" htmlFor="nft-create-gallery">
                      Gallery URLs (one per line)
                    </label>
                    <textarea
                      id="nft-create-gallery"
                      name="gallery"
                      className="min-h-[80px] w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/60"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground" htmlFor="nft-create-rank">
                      Rank
                    </label>
                    <input
                      id="nft-create-rank"
                      name="rank"
                      type="number"
                      min="0"
                      className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/60"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground" htmlFor="nft-create-score">
                      Score
                    </label>
                    <input
                      id="nft-create-score"
                      name="score"
                      type="number"
                      step="0.1"
                      className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/60"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground" htmlFor="nft-create-supply">
                      Supply Number
                    </label>
                    <input
                      id="nft-create-supply"
                      name="supplyNumber"
                      type="number"
                      min="0"
                      className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/60"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground" htmlFor="nft-create-displayOrder">
                      Display Order
                    </label>
                    <input
                      id="nft-create-displayOrder"
                      name="displayOrder"
                      type="number"
                      defaultValue={totalNfts + 1}
                      className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/60"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground" htmlFor="nft-create-external">
                      External URL
                    </label>
                    <input
                      id="nft-create-external"
                      name="externalUrl"
                      className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/60"
                      placeholder="https://"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground" htmlFor="nft-create-collection">
                      Collection
                    </label>
                    <select
                      id="nft-create-collection"
                      name="collectionId"
                      required
                      className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/60"
                      defaultValue=""
                    >
                      <option value="" disabled>
                        Select collection
                      </option>
                      {collectionOptions.map((collection) => (
                        <option key={collection.id} value={collection.id}>
                          {collection.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1 md:col-span-2">
                    <label className="text-xs font-medium text-muted-foreground" htmlFor="nft-create-attributes">
                      Attributes JSON
                    </label>
                    <textarea
                      id="nft-create-attributes"
                      name="attributes"
                      className="min-h-[80px] w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/60 font-mono"
                      placeholder='[{"name":"Accessory","value":"Golden Fork"}]'
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      id="nft-create-featured"
                      name="isFeatured"
                      type="checkbox"
                      className="h-4 w-4 rounded border-border accent-primary"
                    />
                    <label htmlFor="nft-create-featured" className="text-xs text-muted-foreground">
                      Mark as featured
                    </label>
                  </div>

                  <Button type="submit" className="md:col-span-2 w-full md:w-fit">
                    Create NFT
                  </Button>
                </form>
              </CardContent>
            </Card>

            {nfts.length === 0 ? (
              <Card className="border-border/60 bg-card/70">
                <CardContent className="py-10 text-center text-sm text-muted-foreground">
                  No NFTs found. Seed a new record to begin curating the collection.
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {nfts.map((nft) => (
                  <Card key={nft.id} className="border-border/60 bg-card/70">
                    <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                      <div>
                        <CardTitle>{nft.name}</CardTitle>
                        <CardDescription>
                          {nft.slug} • {nft.collection?.name ?? "Unassigned"}
                        </CardDescription>
                      </div>
                      <form action={deleteNftAction} className="self-start">
                        <input type="hidden" name="id" value={nft.id} />
                        <Button variant="destructive" size="sm">
                          Delete
                        </Button>
                      </form>
                    </CardHeader>
                    <CardContent>
                      <form action={updateNftAction} className="grid gap-3 md:grid-cols-2">
                        <input type="hidden" name="id" value={nft.id} />

                        <div className="space-y-1">
                          <label className="text-xs font-medium text-muted-foreground" htmlFor={`nft-name-${nft.id}`}>
                            Name
                          </label>
                          <input
                            id={`nft-name-${nft.id}`}
                            name="name"
                            defaultValue={nft.name}
                            required
                            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/60"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-medium text-muted-foreground" htmlFor={`nft-slug-${nft.id}`}>
                            Slug
                          </label>
                          <input
                            id={`nft-slug-${nft.id}`}
                            name="slug"
                            defaultValue={nft.slug}
                            required
                            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/60"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-medium text-muted-foreground" htmlFor={`nft-subtitle-${nft.id}`}>
                            Subtitle
                          </label>
                          <input
                            id={`nft-subtitle-${nft.id}`}
                            name="subtitle"
                            defaultValue={nft.subtitle ?? ""}
                            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/60"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-medium text-muted-foreground" htmlFor={`nft-rarity-${nft.id}`}>
                            Rarity
                          </label>
                          <input
                            id={`nft-rarity-${nft.id}`}
                            name="rarity"
                            defaultValue={nft.rarity ?? ""}
                            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/60"
                          />
                        </div>

                        <div className="space-y-1 md:col-span-2">
                          <label className="text-xs font-medium text-muted-foreground" htmlFor={`nft-description-${nft.id}`}>
                            Description
                          </label>
                          <textarea
                            id={`nft-description-${nft.id}`}
                            name="description"
                            defaultValue={nft.description ?? ""}
                            className="min-h-[80px] w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/60"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-medium text-muted-foreground" htmlFor={`nft-image-${nft.id}`}>
                            Image URL
                          </label>
                          <input
                            id={`nft-image-${nft.id}`}
                            name="image"
                            defaultValue={nft.image}
                            required
                            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/60"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-medium text-muted-foreground" htmlFor={`nft-gallery-${nft.id}`}>
                            Gallery URLs (one per line)
                          </label>
                          <textarea
                            id={`nft-gallery-${nft.id}`}
                            name="gallery"
                            defaultValue={formatGalleryValue(nft.gallery ?? [])}
                            className="min-h-[80px] w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/60"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-medium text-muted-foreground" htmlFor={`nft-rank-${nft.id}`}>
                            Rank
                          </label>
                          <input
                            id={`nft-rank-${nft.id}`}
                            name="rank"
                            type="number"
                            defaultValue={nft.rank ?? ""}
                            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/60"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-medium text-muted-foreground" htmlFor={`nft-score-${nft.id}`}>
                            Score
                          </label>
                          <input
                            id={`nft-score-${nft.id}`}
                            name="score"
                            type="number"
                            step="0.1"
                            defaultValue={nft.score ?? ""}
                            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/60"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-medium text-muted-foreground" htmlFor={`nft-supply-${nft.id}`}>
                            Supply Number
                          </label>
                          <input
                            id={`nft-supply-${nft.id}`}
                            name="supplyNumber"
                            type="number"
                            defaultValue={nft.supplyNumber ?? ""}
                            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/60"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-medium text-muted-foreground" htmlFor={`nft-display-${nft.id}`}>
                            Display Order
                          </label>
                          <input
                            id={`nft-display-${nft.id}`}
                            name="displayOrder"
                            type="number"
                            defaultValue={nft.displayOrder ?? 0}
                            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/60"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-medium text-muted-foreground" htmlFor={`nft-external-${nft.id}`}>
                            External URL
                          </label>
                          <input
                            id={`nft-external-${nft.id}`}
                            name="externalUrl"
                            defaultValue={nft.externalUrl ?? ""}
                            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/60"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-medium text-muted-foreground" htmlFor={`nft-collection-${nft.id}`}>
                            Collection
                          </label>
                          <select
                            id={`nft-collection-${nft.id}`}
                            name="collectionId"
                            required
                            defaultValue={nft.collection?.id ?? ""}
                            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/60"
                          >
                            <option value="" disabled>
                              Select collection
                            </option>
                            {collectionOptions.map((collection) => (
                              <option key={collection.id} value={collection.id}>
                                {collection.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="space-y-1 md:col-span-2">
                          <label className="text-xs font-medium text-muted-foreground" htmlFor={`nft-attributes-${nft.id}`}>
                            Attributes JSON
                          </label>
                          <textarea
                            id={`nft-attributes-${nft.id}`}
                            name="attributes"
                            defaultValue={formatAttributesValue(nft.attributes)}
                            className="min-h-[80px] w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/60 font-mono"
                          />
                        </div>

                        <div className="flex items-center gap-2">
                          <input
                            id={`nft-featured-${nft.id}`}
                            name="isFeatured"
                            type="checkbox"
                            defaultChecked={nft.isFeatured}
                            className="h-4 w-4 rounded border-border accent-primary"
                          />
                          <label htmlFor={`nft-featured-${nft.id}`} className="text-xs text-muted-foreground">
                            Featured
                          </label>
                        </div>

                        <Button type="submit" className="md:col-span-2 w-full md:w-fit">
                          Save NFT
                        </Button>
                      </form>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </section>
        </TabsContent>

        <TabsContent value="merchandise" className="space-y-4">
      <section className="space-y-3">
        <header>
          <h2 className="text-xl font-semibold">Merchandise</h2>
          <p className="text-xs text-muted-foreground">
                Edit storefront details and pricing. Uploading a new image replaces the current one.
          </p>
        </header>

        <div className="grid gap-4">
              {merchItems.map((item: MerchItem) => (
            <form
              key={item.id}
              action={updateMerchItemAction}
              className="grid gap-3 rounded-lg border border-border bg-card/70 p-3 shadow-sm transition hover:border-primary/60 md:grid-cols-2"
              encType="multipart/form-data"
            >
              <input type="hidden" name="id" value={item.id} />

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground" htmlFor={`merch-title-${item.id}`}>
                  Title
                </label>
                <input
                  id={`merch-title-${item.id}`}
                  name="title"
                  defaultValue={item.title}
                  required
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/60"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground" htmlFor={`merch-price-${item.id}`}>
                  Base USD Price
                </label>
                <input
                  id={`merch-price-${item.id}`}
                  name="baseUsdPrice"
                  type="number"
                  step="0.01"
                  min="0"
                  defaultValue={Number(item.baseUsdPrice)}
                  required
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/60"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium text-muted-foreground" htmlFor={`merch-description-${item.id}`}>
                  Description
                </label>
                <textarea
                  id={`merch-description-${item.id}`}
                  name="description"
                  defaultValue={item.description ?? ""}
                  className="min-h-[80px] w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/60"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground" htmlFor={`merch-regions-${item.id}`}>
                  Delivery Regions (comma separated)
                </label>
                <input
                  id={`merch-regions-${item.id}`}
                  name="deliveryRegions"
                  defaultValue={item.deliveryRegions.join(", ")}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/60"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground" htmlFor={`merch-external-${item.id}`}>
                  External URL (optional)
                </label>
                <input
                  id={`merch-external-${item.id}`}
                  name="externalUrl"
                  defaultValue={item.externalUrl ?? ""}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/60"
                  placeholder="https://"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium text-muted-foreground" htmlFor={`merch-image-${item.id}`}>
                  Upload Image (optional)
                </label>
                <input
                  id={`merch-image-${item.id}`}
                  name="image"
                  type="file"
                  accept="image/*"
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                />
                    {item.imageUrl ? (
                      <p className="break-all text-xs text-muted-foreground">
                    Current image: <span className="font-medium">{item.imageUrl}</span>
                  </p>
                    ) : null}
              </div>

              <Button type="submit" className="md:col-span-2 w-full md:w-fit">Save Merchandise</Button>
            </form>
          ))}
        </div>
      </section>
        </TabsContent>

        <TabsContent value="orders" className="space-y-4">
      <section className="space-y-3">
        <header>
              <h2 className="text-xl font-semibold">Orders</h2>
          <p className="text-xs text-muted-foreground">
                Review payment progress, customer details, and shipping addresses for every Pi-powered order.
          </p>
        </header>

        <Card className="border-border/60 bg-card/70">
          <CardContent className="space-y-3 pt-5">
                {orders.length === 0 ? (
              <p className="text-xs text-muted-foreground">No orders have been placed yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-[960px] w-full text-xs sm:text-sm">
                  <thead className="text-[11px] uppercase tracking-wide text-muted-foreground">
                    <tr>
                      <th className="px-3 py-2 text-left font-medium">Order</th>
                      <th className="px-3 py-2 text-left font-medium">Payment</th>
                      <th className="px-3 py-2 text-left font-medium">Customer</th>
                      <th className="px-3 py-2 text-left font-medium">Shipping</th>
                      <th className="px-3 py-2 text-left font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {orders.map((order) => {
                          const totalUsd = toNumber(order.totalUsd)
                          const totalPi = toNumber(order.totalPi)
                          const unitUsd = toNumber(order.unitUsdPrice)
                          const unitPi = toNumber(order.unitPiPrice)
                          const createdAgo = formatDistanceToNow(order.createdAt, { addSuffix: true })
                          const updatedAgo = formatDistanceToNow(order.updatedAt, { addSuffix: true })
                          const shipping = order.shippingAddress
                          const shippingLines = shipping
                            ? [
                                shipping.address1,
                                shipping.address2 ?? "",
                                [shipping.city, shipping.state].filter(Boolean).join(", "),
                                [shipping.postalCode, shipping.country].filter(Boolean).join(" "),
                              ].filter((line) => line && line.trim().length > 0)
                            : []
                          const piUserLabel = order.piUser
                            ? order.piUser.username ?? order.piUser.piUid
                            : null

                      return (
                        <tr key={order.id} className="align-top">
                          <td className="px-3 py-3">
                            <div className="font-medium text-foreground">{order.merchItem?.title ?? "Merchandise"}</div>
                            <div className="text-xs text-muted-foreground">
                              Qty {order.quantity} • {formatCurrency(unitUsd)} / {formatPiAmount(unitPi)}
                            </div>
                            <div className="mt-2 space-y-1 text-[11px] font-mono text-muted-foreground/80">
                              <div>Order ID: {order.id}</div>
                              <div>Created {createdAgo}</div>
                            </div>
                          </td>
                          <td className="px-3 py-3">
                            <div className="font-medium text-foreground">{formatCurrency(totalUsd)}</div>
                            <div className="text-xs text-muted-foreground">{formatPiAmount(totalPi)}</div>
                            <div className="mt-2 text-[11px] font-mono text-muted-foreground/80 break-all">
                              {order.piPaymentId ? `Payment ID: ${order.piPaymentId}` : "No payment ID yet"}
                            </div>
                          </td>
                          <td className="px-3 py-3">
                            <div className="font-medium text-foreground">{order.customerName}</div>
                            <div className="text-xs text-muted-foreground break-all">{order.customerEmail}</div>
                            {order.customerPhone ? (
                              <div className="text-xs text-muted-foreground">{order.customerPhone}</div>
                            ) : null}
                            {piUserLabel ? (
                              <div className="mt-2 text-[11px] text-muted-foreground/80">
                                Pi User: <span className="font-mono">{piUserLabel}</span>
                              </div>
                            ) : null}
                          </td>
                          <td className="px-3 py-3">
                            {shippingLines.length > 0 ? (
                              <div className="space-y-1 text-xs text-muted-foreground">
                                {shippingLines.map((line, index) => (
                                  <div key={index} className={index === 0 ? "text-foreground text-sm" : ""}>
                                    {line}
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <span className="text-xs text-muted-foreground">No shipping details</span>
                            )}
                          </td>
                          <td className="px-3 py-3">
                            <Badge variant={orderStatusVariants[order.status]} className="uppercase tracking-wide">
                              {orderStatusLabels[order.status]}
                            </Badge>
                            <div className="mt-2 text-xs text-muted-foreground">
                              Updated {updatedAgo}
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </section>
        </TabsContent>

        <TabsContent value="promotions" className="space-y-4">
      <section className="space-y-3">
        <header>
          <h2 className="text-xl font-semibold">Promo Blocks</h2>
          <p className="text-xs text-muted-foreground">
            Update the marketing content used across the homepage and detail pages.
          </p>
        </header>

        <div className="grid gap-3 md:grid-cols-2">
              {promoPlacements.map((placement: PromoPlacement) => {
                const promo = promoMap.get(placement)
            const baseId = placement.toLowerCase()

            return (
              <form
                key={placement}
                action={updatePromoBlockAction}
                className="grid gap-2 rounded-lg border border-border bg-card/70 p-3 shadow-sm transition hover:border-primary/60"
                encType="multipart/form-data"
              >
                <input type="hidden" name="placement" value={placement} />
                <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  {placement.replace(/_/g, " ")}
                </h3>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground" htmlFor={`${baseId}-heading`}>
                    Heading
                  </label>
                  <input
                    id={`${baseId}-heading`}
                    name="heading"
                    defaultValue={promo?.heading ?? ""}
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/60"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground" htmlFor={`${baseId}-subheading`}>
                    Subheading
                  </label>
                  <input
                    id={`${baseId}-subheading`}
                    name="subheading"
                    defaultValue={promo?.subheading ?? ""}
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/60"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground" htmlFor={`${baseId}-body`}>
                    Body
                  </label>
                  <textarea
                    id={`${baseId}-body`}
                    name="body"
                    defaultValue={promo?.body ?? ""}
                    className="min-h-[70px] w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/60"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground" htmlFor={`${baseId}-cta-label`}>
                    CTA Label
                  </label>
                  <input
                    id={`${baseId}-cta-label`}
                    name="ctaLabel"
                    defaultValue={promo?.ctaLabel ?? ""}
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/60"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground" htmlFor={`${baseId}-cta-url`}>
                    CTA URL
                  </label>
                  <input
                    id={`${baseId}-cta-url`}
                    name="ctaUrl"
                    defaultValue={promo?.ctaUrl ?? ""}
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/60"
                    placeholder="https://"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground" htmlFor={`${baseId}-media-url`}>
                    Media URL (optional)
                  </label>
                  <input
                    id={`${baseId}-media-url`}
                    name="mediaUrl"
                    defaultValue={promo?.mediaUrl ?? ""}
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/60"
                  />
                  <input
                    id={`${baseId}-media-file`}
                    name="mediaFile"
                    type="file"
                    accept="image/*,video/*"
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                  />
                      {promo?.mediaUrl ? (
                        <p className="break-all text-xs text-muted-foreground">
                      Current media: <span className="font-medium">{promo.mediaUrl}</span>
                    </p>
                      ) : null}
                </div>

                <Button type="submit" className="mt-3 w-full md:w-fit">Save Promo</Button>
              </form>
            )
          })}
        </div>
      </section>
        </TabsContent>

        <TabsContent value="community" className="space-y-4">
      <section className="space-y-3">
        <header>
          <h2 className="text-xl font-semibold">Community Links</h2>
              <p className="text-xs text-muted-foreground">
                Curate external destinations highlighted on the homepage.
              </p>
        </header>

        <div className="grid gap-3">
              {communityLinks.map((link: CommunityLink) => (
            <div key={link.id} className="rounded-lg border border-border bg-card/70 p-3 shadow-sm">
              <form action={updateCommunityLinkAction} className="grid gap-2 md:grid-cols-2">
                <input type="hidden" name="id" value={link.id} />

                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground" htmlFor={`community-name-${link.id}`}>
                    Name
                  </label>
                  <input
                    id={`community-name-${link.id}`}
                    name="name"
                    defaultValue={link.name}
                    required
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/60"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground" htmlFor={`community-icon-${link.id}`}>
                    Icon (emoji)
                  </label>
                  <input
                    id={`community-icon-${link.id}`}
                    name="icon"
                    defaultValue={link.icon ?? ""}
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/60"
                  />
                </div>

                <div className="space-y-1 md:col-span-2">
                      <label
                        className="text-xs font-medium text-muted-foreground"
                        htmlFor={`community-description-${link.id}`}
                      >
                    Description
                  </label>
                  <textarea
                    id={`community-description-${link.id}`}
                    name="description"
                    defaultValue={link.description ?? ""}
                    className="min-h-[60px] w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/60"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground" htmlFor={`community-url-${link.id}`}>
                    URL
                  </label>
                  <input
                    id={`community-url-${link.id}`}
                    name="url"
                    defaultValue={link.url}
                    required
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/60"
                    placeholder="https://"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground" htmlFor={`community-order-${link.id}`}>
                    Display Order
                  </label>
                  <input
                    id={`community-order-${link.id}`}
                    name="displayOrder"
                    type="number"
                    defaultValue={link.displayOrder ?? 0}
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/60"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    id={`community-active-${link.id}`}
                    name="isActive"
                    type="checkbox"
                    defaultChecked={link.isActive}
                    className="h-4 w-4 rounded border-border accent-primary"
                  />
                  <label htmlFor={`community-active-${link.id}`} className="text-xs text-muted-foreground">
                    Active
                  </label>
                </div>

                    <Button type="submit" className="w-full md:w-fit">Save Link</Button>
              </form>
            </div>
          ))}

          <div className="rounded-lg border border-dashed border-border bg-card/30 p-4">
            <h3 className="text-sm font-semibold text-muted-foreground">Add Community Link</h3>
            <form action={createCommunityLinkAction} className="mt-3 grid gap-3 md:grid-cols-2">
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground" htmlFor="community-new-name">
                  Name
                </label>
                <input
                  id="community-new-name"
                  name="name"
                  required
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/60"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground" htmlFor="community-new-icon">
                  Icon
                </label>
                <input
                  id="community-new-icon"
                  name="icon"
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/60"
                  placeholder="✨"
                />
              </div>
              <div className="space-y-1 md:col-span-2">
                <label className="text-xs font-medium text-muted-foreground" htmlFor="community-new-description">
                  Description
                </label>
                <textarea
                  id="community-new-description"
                  name="description"
                  className="min-h-[60px] w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/60"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground" htmlFor="community-new-url">
                  URL
                </label>
                <input
                  id="community-new-url"
                  name="url"
                  required
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/60"
                  placeholder="https://"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground" htmlFor="community-new-order">
                  Display Order
                </label>
                <input
                  id="community-new-order"
                  name="displayOrder"
                  type="number"
                  defaultValue={communityLinks.length + 1}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/60"
                />
              </div>
              <div className="md:col-span-2">
                    <Button type="submit" className="w-full md:w-auto">
                  Add Link
                    </Button>
              </div>
            </form>
          </div>
        </div>
      </section>
        </TabsContent>

        <TabsContent value="footer" className="space-y-4">
      <section className="space-y-3">
        <header>
          <h2 className="text-xl font-semibold">Footer Links</h2>
          <p className="text-xs text-muted-foreground">
                Manage legal links and supporting references displayed site-wide.
          </p>
        </header>

        <div className="grid gap-3">
              {footerLinks.map((link: FooterLink) => (
            <form
              key={link.id}
              action={updateFooterLinkAction}
              className="grid gap-2 rounded-lg border border-border bg-card/70 p-3 shadow-sm transition hover:border-primary/60 md:grid-cols-2"
            >
              <input type="hidden" name="id" value={link.id} />

              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground" htmlFor={`footer-label-${link.id}`}>
                  Label
                </label>
                <input
                  id={`footer-label-${link.id}`}
                  name="label"
                  defaultValue={link.label}
                  required
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/60"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground" htmlFor={`footer-href-${link.id}`}>
                  Href
                </label>
                <input
                  id={`footer-href-${link.id}`}
                  name="href"
                  defaultValue={link.href}
                  required
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/60"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground" htmlFor={`footer-order-${link.id}`}>
                  Display Order
                </label>
                <input
                  id={`footer-order-${link.id}`}
                  name="displayOrder"
                  type="number"
                  defaultValue={link.displayOrder ?? 0}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/60"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  id={`footer-active-${link.id}`}
                  name="isActive"
                  type="checkbox"
                  defaultChecked={link.isActive}
                  className="h-4 w-4 rounded border-border accent-primary"
                />
                <label htmlFor={`footer-active-${link.id}`} className="text-xs text-muted-foreground">
                  Visible
                </label>
              </div>

            <Button type="submit" className="w-full md:w-fit">Save Link</Button>
            </form>
          ))}
        </div>
      </section>
        </TabsContent>

        <TabsContent value="access" className="space-y-4">
          <section className="space-y-3">
            <header>
              <h2 className="text-xl font-semibold">Admin Access</h2>
            <p className="text-xs text-muted-foreground">
                Basic auth credentials gate the portal, but only emails saved here can sign in using them.
              </p>
        </header>

            <Card>
              <CardHeader>
                <CardTitle>Authorized Admin Emails</CardTitle>
                <CardDescription>
                  Remove access for collaborators who no longer need the dashboard.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {adminUsers.length > 0 ? (
            <div className="space-y-2">
                    {adminUsers.map((user) => (
                      <form
                        key={user.id}
                        action={removeAdminUserAction}
                        className="flex flex-col gap-3 rounded-md border border-border/60 bg-background/80 p-3 md:flex-row md:items-center md:justify-between"
                      >
                        <input type="hidden" name="email" value={user.email} />
                        <div>
                          <p className="font-medium text-sm">{user.email}</p>
                          <p className="text-xs text-muted-foreground">
                            Added {formatDistanceToNow(user.createdAt, { addSuffix: true })}
                          </p>
                        </div>
                        <Button type="submit" variant="destructive" className="w-full md:w-auto">
                          Remove
                        </Button>
                      </form>
                    ))}
            </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No admin emails have been added yet.</p>
          )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Add Admin Email</CardTitle>
                <CardDescription>
                  Use the shared credentials (<code>nftpippa@gmail.com</code> / <code>nftpi123</code>) and ensure the email is listed here.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form
                  action={addAdminUserAction}
                  className="flex flex-col gap-3 md:flex-row md:items-center md:gap-4"
                >
                  <input
                    name="email"
                    type="email"
                    required
                    placeholder="admin@example.com"
                    className="h-10 flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/60"
                  />
                  <Button type="submit" className="w-full md:w-auto">
                    Add Admin
                  </Button>
                </form>
              </CardContent>
            </Card>
      </section>
        </TabsContent>
      </Tabs>
    </div>
  )
}

