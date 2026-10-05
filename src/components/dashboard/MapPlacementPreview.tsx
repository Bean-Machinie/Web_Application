import { Layers } from "lucide-react"
import { WORLD_KINDS } from "@/lib/world-kinds"
import type { WorldEntryKind } from "@/lib/world-kinds"
import type { Placement } from "@/lib/world-map-markers"
import { MapPin } from "./MapPin"

// How much of the map's width the preview shows.
const SHOWN = 0.3

export type PlacedEntry = {
  kind: WorldEntryKind
  name: string
  revealed: boolean
  imageUrl: string | null
}

type Props = { placement: Placement; entry: PlacedEntry }

// A still square crop of the map with the entry's own pin standing on the
// marker's spot, in the middle. The map is only the image, moved and enlarged,
// so none has to be started to draw it. The pin reacts to the card's hover (the
// card is its "group/pin").
export function MapPlacementPreview({ placement, entry }: Props) {
  const { image, x, y } = placement
  const kind = WORLD_KINDS[entry.kind]

  return (
    <div className="bg-muted text-muted-foreground relative aspect-square overflow-hidden">
      {image ? (
        <>
          <img
            src={image.url}
            alt=""
            loading="lazy"
            draggable={false}
            style={{ width: `${100 / SHOWN}%`, transform: `translate(-${x}%, -${y}%)` }}
            className="absolute top-1/2 left-1/2 max-w-none"
          />
          {/* The pin's tip is the middle, where the marker's spot is. */}
          <div className="absolute top-1/2 left-1/2 h-[46px] w-10 -translate-x-1/2 -translate-y-full">
            <MapPin
              imageUrl={entry.imageUrl}
              Icon={entry.kind === "map" ? Layers : kind.icon}
              tint={kind.tint}
              name={entry.name}
              isMap={entry.kind === "map"}
              revealed={entry.revealed}
              pop={false}
              editing={false}
            />
          </div>
        </>
      ) : (
        <Layers className="absolute top-1/2 left-1/2 size-10 -translate-1/2" />
      )}
    </div>
  )
}
