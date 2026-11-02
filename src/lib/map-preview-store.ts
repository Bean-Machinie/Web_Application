import { supabase } from "@/lib/supabase"
import type { Preview } from "./map-preview"

// A drawn preview of an unpublished map, kept next to the map's published images so the next
// visit, from any device, loads a picture instead of drawing the scene again. One file per
// saved version of the scene, named by when it was saved.
const BUCKET = "world-maps"
const PREFIX = "draft-"
const CACHE_SECONDS = 365 * 24 * 60 * 60

const folderOf = (folder: string, mapId: string) => `${folder}/${mapId}`
const nameOf = (updatedAt: string) => `${PREFIX}${updatedAt.replace(/\D/g, "")}.webp`

// Null when none has been kept for this version.
export function loadStoredPreview(folder: string, mapId: string, updatedAt: string) {
  const path = `${folderOf(folder, mapId)}/${nameOf(updatedAt)}`
  const { publicUrl } = supabase.storage.from(BUCKET).getPublicUrl(path).data
  return new Promise<Preview | null>((resolve) => {
    const image = new Image()
    image.onload = () => resolve({ url: publicUrl, width: image.naturalWidth, height: image.naturalHeight })
    image.onerror = () => resolve(null)
    image.src = publicUrl
  })
}

// Keeps a freshly drawn picture and clears the ones of older versions. Best effort: a failure
// only means the next visit draws it again.
export async function storePreview(folder: string, mapId: string, updatedAt: string, pictureUrl: string) {
  try {
    const dir = folderOf(folder, mapId)
    const name = nameOf(updatedAt)
    const files = supabase.storage.from(BUCKET)
    const blob = await (await fetch(pictureUrl)).blob()
    const { error } = await files.upload(`${dir}/${name}`, blob, {
      contentType: "image/webp",
      cacheControl: String(CACHE_SECONDS),
    })
    if (error) return
    const { data } = await files.list(dir, { search: PREFIX })
    const stale = (data ?? []).filter((file) => file.name.startsWith(PREFIX) && file.name !== name)
    if (stale.length > 0) await files.remove(stale.map((file) => `${dir}/${file.name}`))
  } catch {
    // Not kept.
  }
}
