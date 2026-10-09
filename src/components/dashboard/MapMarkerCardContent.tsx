import { Link } from "react-router-dom"
import { ArrowRight, Trash2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { useEntryPreview } from "@/hooks/use-entry-preview"
import type { BackTo } from "@/lib/back-link"
import { cn } from "@/lib/utils"
import { WORLD_KINDS } from "@/lib/world-kinds"
import type { MapMarker } from "@/lib/world-map-markers"
import { HiddenBadge } from "./HiddenBadge"
import { KindLabel } from "./KindLabel"
import { MapMarkerFacts } from "./MapMarkerFacts"

type Props = {
  marker: MapMarker
  canManage: boolean
  // The map to lead back to from the entry.
  backTo: BackTo
  // The entry is being opened, so the map can point the marker out on return.
  onOpen: () => void
  onClose: () => void
  onRemove: () => void
  className?: string
}

// The card of a marker: name, kind, a few key facts and the first line of the
// description, with the way to open the entry. Where it sits is up to whoever
// shows it (above its pin, or along the bottom of a phone).
export function MapMarkerCardContent({ marker, canManage, backTo, onOpen, onClose, onRemove, className }: Props) {
  const { icon: KindIcon, tint } = WORLD_KINDS[marker.kind]
  const fields = useEntryPreview(marker.entryId)

  return (
    <Card className={cn("gap-2.5 py-3 shadow-lg", className)}>
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
            className="text-muted-foreground pointer-coarse:size-11 self-start"
            aria-label="Close preview"
            onClick={onClose}
          >
            <X />
          </Button>
        </div>
        <MapMarkerFacts kind={marker.kind} fields={fields} canManage={canManage} />
      </CardContent>
      <CardFooter className="gap-2 px-3">
        <Button asChild size="sm" className="pointer-coarse:h-11 flex-1">
          <Link to={`/app/world/${marker.entryId}`} state={{ backTo }} onClick={onOpen}>
            Open entry
            <ArrowRight />
          </Link>
        </Button>
        {canManage && (
          <Button
            variant="outline"
            size="icon-sm"
            className="text-muted-foreground hover:text-destructive pointer-coarse:size-11"
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
