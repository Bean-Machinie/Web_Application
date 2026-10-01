import { deleteImage, uploadImage } from "@/lib/avatar"

const BUCKET = "world-images"

// What an image field holds. The path is what the bucket needs to delete it.
export type WorldImage = { url: string; path: string }

export function toWorldImage(value: unknown): WorldImage | null {
  const image = value as Partial<WorldImage> | null
  return image?.url && image.path ? { url: image.url, path: image.path } : null
}

// The folder carries the entry id, so a hidden entry's image URL cannot be
// guessed by someone who has never been shown the entry.
export const uploadWorldImage = (campaignId: string, entryId: string, file: File) =>
  uploadImage(BUCKET, `${campaignId}/${entryId}`, file)

export const deleteWorldImage = (path?: string | null) => deleteImage(BUCKET, path)
