import { useState } from "react"
import type * as L from "leaflet"
import { Minus, Percent, Plus } from "lucide-react"
import { Slider } from "@/components/ui/slider"
import { useMapCamera } from "@/hooks/use-map-camera"
import { glideZoomBy, glideZoomTo } from "@/lib/map-glide"
import { MapNumberField } from "./MapNumberField"
import { MapStepButton } from "./MapStepButton"

// One zoom level is a doubling, so the slider is already even in ratios, and 0 is
// the image's own pixels: 100%.
// A finger's size, on a touch screen.
const TOUCH = "pointer-coarse:size-11"
const percentOf = (zoom: number) => Math.round(2 ** zoom * 100)

// The zoom row of the builder's navigator, for the viewer: a slider, a number to type
// over, and the steps and the jump to 100%, on the same columns.
export function MapViewerZoomRow({ map }: { map: L.Map }) {
  const camera = useMapCamera(map)
  // While the slider is held it shows where it is, not the map, which eases after it.
  const [held, setHeld] = useState<number | null>(null)
  if (!camera) return null
  const min = map.getMinZoom()
  const max = map.getMaxZoom()

  return (
    <div className="grid grid-cols-[minmax(2rem,1fr)_2.875rem_repeat(3,1.5rem)] items-center gap-x-1 pointer-coarse:grid-cols-[minmax(2rem,1fr)_3.5rem_repeat(3,2.75rem)]">
      <Slider
        aria-label="Zoom"
        min={min}
        max={max}
        step={0.01}
        value={[held ?? Math.min(Math.max(camera.zoom, min), max)]}
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
        value={percentOf(camera.zoom)}
        accepts={(value) => Number.isFinite(value) && value > 0}
        onCommit={(value) => glideZoomTo(map, Math.log2(value / 100))}
      />
      <MapStepButton label="Zoom out" className={TOUCH} onClick={() => glideZoomBy(map, -1)}>
        <Minus />
      </MapStepButton>
      <MapStepButton label="Zoom in" className={TOUCH} onClick={() => glideZoomBy(map, 1)}>
        <Plus />
      </MapStepButton>
      <MapStepButton label="Zoom to 100%" className={TOUCH} onClick={() => glideZoomTo(map, 0)}>
        <Percent />
      </MapStepButton>
    </div>
  )
}
