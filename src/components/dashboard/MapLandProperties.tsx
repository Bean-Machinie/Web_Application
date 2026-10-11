import { MapPinned } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useShortcutText } from "@/hooks/use-shortcut-text"
import type { StampPlacement } from "@/hooks/use-stamp-placement"
import type { LandMode, LandTool } from "@/lib/map-builder-tools"
import { MapLandModeToggle } from "./MapLandModeToggle"
import { MapSaveStampDialog } from "./MapSaveStampDialog"
import { Shortcut } from "./Shortcut"

type Props = {
  landTool: LandTool
  cutting: boolean
  onMode: (mode: LandMode) => void
  placement: StampPlacement
}

// What the Land tool is set with, for both its tabs: whether it adds or cuts, and what
// to do. In development, a button to keep a landmass of the map as a stamp.
export function MapLandProperties({ landTool, cutting, onMode, placement }: Props) {
  const keyOf = useShortcutText()
  const { saving } = placement

  return (
    <>
      <MapLandModeToggle cutting={cutting} onMode={onMode} />
      <div className="text-muted-foreground grid gap-1.5 text-xs">
        <p>Tap Alt to switch between adding and cutting.</p>
        {landTool !== "lasso" && (
          <>
            <p>
              Drag on the map to fit a shape to a box, or click to place it. Its proportions are kept: hold Shift to
              stretch it freely.
            </p>
            <p>
              Apply<Shortcut>{keyOf("shape.apply")}</Shortcut> Cancel<Shortcut>{keyOf("shape.cancel")}</Shortcut> Flip
              <Shortcut>
                {keyOf("edit.flipH")} {keyOf("edit.flipV")}
              </Shortcut>
            </p>
          </>
        )}
      </div>
      {import.meta.env.DEV && landTool === "islands" && (
        <>
          <Button variant={saving ? "secondary" : "outline"} size="sm" onClick={() => placement.setSaving(!saving)}>
            <MapPinned /> {saving ? "Click a landmass…" : "Save landmass as stamp"}
          </Button>
          <MapSaveStampDialog picked={placement.picked} onClose={() => placement.setPicked(null)} />
        </>
      )}
    </>
  )
}
