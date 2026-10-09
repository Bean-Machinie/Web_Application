import { useEffect, useState } from "react"
import type * as L from "leaflet"
import { viewOf } from "@/lib/map-glide"

// Where the map is looking, as it moves (mid-glide too), for what shows it: the
// navigator's rectangle and the zoom.
export function useMapCamera(map: L.Map | null) {
  const [camera, setCamera] = useState(() => (map ? viewOf(map) : null))
  useEffect(() => {
    if (!map) return
    const update = () => setCamera(viewOf(map))
    update()
    map.on("move zoom glide zoomlevelschange resize", update)
    return () => {
      map.off("move zoom glide zoomlevelschange resize", update)
    }
  }, [map])
  return camera
}
