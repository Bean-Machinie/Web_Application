import { useState, useSyncExternalStore } from "react"
import { getStamps, subscribeStamps } from "@/lib/stamps/stamp-file"
import type { Stamp } from "@/lib/stamps/stamps"
import { MapStampMenu } from "./MapStampMenu"
import type { StampSpot } from "./MapStampMenu"
import { MapStampThumb } from "./MapStampThumb"
import { MapSubToolButton } from "./MapSubToolButton"

type Props = { stampId: string; onStamp: (id: string) => void }

const Heading = ({ children }: { children: string }) => (
  <h4 className="text-muted-foreground px-1 pt-1 text-xs">{children}</h4>
)

// The shapes of the library, a row each, with their outline and their whole name, under
// the heads Basic and Islands. In development an island can be renamed or deleted from
// its right-click menu.
export function MapShapeSubTools({ stampId, onStamp }: Props) {
  const stamps = useSyncExternalStore(subscribeStamps, getStamps)
  const [spot, setSpot] = useState<StampSpot | null>(null)

  const rows = (group: Stamp["group"]) =>
    stamps
      .filter((stamp) => stamp.group === group)
      .map((stamp) => (
        <MapSubToolButton
          key={stamp.id}
          tall
          label={stamp.name}
          hint={`Stamp a ${stamp.name.toLowerCase()}`}
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
  const islands = rows("islands")

  return (
    <>
      <Heading>Basic</Heading>
      {rows("basic")}
      <Heading>Islands</Heading>
      {islands.length > 0 ? islands : <p className="text-muted-foreground px-1 pb-1 text-xs">No islands yet.</p>}
      {import.meta.env.DEV && <MapStampMenu spot={spot} onClose={() => setSpot(null)} />}
    </>
  )
}
