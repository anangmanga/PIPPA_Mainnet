"use server"

import { Prisma, type PromoPlacement } from "@prisma/client"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { syncPiPrice } from "@/lib/services/pi-pricing"
import { saveUpload } from "@/lib/services/uploads"
import { requireAdmin } from "@/lib/admin-auth"

const REVALIDATE_PATHS = ["/", "/explore", "/merchandise", "/admin", "/nft"]

async function revalidateAll() {
  for (const path of REVALIDATE_PATHS) {
    revalidatePath(path)
  }
}

async function assertAdminAccess() {
  try {
    await requireAdmin()
  } catch (error) {
    console.error("Admin action blocked", error)
    throw new Error("Unauthorized admin access.")
  }
}

export async function authenticateAdmin(formData: FormData) {
  const password = formData.get("password")?.toString() ?? ""
  const redirectTo = formData.get("redirect")?.toString() || "/admin"

  const expectedPassword =
    process.env.ADMIN_PORTAL_PASSWORD ??
    process.env.ADMIN_BASIC_PASSWORD ??
    "nftpi123"

  if (password !== expectedPassword) {
    redirect(`/admin/login?error=1&redirect=${encodeURIComponent(redirectTo)}`)
  }

  redirect(redirectTo)
}

export async function updateCollectionAction(formData: FormData) {
  await assertAdminAccess()

  const id = formData.get("id") as string
  const name = formData.get("name")?.toString().trim()
  const summary = formData.get("summary")?.toString().trim() || null
  const heroCopy = formData.get("heroCopy")?.toString().trim() || null
  const heroImage = formData.get("heroImage")?.toString().trim() || null
  const mintingUrl = formData.get("mintingUrl")?.toString().trim() || null
  const displayOrder = Number(formData.get("displayOrder") ?? 0)
  const verified = formData.get("verified") === "on"

  if (!id || !name) {
    throw new Error("Collection id and name are required.")
  }

  await prisma.collection.update({
    where: { id },
    data: {
      name,
      summary,
      heroCopy,
      heroImage,
      mintingUrl,
      displayOrder: Number.isFinite(displayOrder) ? displayOrder : 0,
      verified,
    },
  })

  await revalidateAll()
}

export async function updateMerchItemAction(formData: FormData) {
  await assertAdminAccess()

  const id = formData.get("id") as string
  const title = formData.get("title")?.toString().trim()
  const description = formData.get("description")?.toString().trim() || null
  const baseUsdPrice = Number(formData.get("baseUsdPrice"))
  const deliveryRegions =
    formData
      .get("deliveryRegions")
      ?.toString()
      .split(",")
      .map((region) => region.trim())
      .filter(Boolean) ?? ["USA", "Canada", "Europe"]
  const externalUrl = formData.get("externalUrl")?.toString().trim() || null
  const imageFile = formData.get("image") as File | null

  if (!id || !title || Number.isNaN(baseUsdPrice)) {
    throw new Error("Merchandise id, title, and price are required.")
  }

  const data: Prisma.MerchItemUpdateInput = {
    title,
    description,
    baseUsdPrice: new Prisma.Decimal(baseUsdPrice),
    deliveryRegions,
    externalUrl,
  }

  if (imageFile && imageFile.size > 0) {
    data.imageUrl = await saveUpload(imageFile)
  }

  await prisma.merchItem.update({
    where: { id },
    data,
  })

  await revalidateAll()
}

