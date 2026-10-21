import { supabase } from "./supabase"
import { copyWorldImage, deleteWorldImage, toWorldImage } from "./world-images"
import { COVER_FIELD } from "./world-kinds"
import type { WorldEntryKind } from "./world-kinds"

async function entryKind(entryId: string) {
  const { data, error } = await supabase
    .from("world_entries")
    .select("kind")
    .eq("id", entryId)
    .single()
  if (error) throw error

  return data.kind as WorldEntryKind
}

async function coverPath(entryId: string) {
  const { data, error } = await supabase
    .from("world_entry_fields")
    .select("value")
    .eq("entry_id", entryId)
    .eq("key", COVER_FIELD)
    .maybeSingle()
  if (error) throw error

  return toWorldImage(data?.value)?.path ?? null
}

async function hasPins(mapId: string) {
  const { count, error } = await supabase
    .from("world_map_markers")
    .select("id", { count: "exact", head: true })
    .eq("map_id", mapId)
  if (error) throw error

  return (count ?? 0) > 0
}

// Copies the image file first, then the entry. If the entry cannot be made the
// file is removed again; the other way round, a failure would leave an entry
// whose image is missing. A template's shared portrait has no file and is
// shared as it is. A map's pins are never copied; this says whether it had any.
async function copyEntry(entryId: string, folder: string, targetCampaign: string | null) {
  const newId = crypto.randomUUID()
  const kind = await entryKind(entryId)
  const sourcePath = await coverPath(entryId)
  const newPath = sourcePath ? `${folder}/${newId}/${sourcePath.split("/").pop()}` : null
  const pinsDropped = kind === "map" && (await hasPins(entryId))

  if (sourcePath && newPath) await copyWorldImage(sourcePath, newPath, kind)

  const { error } = await supabase.rpc("copy_world_entry", {
    source_entry: entryId,
    new_entry_id: newId,
    target_campaign: targetCampaign,
    new_image_path: newPath,
  })
  if (error) {
    await deleteWorldImage(newPath, kind).catch(() => {})
    throw error
  }

  return { pinsDropped }
}

// A separate copy in the person's library. It remembers where it came from.
export const saveToLibrary = (entryId: string, userId: string) =>
  copyEntry(entryId, userId, null)

// A separate copy in the campaign, hidden from players. It remembers where it came from.
export const addFromLibrary = (entryId: string, campaignId: string) =>
  copyEntry(entryId, campaignId, campaignId)

export const PINS_NOT_SAVED = "Pins aren't saved to your library."
