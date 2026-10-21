import { deleteImage, uploadImage } from "@/lib/avatar"
import { supabase } from "@/lib/supabase"
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
  folder: string,
  entryId: string,
  file: File,
  kind?: WorldEntryKind
) =>
  uploadImage(
    bucketFor(kind),
    `${folder}/${entryId}`,
    file,
    kind === "map" ? MAP_CACHE_SECONDS : undefined
  )

export const deleteWorldImage = (path?: string | null, kind?: WorldEntryKind) =>
  deleteImage(bucketFor(kind), path)

// Copies an image to a new path in the same bucket, inside storage.
export async function copyWorldImage(fromPath: string, toPath: string, kind?: WorldEntryKind) {
  const { error } = await supabase.storage.from(bucketFor(kind)).copy(fromPath, toPath)
  if (error) throw error
}

// Removes the files of several entries, one request per bucket.
export async function deleteWorldImages(images: { path: string | null; kind: WorldEntryKind }[]) {
  const byBucket = new Map<string, string[]>()
  for (const { path, kind } of images) {
    if (path) byBucket.set(bucketFor(kind), [...(byBucket.get(bucketFor(kind)) ?? []), path])
  }
  await Promise.all(
    [...byBucket].map(([bucket, paths]) => supabase.storage.from(bucket).remove(paths))
  )
}

