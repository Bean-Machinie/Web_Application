import { useState } from "react"
import type * as L from "leaflet"
import { ChevronDown, ChevronUp, MoreHorizontal } from "lucide-react"
import type { MapSize } from "@/lib/map-geometry"
import { MapCardButton } from "./MapCardButton"
import { MapViewerNavigatorBody } from "./MapViewerNavigatorBody"
import { MAP_FLOAT } from "./map-float"

type Props = { map: L.Map | null; url: string; size: MapSize; onDetails: () => void }

// The navigator over the map, in the top right corner: a bar with its name and two
// buttons, to put it away and for the details, and under it the picture of the map
// and the zoom. Put away, only the two buttons are left.
export function MapViewerNavigator({ map, url, size, onDetails }: Props) {
  const [open, setOpen] = useState(true)
  if (!map) return null

  return (
    <div
      className={`${MAP_FLOAT} absolute top-4 right-4 z-[1000] overflow-hidden transition-[width] duration-200 ease-linear motion-reduce:transition-none ${open ? "w-56 sm:w-64" : "w-16"}`}
    >
      <div className="bg-muted/50 flex h-8 items-stretch">
        <span className="min-w-0 flex-1 overflow-hidden">
          <span className="block truncate px-3 text-xs leading-8 font-medium">Navigator</span>
        </span>
        <MapCardButton label={open ? "Collapse the navigator" : "Expand the navigator"} onClick={() => setOpen(!open)}>
          {open ? <ChevronUp /> : <ChevronDown />}
        </MapCardButton>
        <MapCardButton label="Details" onClick={onDetails}>
          <MoreHorizontal />
        </MapCardButton>
      </div>
      {/* Slides shut by the height of its row going to nothing. */}
      <div
        inert={!open}
        className={`grid transition-[grid-template-rows] duration-200 ease-linear motion-reduce:transition-none ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
      >
        <div className="min-h-0 overflow-hidden border-t">
          <MapViewerNavigatorBody map={map} url={url} size={size} />
        </div>
      </div>
    </div>
  )
}
