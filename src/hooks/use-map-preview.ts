import { useEffect, useState } from "react"
import { cachedPreview, previewKey, requestPreview } from "@/lib/map-preview"
import { loadStoredPreview, storePreview } from "@/lib/map-preview-store"
import { fetchMapScene, fetchSceneStates } from "@/lib/world-map-scenes"

// "none": the map has no saved scene (or this person cannot see it). "failed": it has one, but
// the picture could not be made.
export type MapPreview =
  | { status: "loading" }
  | { status: "none" }
  | { status: "failed" }
  | { status: "draft"; url: string; width: number; height: number }

const LOADING: MapPreview = { status: "loading" }

// A rendered picture of a map's saved scene, for a map with no published image. Nothing is
// uploaded to the entry. When not `wanted` (a row scrolled out of sight), nothing is fetched or
// drawn. With a `folder` (where the map's files are kept) the drawn picture is also kept in
// storage, and the next visit loads that instead of drawing again.
export function useMapPreview(mapId: string, wanted: boolean, maxSide: number, folder?: string) {
  const [result, setResult] = useState<{ mapId: string; preview: MapPreview }>()

  useEffect(() => {
    if (!wanted) return
    let current = true
    const settle = (preview: MapPreview) => current && setResult({ mapId, preview })

    void (async () => {
      try {
        const [state] = await fetchSceneStates([mapId])
        if (!state) return settle({ status: "none" })

        // The scene is only fetched when no picture of this version has been made yet.
        const key = previewKey(mapId, state.updatedAt, maxSide)
        const kept = (await cachedPreview(key)) ?? (folder ? await loadStoredPreview(folder, mapId, state.updatedAt) : null)
        if (kept) return settle({ status: "draft", ...kept })

        const loaded = await fetchMapScene(mapId)
        const picture = loaded && (await requestPreview(key, loaded.scene, maxSide))
        if (picture && folder) void storePreview(folder, mapId, state.updatedAt, picture.url)
        settle(picture ? { status: "draft", ...picture } : { status: "none" })
      } catch {
        settle({ status: "failed" })
      }
    })()

    return () => {
      current = false
    }
  }, [mapId, wanted, maxSide, folder])

  return result?.mapId === mapId ? result.preview : LOADING
}
