import { supabase } from "./supabase"
import { copyWorldImage, deleteWorldImage, toWorldImage } from "./world-images"
import { COVER_FIELD } from "./world-kinds"
import type { WorldEntryKind } from "./world-kinds"

// Maps carry markers, nested maps and a scene, which are not copied yet.
export const isCopyable = (kind: WorldEntryKind) => kind !== "map"

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

// Copies the image file first, then the entry. If the entry cannot be made the
// file is removed again; the other way round, a failure would leave an entry
// whose image is missing. A template's shared portrait has no file and is
// shared as it is.
async function copyEntry(entryId: string, folder: string, targetCampaign: string | null) {
  const newId = crypto.randomUUID()
  const sourcePath = await coverPath(entryId)
  const newPath = sourcePath ? `${folder}/${newId}/${sourcePath.split("/").pop()}` : null

  if (sourcePath && newPath) await copyWorldImage(sourcePath, newPath)

  const { error } = await supabase.rpc("copy_world_entry", {
    source_entry: entryId,
    new_entry_id: newId,
    target_campaign: targetCampaign,
    new_image_path: newPath,
  })
  if (error) {
    await deleteWorldImage(newPath).catch(() => {})
    throw error
  }
}

// A separate copy in the person's library. It remembers where it came from.
export const saveToLibrary = (entryId: string, userId: string) =>
  copyEntry(entryId, userId, null)
