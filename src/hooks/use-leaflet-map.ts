import { useEffect, useRef, useState } from "react"
import * as L from "leaflet"
import { mapBounds } from "@/lib/map-geometry"
import type { MapSize } from "@/lib/map-geometry"

// A flat, non-geographic Leaflet map showing one image. The image fits the
// container at first, and cannot be zoomed out further than that. Render the
// returned ref on an empty element with an explicit size.
export function useLeafletMap(url: string, size: MapSize) {
  const container = useRef<HTMLDivElement>(null)
  const [map, setMap] = useState<L.Map | null>(null)

  useEffect(() => {
    const element = container.current
    if (!element) return

    const bounds = mapBounds(size)
    const instance = L.map(element, {
      crs: L.CRS.Simple,
      zoomControl: false,
      attributionControl: false,
      // Fractional zoom makes wheel and pinch zoom feel smooth.
      zoomSnap: 0,
      zoomDelta: 0.5,
      wheelPxPerZoomLevel: 100,
      maxZoom: 2,
      maxBoundsViscosity: 0.9,
    })
    L.imageOverlay(url, bounds).addTo(instance)
    instance.setMaxBounds(bounds.pad(0.15))

    const fitZoom = () => instance.getBoundsZoom(bounds, false)
    instance.setMinZoom(fitZoom())
    instance.fitBounds(bounds, { animate: false })

    // When the container changes size, stay fitted if that is where we were.
    const observer = new ResizeObserver(() => {
      const wasFitted = instance.getZoom() <= instance.getMinZoom() + 0.01
      instance.invalidateSize()
      instance.setMinZoom(fitZoom())
      if (wasFitted) instance.fitBounds(bounds, { animate: false })
    })
    observer.observe(element)

    setMap(instance)
    return () => {
      observer.disconnect()
      instance.remove()
      setMap(null)
    }
  }, [url, size])

  return { container, map }
}
