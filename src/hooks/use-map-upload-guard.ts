import { useEffect, useState } from "react"
import type { MapImageUpload } from "@/hooks/use-map-image-upload"
import { errorMessage } from "@/lib/campaigns"
import { discardMapScene, hasMapScene } from "@/lib/world-map-scenes"

// Knows whether the map was built in the map builder, and holds an image picked
// for it until the GM has confirmed that it replaces the builder's scene. The
// scene is only discarded once the image is in; a map that is not built goes
// straight to the upload.
export function useMapUploadGuard(mapId: string, canManage: boolean, upload: MapImageUpload) {
  const [built, setBuilt] = useState(false)
  const [waiting, setWaiting] = useState<File | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!canManage) return
    hasMapScene(mapId)
      .then(setBuilt)
      .catch(() => {})
  }, [mapId, canManage])

  async function confirm() {
    if (!waiting) return
    setBusy(true)
    setError(null)
    try {
      if (await upload.pick(waiting)) {
        await discardMapScene(mapId)
        setBuilt(false)
        setWaiting(null)
      }
    } catch (failure) {
      setError(errorMessage(failure))
    } finally {
      setBusy(false)
    }
  }

  return {
    built,
    upload: {
      ...upload,
      pick: async (file: File) => {
        if (!built) return upload.pick(file)
        setWaiting(file)
        return false
      },
    },
    confirm: {
      open: waiting !== null,
      busy: busy || upload.busy,
      error: error ?? upload.error,
      onConfirm: confirm,
      onCancel: () => {
        setWaiting(null)
        setError(null)
      },
    },
  }
}
