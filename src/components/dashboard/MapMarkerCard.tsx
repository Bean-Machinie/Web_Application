import { Link } from "react-router-dom"
import { ArrowRight, Trash2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { useEntryPreview } from "@/hooks/use-entry-preview"
import type { BackTo } from "@/lib/back-link"
import { CARD_ABOVE, CARD_BELOW, CARD_WIDTH, placeCard } from "@/lib/map-marker-card"
import { cn } from "@/lib/utils"
import { WORLD_KINDS } from "@/lib/world-kinds"
import type { MapMarker } from "@/lib/world-map-markers"
import { HiddenBadge } from "./HiddenBadge"
import { KindLabel } from "./KindLabel"
import { MapMarkerFacts } from "./MapMarkerFacts"

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

// The card of a marker: name, kind, a few key facts and the first line of the
// description. It sits above the pin with a caret pointing at it, or below
// near the top edge, and scales up from the pin's position.
export function MapMarkerCard({ marker, point, mapWidth, canManage, backTo, onOpen, onClose, onRemove }: Props) {
  const { icon: KindIcon, tint } = WORLD_KINDS[marker.kind]
  const fields = useEntryPreview(marker.entryId)
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
          <Card className="gap-2.5 py-3 shadow-lg">
            <CardContent className="flex flex-col gap-2.5 px-3">
              <div className="flex items-center gap-3">
                <div
                  style={{ borderColor: marker.revealed ? tint : undefined }}
                  className={cn(
                    "bg-muted text-muted-foreground flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-lg border-2",
                    !marker.revealed && "border-muted-foreground border-dashed"
                  )}
                >
                  {marker.imageUrl ? (
                    <img src={marker.imageUrl} alt="" className="size-full object-cover" />
                  ) : (
                    <KindIcon className="size-5" />
                  )}
                </div>
                <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                  <p className="truncate leading-none font-medium">{marker.name}</p>
                  <div className="flex items-center gap-1.5">
                    <KindLabel kind={marker.kind} />
                    {canManage && !marker.revealed && <HiddenBadge />}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon-xs"
                  className="text-muted-foreground self-start"
                  aria-label="Close preview"
                  onClick={onClose}
                >
                  <X />
                </Button>
              </div>
              <MapMarkerFacts kind={marker.kind} fields={fields} canManage={canManage} />
            </CardContent>
            <CardFooter className="gap-2 px-3">
              <Button asChild size="sm" className="flex-1">
                <Link to={`/app/world/${marker.entryId}`} state={{ backTo }} onClick={onOpen}>
                  Open entry
                  <ArrowRight />
                </Link>
              </Button>
              {canManage && (
                <Button
                  variant="outline"
                  size="icon-sm"
                  className="text-muted-foreground hover:text-destructive"
                  aria-label={`Remove marker for ${marker.name}`}
                  onClick={onRemove}
                >
                  <Trash2 />
                </Button>
              )}
            </CardFooter>
          </Card>
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
