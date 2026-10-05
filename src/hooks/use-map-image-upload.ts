import { useState } from "react"
import { errorMessage } from "@/lib/campaigns"
import { prepareMapImage } from "@/lib/resize-map-image"
import type { PreparedMap } from "@/lib/resize-map-image"
import { deleteWorldImage, uploadWorldImage } from "@/lib/world-images"
import type { WorldImage } from "@/lib/world-images"

type Options = {
  campaignId: string
  entryId: string
  current: WorldImage | null
  // Resolves to whether the new image was saved.
  onSave: (value: WorldImage) => Promise<boolean>
}

// Uploads a map (a picked one is shrunk and converted first) with its size, and saves it
// on the entry. The old file goes only once the entry points at the new one,
// and a file the database refused is deleted again. Resolves to whether the
// map now has the new image.
export function useMapImageUpload({ campaignId, entryId, current, onSave }: Options) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function upload(prepare: () => Promise<PreparedMap>) {
    setBusy(true)
    setError(null)
    try {
      const prepared = await prepare()
      const uploaded = await uploadWorldImage(campaignId, entryId, prepared.file, "map")
      const saved = await onSave({
        ...uploaded,
        width: prepared.width,
        height: prepared.height,
        maxZoom: prepared.maxZoom,
      })
      await deleteWorldImage(saved ? current?.path : uploaded.path, "map").catch(() => {})
      return saved
    } catch (failure) {
      setError(errorMessage(failure))
      return false
    } finally {
      setBusy(false)
    }
  }

  return {
    busy,
    error,
    // A file picked by hand: shrunk and converted first.
    pick: (file: File) => upload(() => prepareMapImage(file)),
    // A map that is already as it should be, as the builder renders it.
    publish: (prepared: PreparedMap) => upload(async () => prepared),
  }
}

export type MapImageUpload = ReturnType<typeof useMapImageUpload>
