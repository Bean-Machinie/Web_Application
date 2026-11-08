import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { mapToolImage } from "@/lib/tool-images"
import type { WorldEntry } from "@/lib/world-entries"
import { BentoTile } from "./BentoTile"
import { HomeCardBody } from "./HomeCardBody"
import { MapRouteEffect } from "./MapRouteEffect"
import { NewMapDialog } from "./NewMapDialog"

// The Map Maker tile: the Map Maker's picture, where a route draws over the land and a pin drops on
// hover, and the way to start a map.
export function MapMakerTile({ entries }: { entries: WorldEntry[] | null }) {
  const [open, setOpen] = useState(false)
  const image = useMemo(() => mapToolImage(entries), [entries])

  return (
    <BentoTile area="map" strongShade art={(hot) => <MapRouteEffect src={image ?? null} active={hot} />}>
      <HomeCardBody title="Map Maker" line="Paint world and region maps." actions={<Button onClick={() => setOpen(true)}>Open Map Maker</Button>} />
      <NewMapDialog open={open} onClose={() => setOpen(false)} />
    </BentoTile>
  )
}
