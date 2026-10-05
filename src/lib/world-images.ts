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
export type WorldImage = {
  url: string
  path: string | null
  width?: number
  height?: number
  // How far the viewer may zoom in, when the image is not meant to be blown up
  // as far as the default (a map rendered by the builder, which has no more
  // detail to show). Absent for an uploaded image.
  maxZoom?: number
}

export function toWorldImage(value: unknown): WorldImage | null {
  const image = value as Partial<WorldImage> | null
  if (!image?.url) return null
  const size = (n: unknown) => (typeof n === "number" && n > 0 ? n : undefined)
  return {
    url: image.url,
    path: image.path ?? null,
    width: size(image.width),
    height: size(image.height),
    maxZoom: typeof image.maxZoom === "number" ? image.maxZoom : undefined,
  }
}

// A map's file is never changed once uploaded (every upload has a new name), so
// browsers may keep it for a year.
const MAP_CACHE_SECONDS = 365 * 24 * 60 * 60

// The folder carries the entry id, so a hidden entry's image URL cannot be
// guessed by someone who has never been shown the entry.
export const uploadWorldImage = (
  campaignId: string,
  entryId: string,
  file: File,
  kind?: WorldEntryKind
) =>
  uploadImage(
    bucketFor(kind),
    `${campaignId}/${entryId}`,
    file,
    kind === "map" ? MAP_CACHE_SECONDS : undefined
  )

export const deleteWorldImage = (path?: string | null, kind?: WorldEntryKind) =>
  deleteImage(bucketFor(kind), path)
