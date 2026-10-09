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
import { useMapCamera } from "@/hooks/use-map-camera"
import { fitBounds } from "@/lib/map-geometry"
import type { MapSize } from "@/lib/map-geometry"
import { glideToBounds, glideZoomBy, glideZoomTo } from "@/lib/map-glide"
import { MapStepButton } from "./MapStepButton"

const PRESETS = [0.25, 0.5, 1, 2, 4]

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
  const camera = useMapCamera(map)
  return (
    <footer className="bg-background grid h-8 shrink-0 grid-cols-[1fr_auto_1fr] items-center border-t px-2">
      <span />
      <div className="flex items-center gap-1">{children}</div>
      <div className="flex items-center justify-end gap-0.5">
        {map && camera && (
          <>
            <MapStepButton label="Fit map to view" onClick={() => glideToBounds(map, fitBounds(size))}>
              <Maximize />
            </MapStepButton>
            <MapStepButton label="Zoom out" onClick={() => glideZoomBy(map, -1)}>
              <Minus />
            </MapStepButton>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="xs" aria-label="Zoom" className="w-14 tabular-nums">
                  {Math.round(2 ** camera.zoom * 100)}%
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" side="top" className="w-36">
                <DropdownMenuItem onSelect={() => glideToBounds(map, fitBounds(size))}>Fit</DropdownMenuItem>
                <DropdownMenuSeparator />
                {PRESETS.map((scale) => (
                  <DropdownMenuItem key={scale} onSelect={() => glideZoomTo(map, Math.log2(scale))}>
                    {scale * 100}%
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <MapStepButton label="Zoom in" onClick={() => glideZoomBy(map, 1)}>
              <Plus />
            </MapStepButton>
          </>
        )}
      </div>
    </footer>
  )
}