export async function updatePromoBlockAction(formData: FormData) {
  await assertAdminAccess()

  const placementValue = formData.get("placement")?.toString()
  const headingInput = formData.get("heading")?.toString().trim()
  const subheading = formData.get("subheading")?.toString().trim() || null
  const body = formData.get("body")?.toString().trim() || null
  const ctaLabel = formData.get("ctaLabel")?.toString().trim() || null
  const ctaUrl = formData.get("ctaUrl")?.toString().trim() || null
  const mediaUrlField = formData.get("mediaUrl")?.toString().trim()
  const mediaFile = formData.get("mediaFile") as File | null

  if (!placementValue) {
    throw new Error("Promo placement is required.")
  }

  const placement = placementValue as PromoPlacement
  const heading = headingInput ?? ""

  let mediaUrl = mediaUrlField || null
  if (mediaFile && mediaFile.size > 0) {
    mediaUrl = await saveUpload(mediaFile)
  }

  await prisma.promoBlock.upsert({
    where: { placement },
    update: {
      heading,
      subheading: subheading ?? undefined,
      body: body ?? undefined,
      ctaLabel: ctaLabel ?? undefined,
      ctaUrl: ctaUrl ?? undefined,
      mediaUrl: mediaUrl ?? undefined,
    },
    create: {
      placement,
      heading,
      subheading,
      body,
      ctaLabel,
      ctaUrl,
      mediaUrl,
    },
  })

  await revalidateAll()
}

export async function createCommunityLinkAction(formData: FormData) {
  await assertAdminAccess()

  const name = formData.get("name")?.toString().trim()
  const description = formData.get("description")?.toString().trim() || null
  const icon = formData.get("icon")?.toString().trim() || null
  const url = formData.get("url")?.toString().trim()
  const displayOrder = Number(formData.get("displayOrder") ?? 0)

  if (!name || !url) {
    throw new Error("Community link name and URL are required.")
  }

  await prisma.communityLink.create({
    data: {
      name,
      description,
      icon,
      url,
      displayOrder: Number.isFinite(displayOrder) ? displayOrder : 0,
    },
  })

  await revalidateAll()
}

export async function updateCommunityLinkAction(formData: FormData) {
  await assertAdminAccess()

  const id = formData.get("id")?.toString()
  const name = formData.get("name")?.toString().trim()
  const description = formData.get("description")?.toString().trim() || null
  const icon = formData.get("icon")?.toString().trim() || null
  const url = formData.get("url")?.toString().trim()
  const displayOrder = Number(formData.get("displayOrder") ?? 0)
  const isActive = formData.get("isActive") === "on"

  if (!id || !name || !url) {
    throw new Error("Community link id, name, and URL are required.")
  }

  await prisma.communityLink.update({
    where: { id },
    data: {
      name,
      description,
      icon,
      url,
      displayOrder: Number.isFinite(displayOrder) ? displayOrder : 0,
      isActive,
    },
  })

  await revalidateAll()
}

export async function deleteCommunityLinkAction(formData: FormData) {
  await assertAdminAccess()

  const id = formData.get("id")?.toString()
  if (!id) {
    throw new Error("Community link id is required.")
  }

  await prisma.communityLink.delete({
    where: { id },
  })

  await revalidateAll()
}

export async function updateFooterLinkAction(formData: FormData) {
  await assertAdminAccess()

  const id = formData.get("id")?.toString()
  const label = formData.get("label")?.toString().trim()
  const href = formData.get("href")?.toString().trim()
  const displayOrder = Number(formData.get("displayOrder") ?? 0)
  const isActive = formData.get("isActive") === "on"

  if (!id || !label || !href) {
    throw new Error("Footer link id, label, and href are required.")
  }

  await prisma.footerLink.update({
    where: { id },
    data: {
      label,
      href,
      displayOrder: Number.isFinite(displayOrder) ? displayOrder : 0,
      isActive,
    },
  })

  await revalidateAll()
}

export async function syncPiPriceAction() {
  await assertAdminAccess()
  await syncPiPrice()
  await revalidateAll()
}

export async function addAdminUserAction(formData: FormData) {
  await assertAdminAccess()

  const emailInput = formData.get("email")?.toString().trim().toLowerCase()

  if (!emailInput) {
    throw new Error("Admin email is required.")
  }

  await (prisma as any).adminUser.upsert({
    where: { email: emailInput },
    update: {},
    create: { email: emailInput },
  })

  await revalidateAll()
}

export async function removeAdminUserAction(formData: FormData) {
  await assertAdminAccess()

  const emailInput = formData.get("email")?.toString().trim().toLowerCase()

  if (!emailInput) {
    throw new Error("Admin email is required.")
  }

  await (prisma as any).adminUser.deleteMany({
    where: { email: emailInput },
  })

  await revalidateAll()
}

