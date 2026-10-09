import type { BackTo } from "@/lib/back-link"
import type { MapMarker } from "@/lib/world-map-markers"
import { MapMarkerCardContent } from "./MapMarkerCardContent"

type Props = {
  marker: MapMarker
  canManage: boolean
  backTo: BackTo
  onOpen: () => void
  onClose: () => void
  onRemove: () => void
}

// On a phone the marker's card peeks up from the bottom of the map. It is not a sheet:
// nothing is dimmed, the map stays under the finger, and touching another marker
// changes what the card shows (it is not keyed, so it stays and does not reopen).
export function MapMarkerPeek({ marker, ...content }: Props) {
  return (
    <div className="animate-in slide-in-from-bottom-8 fade-in-0 pointer-events-none absolute inset-x-0 bottom-0 z-[1000] p-2 duration-200 ease-out motion-reduce:slide-in-from-bottom-0">
      <div className="pointer-events-auto">
        <MapMarkerCardContent marker={marker} {...content} className="rounded-xl" />
      </div>
    </div>
  )
}
