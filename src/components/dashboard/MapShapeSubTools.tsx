import { useState, useSyncExternalStore } from "react"
import { getStamps, subscribeStamps } from "@/lib/stamps/stamp-file"
import type { Stamp } from "@/lib/stamps/stamps"
import { MapStampMenu } from "./MapStampMenu"
import type { StampSpot } from "./MapStampMenu"
import { MapStampThumb } from "./MapStampThumb"
import { MapSubToolButton } from "./MapSubToolButton"

type Props = {
  // Which of the library's stamps are listed: the basic shapes, or the islands.
  group: Stamp["group"]
  stampId: string
  onStamp: (id: string) => void
}

// The stamps of one group of the library, a row each, with their outline and their whole
// name. In development an island can be renamed or deleted from its right-click menu.
export function MapShapeSubTools({ group, stampId, onStamp }: Props) {
  const stamps = useSyncExternalStore(subscribeStamps, getStamps)
  const [spot, setSpot] = useState<StampSpot | null>(null)

  const rows = stamps
    .filter((stamp) => stamp.group === group)
    .map((stamp) => (
      <MapSubToolButton
        key={stamp.id}
        tall
        label={stamp.name}
        hint={`Stamp ${group === "islands" ? "the island" : "a"} ${stamp.name.toLowerCase()}`}
        active={stamp.id === stampId}
        onClick={() => onStamp(stamp.id)}
        onContextMenu={
          import.meta.env.DEV && group === "islands"
            ? (event) => {
                event.preventDefault()
                setSpot({ x: event.clientX, y: event.clientY, stamp })
              }
            : undefined
        }
      >
        <MapStampThumb stamp={stamp} />
      </MapSubToolButton>
    ))

  return (
    <>
      {rows.length > 0 ? rows : <p className="text-muted-foreground px-1 pb-1 text-xs">No islands yet.</p>}
      {import.meta.env.DEV && group === "islands" && <MapStampMenu spot={spot} onClose={() => setSpot(null)} />}
    </>
  )
}
