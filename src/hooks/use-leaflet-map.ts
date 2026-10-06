import { useEffect, useRef, useState } from "react"
import * as L from "leaflet"
import { attachGlide } from "@/lib/map-glide"
import { fitBounds, mapBounds } from "@/lib/map-geometry"
import { SmoothImageOverlay } from "@/lib/smooth-image-overlay"
import type { MapSize } from "@/lib/map-geometry"

// A flat, non-geographic Leaflet map showing one image. The image fits the
// container at first, and cannot be zoomed out further than that. Render the
// returned ref on an empty element with an explicit size, and never change
// that element's className: Leaflet keeps its own classes on it, and React
// would overwrite them.
// How far in a map zooms unless its image says otherwise: four times its pixels.
const DEFAULT_MAX_ZOOM = 2
// Zoom levels the viewer stops short of a map's own maximum, which is stored
// with each map, so this reaches maps that were already published.
const ZOOM_IN_TRIM = 1

export function useLeafletMap(url: string, size: MapSize, maxZoom = DEFAULT_MAX_ZOOM) {
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
      // Fractional zoom makes wheel and pinch zoom feel smooth. Wheel and
      // double click zoom are driven by attachGlide instead, which eases on
      // every frame; Leaflet's own animation would fight it.
      zoomSnap: 0,
      zoomAnimation: false,
      scrollWheelZoom: false,
      doubleClickZoom: false,
      // Leaflet clamps "fit the image" to this, so it must be low enough for
      // any map; the real limit is set below once the image is measured.
      minZoom: -20,
      maxZoom: maxZoom - ZOOM_IN_TRIM,
      maxBoundsViscosity: 0.9,
    })
    new SmoothImageOverlay(url, bounds, { className: "map-sheet" }).addTo(instance)
    // A generous margin: the map can be pushed aside, but never out of sight.
    instance.setMaxBounds(bounds.pad(0.5))

    const fitted = fitBounds(size)
    const fitZoom = () => instance.getBoundsZoom(fitted, false)
    instance.setMinZoom(fitZoom())
    instance.fitBounds(fitted, { animate: false })

    // When the container changes size, stay fitted if that is where we were.
    const observer = new ResizeObserver(() => {
      const wasFitted = instance.getZoom() <= instance.getMinZoom() + 0.01
      instance.invalidateSize()
      instance.setMinZoom(fitZoom())
      if (wasFitted) instance.fitBounds(fitted, { animate: false })
    })
    observer.observe(element)

    const detach = attachGlide(instance)
    setMap(instance)
    return () => {
      detach()
      observer.disconnect()
      instance.remove()
      setMap(null)
    }
  }, [url, size, maxZoom])

  return { container, map }
}
