import { deleteImage, uploadImage } from "@/lib/avatar"
import type { WorldEntryKind } from "./world-kinds"

const PORTRAIT_BUCKET = "world-images"
// Maps are larger than portraits, so they have a bucket of their own.
const MAP_BUCKET = "world-maps"

const bucketFor = (kind?: WorldEntryKind) => (kind === "map" ? MAP_BUCKET : PORTRAIT_BUCKET)

// What an image field holds. The path is what the bucket needs to delete it;
// a template's shared portrait has none, so it is never deleted. Maps also
// keep their size in pixels, so the viewer can lay itself out before the
// image has loaded.
export type WorldImage = { url: string; path: string | null; width?: number; height?: number }

export function toWorldImage(value: unknown): WorldImage | null {
  const image = value as Partial<WorldImage> | null
  if (!image?.url) return null
  const size = (n: unknown) => (typeof n === "number" && n > 0 ? n : undefined)
  return {
    url: image.url,
    path: image.path ?? null,
    width: size(image.width),
    height: size(image.height),
  }
}

// The folder carries the entry id, so a hidden entry's image URL cannot be
// guessed by someone who has never been shown the entry.
export const uploadWorldImage = (
  campaignId: string,
  entryId: string,
  file: File,
  kind?: WorldEntryKind
) => uploadImage(bucketFor(kind), `${campaignId}/${entryId}`, file)

export const deleteWorldImage = (path?: string | null, kind?: WorldEntryKind) =>
  deleteImage(bucketFor(kind), path)
