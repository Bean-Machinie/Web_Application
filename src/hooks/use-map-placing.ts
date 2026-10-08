import { useEffect, useState } from "react"
import type * as L from "leaflet"
import { toPercent } from "@/lib/map-geometry"
import type { MapSize, Percent } from "@/lib/map-geometry"

// Choosing where a new marker goes. While `placing`, the next click on the map
// sets `pending` instead of closing what is open; Escape gives up.
export function useMapPlacing(map: L.Map | null, size: MapSize, onOtherClick: () => void) {
  const [placing, setPlacing] = useState(false)
  const [pending, setPending] = useState<Percent | null>(null)

  useEffect(() => {
    if (!map) return
    const onClick = (event: L.LeafletMouseEvent) => {
      if (placing) {
        setPending(toPercent(event.latlng, size))
        setPlacing(false)
      } else {
        onOtherClick()
      }
    }
    map.on("click", onClick)
    return () => {
      map.off("click", onClick)
    }
  }, [map, size, placing, onOtherClick])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setPlacing(false)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  return { placing, setPlacing, pending, setPending }
}
