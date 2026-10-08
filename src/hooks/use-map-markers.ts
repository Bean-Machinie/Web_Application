import { useCallback, useEffect, useState } from "react"
import { errorMessage } from "@/lib/campaigns"
import {
  addMapMarker,
  fetchMapMarkers,
  moveMapMarker,
  removeMapMarker,
} from "@/lib/world-map-markers"
import type { MapMarker } from "@/lib/world-map-markers"

// The markers of one map. `markers` is null while loading. Moving and
// removing show at once and go back if the database says no.
export function useMapMarkers(mapId: string) {
  const [markers, setMarkers] = useState<MapMarker[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  const reload = useCallback(
    () =>
      fetchMapMarkers(mapId)
        .then(setMarkers)
        .catch((failure) => setError(errorMessage(failure))),
    [mapId]
  )

  useEffect(() => {
    reload()
  }, [reload])

  async function run(change: () => Promise<void>) {
    setError(null)
    try {
      await change()
    } catch (failure) {
      setError(errorMessage(failure))
      await reload()
    }
  }

  const add = (entryId: string, x: number, y: number) =>
    run(async () => {
      await addMapMarker(mapId, entryId, x, y)
      await reload()
    })

  const move = (id: string, x: number, y: number) => {
    setMarkers((old) => old && old.map((marker) => (marker.id === id ? { ...marker, x, y } : marker)))
    return run(() => moveMapMarker(id, x, y))
  }

  const remove = (id: string) => {
    setMarkers((old) => old && old.filter((marker) => marker.id !== id))
    return run(() => removeMapMarker(id))
  }

  return { markers, error, add, move, remove }
}
