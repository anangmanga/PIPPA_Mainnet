import { randomUUID } from "crypto"
import { promises as fs } from "fs"
import path from "path"
import { put } from "@vercel/blob"

const isProduction = process.env.NODE_ENV === "production"

export async function saveUpload(file: File) {
  if (file.size === 0) {
    throw new Error("Empty file cannot be uploaded")
  }

  const extension = file.name.split(".").pop()
  const filename = `${randomUUID()}${extension ? `.${extension}` : ""}`

  if (!isProduction) {
    const uploadDir = path.join(process.cwd(), "public", "uploads")
    await fs.mkdir(uploadDir, { recursive: true })

    const buffer = Buffer.from(await file.arrayBuffer())
    const targetPath = path.join(uploadDir, filename)
    await fs.writeFile(targetPath, buffer)

    return `/uploads/${filename}`
  }

  const blob = await put(`uploads/${filename}`, file, {
    access: "public",
  })

  return blob.url
}

export async function deleteUpload(url: string) {
  if (!url) return

  if (!isProduction && url.startsWith("/uploads/")) {
    const relativePath = url.replace(/^\//, "")
    const filePath = path.join(process.cwd(), "public", relativePath)
    await fs.rm(filePath, { force: true })
  }

  // Note: Vercel Blob currently lacks a direct delete API without using the management SDK.
  // Implement cleanup via dashboard or scheduled job if needed.
}

