import { useEffect, useMemo, useState } from "react"
import type { WorldEntry } from "@/lib/world-entries"
import { fetchSceneStates } from "@/lib/world-map-scenes"
import type { SceneState } from "@/lib/world-map-scenes"

// The built maps among these entries, by id, with when each was saved and published.
// Null until they have loaded; if they cannot be read, none count as built.
export function useLibraryScenes(entries: WorldEntry[] | null) {
  const ready = entries !== null
  const ids = useMemo(
    () => (entries ?? []).filter((entry) => entry.kind === "map").map((entry) => entry.id).sort().join(","),
    [entries]
  )
  const [loaded, setLoaded] = useState<{ ids: string; scenes: Map<string, SceneState> } | null>(null)

  useEffect(() => {
    if (!ready) return
    let current = true
    fetchSceneStates(ids ? ids.split(",") : [])
      .catch(() => [] as SceneState[])
      .then((rows) => current && setLoaded({ ids, scenes: new Map(rows.map((row) => [row.mapId, row])) }))
    return () => {
      current = false
    }
  }, [ids, ready])

  return loaded?.scenes ?? null
}
