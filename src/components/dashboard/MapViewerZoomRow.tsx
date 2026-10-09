import { useState } from "react"
import type * as L from "leaflet"
import { Maximize, Minus, Plus } from "lucide-react"
import { Slider } from "@/components/ui/slider"
import { useMapZoom } from "@/hooks/use-map-camera"
import { fitBounds } from "@/lib/map-geometry"
import type { MapSize } from "@/lib/map-geometry"
import { glideToBounds, glideZoomBy, glideZoomTo } from "@/lib/map-glide"
import { percentToZoom, zoomToPercent } from "@/lib/map-zoom-percent"
import { MapNumberField } from "./MapNumberField"
import { MapStepButton } from "./MapStepButton"

// A finger's size, on a touch screen.
const TOUCH = "pointer-coarse:size-11"

// The zoom row of the builder's navigator, for the viewer: a slider, a number to type
// over, and the steps and the fit (100%), on the same columns. The slider is a zoom
// level, which is already even in ratios; the number is the viewer's 100% to 400%.
export function MapViewerZoomRow({ map, size }: { map: L.Map; size: MapSize }) {
  const zoom = useMapZoom(map)
  // While the slider is held it shows where it is, not the map, which eases after it.
  const [held, setHeld] = useState<number | null>(null)
  if (zoom === null) return null
  const min = map.getMinZoom()
  const max = map.getMaxZoom()

  return (
    <div className="grid grid-cols-[minmax(2rem,1fr)_2.875rem_repeat(3,1.5rem)] items-center gap-x-1 pointer-coarse:grid-cols-[minmax(2rem,1fr)_3.5rem_repeat(3,2.75rem)]">
      <Slider
        aria-label="Zoom"
        min={min}
        max={max}
        step={0.01}
        value={[held ?? Math.min(Math.max(zoom, min), max)]}
        onValueChange={([zoom]) => {
          setHeld(zoom)
          glideZoomTo(map, zoom)
        }}
        onValueCommit={() => setHeld(null)}
        className="mr-2.5 pointer-coarse:**:data-[slot=slider-thumb]:size-6"
      />
      <MapNumberField
        // 16px on a touch screen, below which iOS zooms the page when a field is focused.
        className="pointer-coarse:h-11 pointer-coarse:text-base"
        label="Zoom percentage"
        unit="%"
        value={zoomToPercent(zoom, { min, max })}
        accepts={(value) => Number.isFinite(value) && value > 0}
        onCommit={(value) => glideZoomTo(map, percentToZoom(value, { min, max }))}
      />
      <MapStepButton label="Zoom out" className={TOUCH} onClick={() => glideZoomBy(map, -1)}>
        <Minus />
      </MapStepButton>
      <MapStepButton label="Zoom in" className={TOUCH} onClick={() => glideZoomBy(map, 1)}>
        <Plus />
      </MapStepButton>
      <MapStepButton label="Fit map to view (100%)" className={TOUCH} onClick={() => glideToBounds(map, fitBounds(size))}>
        <Maximize />
      </MapStepButton>
    </div>
  )
}
