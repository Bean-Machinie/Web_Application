import type * as L from "leaflet"
import { Maximize, Minus, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useMapZoom } from "@/hooks/use-map-camera"
import { fitBounds } from "@/lib/map-geometry"
import type { MapSize } from "@/lib/map-geometry"
import { glideToBounds, glideZoomBy, glideZoomTo } from "@/lib/map-glide"
import { percentToZoom, zoomToPercent } from "@/lib/map-zoom-percent"
import { MapStepButton } from "./MapStepButton"

// Zooms to jump to, as the viewer names them: 100% is the whole map in view.
const PRESETS = [150, 200, 300, 400]

type Props = {
  map: L.Map | null
  size: MapSize
  // The GM's marker tools, in the middle.
  children?: React.ReactNode
}

// The thin bar under the map, as the builder's: the marker tools (for a GM) in the
// middle, and at the right the zoom, as a percentage that opens a list of zooms to
// jump to, with the buttons to step and to fit.
export function MapViewerStatusBar({ map, size, children }: Props) {
  const zoom = useMapZoom(map)
  return (
    <footer className="bg-background grid h-8 pointer-coarse:h-12 shrink-0 grid-cols-[1fr_auto_1fr] items-center border-t px-2">
      <span />
      <div className="flex items-center gap-1">{children}</div>
      <div className="flex items-center justify-end gap-0.5">
        {map && zoom !== null && (
          <>
            <MapStepButton label="Fit map to view" className="pointer-coarse:size-11" onClick={() => glideToBounds(map, fitBounds(size))}>
              <Maximize />
            </MapStepButton>
            {/* A phone zooms by pinching, and by the navigator's own zoom. */}
            <MapStepButton label="Zoom out" className="pointer-coarse:size-11 max-md:hidden" onClick={() => glideZoomBy(map, -1)}>
              <Minus />
            </MapStepButton>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="xs" aria-label="Zoom" className="pointer-coarse:h-11 w-14 tabular-nums">
                  {zoomToPercent(zoom, { min: map.getMinZoom(), max: map.getMaxZoom() })}%
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" side="top" className="w-36">
                <DropdownMenuItem onSelect={() => glideToBounds(map, fitBounds(size))}>Fit (100%)</DropdownMenuItem>
                <DropdownMenuSeparator />
                {PRESETS.map((percent) => (
                  <DropdownMenuItem
                    key={percent}
                    onSelect={() => glideZoomTo(map, percentToZoom(percent, { min: map.getMinZoom(), max: map.getMaxZoom() }))}
                  >
                    {percent}%
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <MapStepButton label="Zoom in" className="pointer-coarse:size-11 max-md:hidden" onClick={() => glideZoomBy(map, 1)}>
              <Plus />
            </MapStepButton>
          </>
        )}
      </div>
    </footer>
  )
}
