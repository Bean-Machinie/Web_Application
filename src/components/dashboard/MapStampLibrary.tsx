import { useState, useSyncExternalStore } from "react"
import { Check, FlipHorizontal2, FlipVertical2, MapPinned, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { StampPlacement } from "@/hooks/use-stamp-placement"
import { useShortcutText } from "@/hooks/use-shortcut-text"
import { getStamps, subscribeStamps } from "@/lib/stamps/stamp-file"
import type { Stamp } from "@/lib/stamps/stamps"
import { MapSaveStampDialog } from "./MapSaveStampDialog"
import { MapStampMenu } from "./MapStampMenu"
import type { StampSpot } from "./MapStampMenu"
import { MapStampThumb } from "./MapStampThumb"
import { Shortcut } from "./Shortcut"

type Props = {
  stampId: string
  onStamp: (id: string) => void
  placement: StampPlacement
}

const Group = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="grid gap-1.5">
    <h4 className="text-muted-foreground text-xs">{title}</h4>
    {children}
  </div>
)

// The stamps of the Shapes sub tool, in groups, and what can be done with the shape
// being placed. In development an island can be renamed or deleted from its right-click
// menu, and a landmass of the map kept as a new one.
export function MapStampLibrary({ stampId, onStamp, placement }: Props) {
  const keyOf = useShortcutText()
  const stamps = useSyncExternalStore(subscribeStamps, getStamps)
  const [spot, setSpot] = useState<StampSpot | null>(null)
  const { live, saving } = placement

  const grid = (group: Stamp["group"]) =>
    stamps
      .filter((stamp) => stamp.group === group)
      .map((stamp) => (
        <MapStampThumb
          key={stamp.id}
          stamp={stamp}
          active={stamp.id === stampId}
          onPick={() => onStamp(stamp.id)}
          onContextMenu={
            import.meta.env.DEV && group === "islands"
              ? (event) => {
                  event.preventDefault()
                  setSpot({ x: event.clientX, y: event.clientY, stamp })
                }
              : undefined
          }
        />
      ))
  const islands = grid("islands")

  return (
    <div className="grid gap-4">
      <Group title="Basic">
        <div className="grid grid-cols-4 gap-1">{grid("basic")}</div>
      </Group>
      <Group title="Islands">
        {islands.length > 0 ? (
          <div className="grid grid-cols-4 gap-1">{islands}</div>
        ) : (
          <p className="text-muted-foreground text-xs">No islands yet.</p>
        )}
      </Group>
      {live ? (
        <div className="grid gap-2 border-t pt-3">
          <div className="grid grid-cols-2 gap-1">
            <Button variant="outline" size="sm" onClick={() => placement.flip("x")}>
              <FlipVertical2 /> Flip
            </Button>
            <Button variant="outline" size="sm" onClick={() => placement.flip("y")}>
              <FlipHorizontal2 /> Flip
            </Button>
            <Button size="sm" onClick={placement.apply}>
              <Check /> Apply
            </Button>
            <Button variant="outline" size="sm" onClick={placement.cancel}>
              <X /> Cancel
            </Button>
          </div>
          <p className="text-muted-foreground text-xs">
            Apply<Shortcut>{keyOf("shape.apply")}</Shortcut> Cancel<Shortcut>{keyOf("shape.cancel")}</Shortcut>
          </p>
        </div>
      ) : (
        <p className="text-muted-foreground text-xs">
          Drag on the map to fit a shape to a box, or click to place it. Hold Shift to keep its proportions.
        </p>
      )}
      {import.meta.env.DEV && (
        <div className="grid gap-2 border-t pt-3">
          <Button variant={saving ? "secondary" : "outline"} size="sm" onClick={() => placement.setSaving(!saving)}>
            <MapPinned /> {saving ? "Click a landmass…" : "Save landmass as stamp"}
          </Button>
          <MapStampMenu spot={spot} onClose={() => setSpot(null)} />
          <MapSaveStampDialog picked={placement.picked} onClose={() => placement.setPicked(null)} />
        </div>
      )}
    </div>
  )
}
