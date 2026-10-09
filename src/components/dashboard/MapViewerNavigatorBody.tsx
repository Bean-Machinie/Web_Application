import type * as L from "leaflet"
import type { MapSize } from "@/lib/map-geometry"
import { MapViewerThumbnail } from "./MapViewerThumbnail"
import { MapViewerZoomRow } from "./MapViewerZoomRow"

type Props = { map: L.Map; url: string; size: MapSize }

// What the navigator holds, whether it floats over the map or opens as a sheet: the
// picture of the map to find a place on, and the zoom under it.
export function MapViewerNavigatorBody({ map, url, size }: Props) {
  return (
    <div className="flex flex-col gap-2 p-3">
      <MapViewerThumbnail map={map} url={url} size={size} />
      <MapViewerZoomRow map={map} size={size} />
    </div>
  )
}
