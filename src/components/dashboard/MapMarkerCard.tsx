import { Link } from "react-router-dom"
import { ArrowRight, Trash2, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { WORLD_KINDS } from "@/lib/world-kinds"
import type { MapMarker } from "@/lib/world-map-markers"
import { HiddenBadge } from "./HiddenBadge"

type Props = {
  marker: MapMarker
  // Where the marker's tip is inside the map.
  point: { x: number; y: number }
  canManage: boolean
  onClose: () => void
  onRemove: () => void
}

const CARD_WIDTH = "17rem"
// Pin height plus a little air.
const PIN = 52

// The small preview that opens when a marker is clicked: who it is, what
// kind, and a way in. It sits above the marker, or below near the top edge.
export function MapMarkerCard({ marker, point, canManage, onClose, onRemove }: Props) {
  const { label, icon: KindIcon } = WORLD_KINDS[marker.kind]
  const below = point.y < 190

  return (
    <Card
      className="absolute z-[1000] w-[17rem] gap-3 py-3 shadow-lg"
      style={{
        left: `clamp(calc(${CARD_WIDTH} / 2 + 0.5rem), ${point.x}px, calc(100% - ${CARD_WIDTH} / 2 - 0.5rem))`,
        top: below ? point.y + 10 : point.y - PIN,
        transform: below ? "translateX(-50%)" : "translate(-50%, -100%)",
      }}
    >
      <CardContent className="flex items-center gap-3 px-3">
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
        <Button
          variant="ghost"
          size="icon-xs"
          className="text-muted-foreground self-start"
          aria-label="Close preview"
          onClick={onClose}
        >
          <X />
        </Button>
      </CardContent>
      <CardFooter className="gap-2 px-3">
        <Button asChild size="sm" className="flex-1">
          <Link to={`/app/world/${marker.entryId}`}>
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
  )
}
