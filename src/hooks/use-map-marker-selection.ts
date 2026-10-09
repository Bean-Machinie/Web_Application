import { useCallback, useEffect, useState } from "react"
import type * as L from "leaflet"

// Which marker is open (its card, or its menu while editing) and whether a GM
// is editing markers. A pan, a zoom or Escape closes the open one, so it never
// drifts from its pin; unless it is not at its pin (the phone's card, along the
// bottom), which stays open while the map is moved.
export function useMapMarkerSelection(map: L.Map | null, closeOnMove = true) {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [editing, setEditing] = useState(false)

  const clear = useCallback(() => setSelectedId(null), [])

  const toggleEditing = useCallback(() => {
    setSelectedId(null)
    setEditing((on) => !on)
  }, [])

  useEffect(() => {
    if (!map || !closeOnMove) return
    map.on("movestart zoomstart", clear)
    return () => {
      map.off("movestart zoomstart", clear)
    }
  }, [map, clear, closeOnMove])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") clear()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [clear])

  return { selectedId, select: setSelectedId, clear, editing, toggleEditing }
}
