import type * as L from "leaflet"
import { Maximize, Minus, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { mapBounds } from "@/lib/map-geometry"
import type { MapSize } from "@/lib/map-geometry"

type Props = { map: L.Map | null; size: MapSize }

// Zoom in, zoom out and fit, as one small stack in the corner.
export function MapControls({ map, size }: Props) {
  return (
    <div className="bg-background/90 absolute top-3 right-3 z-[1000] flex flex-col divide-y overflow-hidden rounded-lg border shadow-sm backdrop-blur-sm">
      <Button variant="ghost" size="icon-sm" aria-label="Zoom in" onClick={() => map?.zoomIn()}>
        <Plus />
      </Button>
      <Button variant="ghost" size="icon-sm" aria-label="Zoom out" onClick={() => map?.zoomOut()}>
        <Minus />
      </Button>
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label="Fit map to view"
        onClick={() => map?.fitBounds(mapBounds(size))}
      >
        <Maximize />
      </Button>
    </div>
  )
}
