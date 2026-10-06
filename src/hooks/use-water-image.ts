import { useDeferredValue, useEffect, useMemo, useState } from "react"
import type { MultiPolygon } from "polygon-clipping"
import type { BuilderView } from "@/hooks/use-builder-viewport"
import type { MapScene } from "@/lib/map-scene"
import type { MapStyle } from "@/lib/map-style"
import { buildField } from "@/lib/map-water-field"
import { renderWater } from "@/lib/map-water-render"
import type { Region } from "@/lib/map-water-render"

// The picture is drawn for what is on screen, with this much extra around it
// so panning shows water at once, and never with more pixels than this.
const MARGIN = 0.25
const MAX_PIXELS = 3_000_000
// Zooming and panning wait this long to settle before the water is drawn again.
const SETTLE_MS = 90

export type Water = { image: HTMLCanvasElement; region: Omit<Region, "scale"> }

// The water around the land, drawn sharp for the current zoom: the part of the
// canvas in view, at the screen's own resolution. Until the redraw is done the
// previous picture stays, a little soft if the view has zoomed in.
export function useWaterImage(
  land: MultiPolygon,
  style: MapStyle,
  canvas: MapScene["canvas"],
  view: BuilderView,
  size: { width: number; height: number }
) {
  const { width, height, background, seed } = canvas
  const field = useMemo(
    () => (land.length > 0 ? buildField(land, { width, height }) : null),
    [land, width, height]
  )
  const rings = useDeferredValue(style.rings)
  const spacing = useDeferredValue(style.spacing)
  const waviness = useDeferredValue(style.waviness)
  const [water, setWater] = useState<Water | null>(null)

  useEffect(() => {
    if (!field) return
    const timer = setTimeout(() => {
      const left = Math.max(-view.x / view.scale - (size.width / view.scale) * MARGIN, 0)
      const top = Math.max(-view.y / view.scale - (size.height / view.scale) * MARGIN, 0)
      const right = Math.min(
        (size.width - view.x) / view.scale + (size.width / view.scale) * MARGIN,
        width
      )
      const bottom = Math.min(
        (size.height - view.y) / view.scale + (size.height / view.scale) * MARGIN,
        height
      )
      if (right <= left || bottom <= top) return
      const region = { x: left, y: top, width: right - left, height: bottom - top }
      const wanted = view.scale * window.devicePixelRatio
      const scale = Math.min(wanted, Math.sqrt(MAX_PIXELS / (region.width * region.height)))
      const image = renderWater(field, { rings, spacing, waviness }, background, seed, { width, height }, { ...region, scale })
      setWater({ image, region })
    }, SETTLE_MS)
    return () => clearTimeout(timer)
  }, [field, rings, spacing, waviness, background, seed, width, height, view, size])

  return field ? water : null
}
