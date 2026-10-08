import { useEffect, useState } from "react"
import type * as L from "leaflet"

// Where a spot on the map is inside the map's container, kept up to date as
// the map pans and zooms. Null while there is no spot.
export function useMapPoint(map: L.Map | null, position: L.LatLng | null) {
  const [point, setPoint] = useState<{ x: number; y: number } | null>(null)

  useEffect(() => {
    if (!map || !position) return
    const update = () => {
      const { x, y } = map.latLngToContainerPoint(position)
      setPoint({ x, y })
    }
    update()
    map.on("move zoom resize", update)
    return () => {
      map.off("move zoom resize", update)
    }
  }, [map, position])

  // A stale point is ignored once there is nothing to point at.
  return map && position ? point : null
}