function parseGallery(input: string | null | undefined) {
  if (!input) return []
  return input
    .split(/\r?\n|,/)
    .map((item) => item.trim())
    .filter((item) => item.length > 0)
}

function parseJsonAttributes(input: string | null | undefined) {
  if (!input) return null
  try {
    return JSON.parse(input) as Prisma.JsonValue
  } catch (error) {
    console.error("Failed to parse NFT attributes JSON", error)
    throw new Error("Invalid JSON provided for attributes. Ensure the value is valid JSON.")
  }
}

function toOptionalNumber(value: string | null | undefined) {
  if (!value?.trim()) return null
  const numeric = Number(value)
  return Number.isFinite(numeric) ? numeric : null
}

export async function createNftAction(formData: FormData) {
  await assertAdminAccess()

  const collectionId = formData.get("collectionId")?.toString()
  const name = formData.get("name")?.toString().trim()
  const slug = formData.get("slug")?.toString().trim().toLowerCase()
  const subtitle = formData.get("subtitle")?.toString().trim() || null
  const image = formData.get("image")?.toString().trim()
  const description = formData.get("description")?.toString().trim() || null
  const rarity = formData.get("rarity")?.toString().trim() || null
  const displayOrder = Number(formData.get("displayOrder") ?? 0)
  const rank = toOptionalNumber(formData.get("rank")?.toString())
  const score = toOptionalNumber(formData.get("score")?.toString())
  const galleryInput = formData.get("gallery")?.toString()
  const attributesInput = formData.get("attributes")?.toString()
  const isFeatured = formData.get("isFeatured") === "on"

  if (!collectionId || !name || !slug || !image) {
    throw new Error("Collection, name, slug, and image URL are required for creating an NFT.")
  }

  const gallery = parseGallery(galleryInput)
  const attributes = parseJsonAttributes(attributesInput)

  await prisma.nft.create({
    data: {
      collectionId,
      name,
      slug,
      subtitle,
      image,
      description,
      rarity,
      displayOrder: Number.isFinite(displayOrder) ? displayOrder : 0,
      rank,
      score,
      gallery,
      attributes,
      isFeatured,
    },
  })

  await revalidateAll()
}

export async function updateNftAction(formData: FormData) {
  await assertAdminAccess()

  const id = formData.get("id")?.toString()
  const collectionId = formData.get("collectionId")?.toString()
  const name = formData.get("name")?.toString().trim()
  const slug = formData.get("slug")?.toString().trim().toLowerCase()
  const subtitle = formData.get("subtitle")?.toString().trim() || null
  const image = formData.get("image")?.toString().trim()
  const description = formData.get("description")?.toString().trim() || null
  const rarity = formData.get("rarity")?.toString().trim() || null
  const displayOrder = Number(formData.get("displayOrder") ?? 0)
  const rank = toOptionalNumber(formData.get("rank")?.toString())
  const score = toOptionalNumber(formData.get("score")?.toString())
  const galleryInput = formData.get("gallery")?.toString()
  const attributesInput = formData.get("attributes")?.toString()
  const isFeatured = formData.get("isFeatured") === "on"

  if (!id || !collectionId || !name || !slug || !image) {
    throw new Error("NFT id, collection, name, slug, and image URL are required.")
  }

  const gallery = parseGallery(galleryInput)
  const attributes = parseJsonAttributes(attributesInput)

  await prisma.nft.update({
    where: { id },
    data: {
      collectionId,
      name,
      slug,
      subtitle,
      image,
      description,
      rarity,
      displayOrder: Number.isFinite(displayOrder) ? displayOrder : 0,
      rank,
      score,
      gallery,
      attributes,
      isFeatured,
    },
  })

  await revalidateAll()
}

export async function deleteNftAction(formData: FormData) {
  await assertAdminAccess()

  const id = formData.get("id")?.toString()
  if (!id) {
    throw new Error("NFT id is required.")
  }

  await prisma.nft.delete({
    where: { id },
  })

  await revalidateAll()
}

