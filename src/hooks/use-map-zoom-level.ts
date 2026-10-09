import { useEffect } from "react"
import type * as L from "leaflet"

// Tells the map's markers how close in the map is, as a class on its container
// that their styles read: far out shows dots, close in adds names. The levels
// are shares of the zoom range, so any map size behaves alike. Editing always
// shows full pins.
export function useMapZoomLevel(map: L.Map | null, editing: boolean) {
  useEffect(() => {
    if (!map) return
    const element = map.getContainer()
    const update = () => {
      const min = map.getMinZoom()
      const range = map.getMaxZoom() - min
      const depth = range > 0 ? (map.getZoom() - min) / range : 0.5
      element.classList.toggle("map-zoom-far", !editing && depth < 0.2)
      element.classList.toggle("map-zoom-near", !editing && depth > 0.65)
    }
    update()
    map.on("zoomend zoomlevelschange", update)
    return () => {
      map.off("zoomend zoomlevelschange", update)
      element.classList.remove("map-zoom-far", "map-zoom-near")
    }
  }, [map, editing])
}
