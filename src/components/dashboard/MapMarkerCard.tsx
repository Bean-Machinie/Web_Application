import type { BackTo } from "@/lib/back-link"
import { CARD_ABOVE, CARD_BELOW, CARD_WIDTH, placeCard } from "@/lib/map-marker-card"
import { cn } from "@/lib/utils"
import type { MapMarker } from "@/lib/world-map-markers"
import { MapMarkerCardContent } from "./MapMarkerCardContent"

type Props = {
  marker: MapMarker
  // Where the marker's tip is inside the map, and how wide the map is.
  point: { x: number; y: number }
  mapWidth: number
  canManage: boolean
  // The map to lead back to from the entry.
  backTo: BackTo
  // The entry is being opened, so the map can point the marker out on return.
  onOpen: () => void
  onClose: () => void
  onRemove: () => void
}

// The card of a marker over the map: above the pin with a caret pointing at it, or
// below near the top edge, scaling up from the pin's position.
export function MapMarkerCard({ marker, point, mapWidth, ...content }: Props) {
  const { left, below } = placeCard(point, mapWidth)
  // The pin's place along the card, which the caret points at.
  const pinX = Math.max(20, Math.min(-left, CARD_WIDTH - 20))

  return (
    <div className="absolute z-[1000] size-0" style={{ left: point.x, top: point.y }}>
      <div
        className="absolute"
        style={{ left, width: CARD_WIDTH, ...(below ? { top: CARD_BELOW } : { bottom: CARD_ABOVE }) }}
      >
        <div
          // The zoom is dropped, leaving a fade, for people who ask for reduced motion.
          className="animate-in fade-in-0 zoom-in-50 motion-reduce:zoom-in-100 relative duration-200 ease-out"
          style={{ transformOrigin: `${pinX}px ${below ? "-10px" : "calc(100% + 10px)"}` }}
        >
          <MapMarkerCardContent marker={marker} {...content} />
          {/* Over the card's edge, so the card's own outline does not cross it. */}
          <div
            aria-hidden
            style={{ left: pinX - 6 }}
            className={cn(
              "bg-card border-foreground/10 pointer-events-none absolute size-3 rotate-45",
              below ? "-top-1.5 border-t border-l" : "-bottom-1.5 border-r border-b"
            )}
          />
        </div>
      </div>
    </div>
  )
}
