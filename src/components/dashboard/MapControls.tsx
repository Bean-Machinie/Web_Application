import type * as L from "leaflet"
import { Maximize, Minus, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { mapBounds } from "@/lib/map-geometry"
import type { MapSize } from "@/lib/map-geometry"
import { MAP_FLOAT, MAP_FLOAT_BUTTON } from "./map-float"

type Props = { map: L.Map | null; size: MapSize }

// Zoom in, zoom out and fit, as one small stack in the bottom right corner.
export function MapControls({ map, size }: Props) {
  return (
    <div
      className={`${MAP_FLOAT} absolute right-4 bottom-4 z-[1000] flex flex-col divide-y overflow-hidden`}
    >
      <Button
        variant="ghost"
        aria-label="Zoom in"
        className={MAP_FLOAT_BUTTON}
        onClick={() => map?.zoomIn()}
      >
        <Plus />
      </Button>
      <Button
        variant="ghost"
        aria-label="Zoom out"
        className={MAP_FLOAT_BUTTON}
        onClick={() => map?.zoomOut()}
      >
        <Minus />
      </Button>
      <Button
        variant="ghost"
        aria-label="Fit map to view"
        className={MAP_FLOAT_BUTTON}
        onClick={() => map?.fitBounds(mapBounds(size))}
      >
        <Maximize />
      </Button>
    </div>
  )
}
