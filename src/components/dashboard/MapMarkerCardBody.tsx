import { Link } from "react-router-dom"
import { ArrowRight, Trash2, X } from "lucide-react"
import { motion } from "motion/react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CardContent, CardFooter } from "@/components/ui/card"
import { useEntryPreview } from "@/hooks/use-entry-preview"
import type { BackTo } from "@/lib/back-link"
import { WORLD_KINDS } from "@/lib/world-kinds"
import type { MapMarker } from "@/lib/world-map-markers"
import { HiddenBadge } from "./HiddenBadge"
import { MapMarkerFacts } from "./MapMarkerFacts"

type Props = {
  marker: MapMarker
  canManage: boolean
  backTo: BackTo
  // True once the marker is clicked: the card then has its buttons.
  pinned: boolean
  // False while the card is the round pin: the text is not there yet.
  shown: boolean
  onClose: () => void
  onRemove: () => void
}

// What the card says: name, kind, a few key facts and the first line of the
// description. It fades in once the shape has mostly settled and out before it
// folds. The portrait is not here; MapMarkerCard places it over the empty slot.
export function MapMarkerCardBody({ marker, canManage, backTo, pinned, shown, onClose, onRemove }: Props) {
  const { label } = WORLD_KINDS[marker.kind]
  const fields = useEntryPreview(marker.entryId)

  return (
    <motion.div
      initial={false}
      animate={{ opacity: shown ? 1 : 0 }}
      transition={{ duration: shown ? 0.16 : 0.08, delay: shown ? 0.13 : 0 }}
      className="flex w-72 flex-col gap-2.5 py-3 has-data-[slot=card-footer]:pb-0"
    >
      <CardContent className="flex flex-col gap-2.5 px-3">
        <div className="flex items-center gap-3">
          <div className="size-12 shrink-0" />
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
    </motion.div>
  )
}
