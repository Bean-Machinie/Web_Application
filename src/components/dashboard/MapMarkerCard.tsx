import { Link } from "react-router-dom"
import { ArrowRight, Trash2, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { useEntryPreview } from "@/hooks/use-entry-preview"
import type { BackTo } from "@/lib/back-link"
import { WORLD_KINDS } from "@/lib/world-kinds"
import type { MapMarker } from "@/lib/world-map-markers"
import { HiddenBadge } from "./HiddenBadge"
import { MapMarkerFacts } from "./MapMarkerFacts"

type Props = {
  marker: MapMarker
  // Where the marker's tip is inside the map.
  point: { x: number; y: number }
  canManage: boolean
  // The map to lead back to from the entry.
  backTo: BackTo
  // True once the marker is clicked: the card then has its buttons. Until
  // then it is a hover preview that the pointer passes straight through.
  pinned: boolean
  onClose: () => void
  onRemove: () => void
}

const CARD_WIDTH = "18rem"
// Pin height plus a little air.
const PIN = 52

// The card of a marker: name, kind, a few key facts and the first line of the
// description. It sits above the marker, or below near the top edge.
export function MapMarkerCard({ marker, point, canManage, backTo, pinned, onClose, onRemove }: Props) {
  const { label, icon: KindIcon } = WORLD_KINDS[marker.kind]
  const fields = useEntryPreview(marker.entryId)
  const below = point.y < 230

  return (
    <Card
      className={`animate-in fade-in-0 zoom-in-95 absolute z-[1000] w-[18rem] gap-2.5 py-3 shadow-lg duration-150 motion-reduce:animate-none ${
        pinned ? "" : "pointer-events-none"
      }`}
      style={{
        left: `clamp(calc(${CARD_WIDTH} / 2 + 0.5rem), ${point.x}px, calc(100% - ${CARD_WIDTH} / 2 - 0.5rem))`,
        top: below ? point.y + 10 : point.y - PIN,
        transform: below ? "translateX(-50%)" : "translate(-50%, -100%)",
      }}
    >
      <CardContent className="flex flex-col gap-2.5 px-3">
        <div className="flex items-center gap-3">
          <div className="bg-muted text-muted-foreground flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-lg border">
            {marker.imageUrl ? (
              <img src={marker.imageUrl} alt="" className="size-full object-cover" />
            ) : (
              <KindIcon className="size-5" />
            )}
          </div>
          <div className="flex min-w-0 flex-1 flex-col gap-1.5">
            <p className="truncate leading-none font-medium">{marker.name}</p>
            <div className="flex items-center gap-1.5">
              <Badge variant="outline">{label}</Badge>
              {canManage && !marker.revealed && <HiddenBadge />}
            </div>
          </div>
          {pinned && (
            <Button
              variant="ghost"
              size="icon-xs"
              className="text-muted-foreground self-start"
              aria-label="Close preview"
              onClick={onClose}
            >
              <X />
            </Button>
          )}
        </div>
        <MapMarkerFacts kind={marker.kind} fields={fields} canManage={canManage} />
      </CardContent>
      {pinned && (
        <CardFooter className="gap-2 px-3">
          <Button asChild size="sm" className="flex-1">
            <Link to={`/app/world/${marker.entryId}`} state={{ backTo }}>
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
      )}
    </Card>
  )
}
