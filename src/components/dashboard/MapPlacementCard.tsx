import { Link } from "react-router-dom"
import { Badge } from "@/components/ui/badge"
import { rememberReturn } from "@/lib/map-view"
import type { PlacementGroup } from "@/lib/world-map-markers"
import { HiddenBadge } from "./HiddenBadge"
import { MapPlacementPreview } from "./MapPlacementPreview"
import type { PlacedEntry } from "./MapPlacementPreview"

// How far in the map opens, counted from fully zoomed out.
const OPEN_ZOOM = 1.5

type Props = { group: PlacementGroup; entry: PlacedEntry }

// In the shape of the cards in the World list: a square picture, the text
// below, and the same lift on hover. It opens the map framed on the first
// marker, which pulses once. A map has no origin but its own place in the World list. The
// layer hint keeps the picture from being redrawn, and jumping, when the hover
// animation ends.
export function MapPlacementCard({ group, entry }: Props) {
  const { id, x, y, mapId, mapName, mapRevealed } = group.first

  return (
    <Link
      to={`/app/world/${mapId}?view=${x},${y},${OPEN_ZOOM}`}
      onClick={() => rememberReturn(mapId, id)}
      className={`bg-card hover:border-foreground/25 focus-visible:ring-ring relative block overflow-hidden rounded-lg border outline-none will-change-[translate,rotate,scale] transition-[translate,rotate,scale,box-shadow,border-color] duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:z-10 hover:shadow-lg focus-visible:ring-2 [@media(hover:hover)]:hover:-translate-y-1 [@media(hover:hover)]:hover:-rotate-1 [@media(hover:hover)]:hover:scale-[1.03] motion-reduce:transition-none motion-reduce:hover:translate-y-0 motion-reduce:hover:rotate-0 motion-reduce:hover:scale-100 ${
        mapRevealed ? "" : "border-dashed"
      }`}
    >
      <div className="relative">
        <MapPlacementPreview placement={group.first} entry={entry} />
        {!mapRevealed && <HiddenBadge className="absolute top-2 left-2" />}
        {group.count > 1 && (
          <Badge
            variant="secondary"
            className="absolute top-2 right-2"
            title={`${group.count} places on this map`}
          >
            ×{group.count}
          </Badge>
        )}
      </div>
      <div className="flex flex-col p-3">
        <span className="text-muted-foreground text-xs">On the map of</span>
        <span className="truncate text-sm font-medium">{mapName}</span>
      </div>
    </Link>
  )
}
