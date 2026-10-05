import { Link } from "react-router-dom"
import type { BackTo } from "@/lib/back-link"
import { rememberReturn } from "@/lib/map-view"
import type { Placement } from "@/lib/world-map-markers"
import { HiddenBadge } from "./HiddenBadge"
import { MapPlacementPreview } from "./MapPlacementPreview"
import type { PlacedEntry } from "./MapPlacementPreview"

// How far in the map opens, counted from fully zoomed out.
const OPEN_ZOOM = 1.5

type Props = { placement: Placement; entry: PlacedEntry; backTo: BackTo }

// In the shape of the cards in the World list: a square picture, the text
// below, and the same lift on hover. It opens the map framed on the marker,
// which pulses once, and the map's breadcrumbs lead back here.
export function MapPlacementCard({ placement, entry, backTo }: Props) {
  const { id, x, y, mapId, mapName, mapRevealed } = placement

  return (
    <Link
      to={`/app/world/${mapId}?view=${x},${y},${OPEN_ZOOM}`}
      state={{ backTo }}
      onClick={() => rememberReturn(mapId, id)}
      className={`group/pin bg-card hover:border-foreground/25 focus-visible:ring-ring relative block overflow-hidden rounded-lg border outline-none transition-[translate,rotate,scale,box-shadow,border-color] duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:z-10 hover:shadow-lg focus-visible:ring-2 [@media(hover:hover)]:hover:-translate-y-1 [@media(hover:hover)]:hover:-rotate-1 [@media(hover:hover)]:hover:scale-[1.03] motion-reduce:transition-none motion-reduce:hover:translate-y-0 motion-reduce:hover:rotate-0 motion-reduce:hover:scale-100 ${
        mapRevealed ? "" : "border-dashed"
      }`}
    >
      <div className="relative">
        <MapPlacementPreview placement={placement} entry={entry} />
        {!mapRevealed && <HiddenBadge className="absolute top-2 left-2" />}
      </div>
      <div className="flex flex-col gap-0.5 p-3.5">
        <span className="text-muted-foreground text-sm">On the map of</span>
        <span className="truncate font-medium">{mapName}</span>
      </div>
    </Link>
  )
}
