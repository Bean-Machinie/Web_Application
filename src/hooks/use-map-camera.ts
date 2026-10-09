import { useEffect, useState } from "react"
import type * as L from "leaflet"
import { viewOf } from "@/lib/map-glide"

const EVENTS = "move zoom glide zoomlevelschange resize"

// Where the map is looking, as it moves (mid-glide too). The map says so many times
// a frame while it is dragged or pinched; what shows it is drawn once a frame.
function useMapCameraPart<T>(map: L.Map | null, read: (camera: ReturnType<typeof viewOf>) => T) {
  const [value, setValue] = useState<T | null>(() => (map ? read(viewOf(map)) : null))
  useEffect(() => {
    if (!map) return
    let frame = 0
    const update = () => {
      frame = 0
      // The same number or the same camera part bails out of drawing at all.
      setValue(read(viewOf(map)))
    }
    const soon = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    update()
    map.on(EVENTS, soon)
    return () => {
      map.off(EVENTS, soon)
      cancelAnimationFrame(frame)
    }
  }, [map, read])
  return value
}

const wholeCamera = (camera: ReturnType<typeof viewOf>) => camera
const zoomOnly = (camera: ReturnType<typeof viewOf>) => camera.zoom

// The centre and the zoom, for what follows the view in both (the navigator's
// rectangle).
export const useMapCamera = (map: L.Map | null) => useMapCameraPart(map, wholeCamera)

// Only the zoom, so that panning draws nothing of what shows just that.
export const useMapZoom = (map: L.Map | null) => useMapCameraPart(map, zoomOnly)
