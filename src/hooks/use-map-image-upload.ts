import { useState } from "react"
import { errorMessage } from "@/lib/campaigns"
import { prepareMapImage } from "@/lib/resize-map-image"
import { deleteWorldImage, uploadWorldImage } from "@/lib/world-images"
import type { WorldImage } from "@/lib/world-images"

type Options = {
  campaignId: string
  entryId: string
  current: WorldImage | null
  // Resolves to whether the new image was saved.
  onSave: (value: WorldImage) => Promise<boolean>
}

// Shrinks and converts the picked map, uploads it with its size, and saves it
// on the entry. The old file goes only once the entry points at the new one,
// and a file the database refused is deleted again.
export function useMapImageUpload({ campaignId, entryId, current, onSave }: Options) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function pick(file: File) {
    setBusy(true)
    setError(null)
    try {
      const prepared = await prepareMapImage(file)
      const uploaded = await uploadWorldImage(campaignId, entryId, prepared.file, "map")
      const saved = await onSave({
        ...uploaded,
        width: prepared.width,
        height: prepared.height,
      })
      await deleteWorldImage(saved ? current?.path : uploaded.path, "map").catch(() => {})
    } catch (failure) {
      setError(errorMessage(failure))
    } finally {
      setBusy(false)
    }
  }

  return { busy, error, pick }
}

export type MapImageUpload = ReturnType<typeof useMapImageUpload>
