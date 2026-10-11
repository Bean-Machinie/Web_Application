import { useSyncExternalStore } from "react"
import { MapPinned } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import type { StampPlacement } from "@/hooks/use-stamp-placement"
import type { LandMode, LandTool } from "@/lib/map-builder-tools"
import { getStamps, subscribeStamps } from "@/lib/stamps/stamp-file"
import { CORNER_ROUNDING } from "@/lib/stamps/stamp-corners"
import { MapLandModeToggle } from "./MapLandModeToggle"
import { MapSaveStampDialog } from "./MapSaveStampDialog"
import { SliderField } from "./SliderField"

type Props = {
  landTool: LandTool
  cutting: boolean
  onMode: (mode: LandMode) => void
  placement: StampPlacement
  // The stamp that is picked, whose corners can be rounded if it has any.
  stampId: string
}

// What the Land tool is set with, for both its tabs: whether it adds or cuts, and what
// to do. In development, a button to keep a landmass of the map as a stamp.
export function MapLandProperties({ landTool, cutting, onMode, placement, stampId }: Props) {
  const { saving, rounding, setRounding } = placement
  const stamp = useSyncExternalStore(subscribeStamps, getStamps).find(({ id }) => id === stampId)

  return (
    <>
      <MapLandModeToggle cutting={cutting} onMode={onMode} />
      {landTool !== "lasso" && stamp?.corners && (
        <div className="grid gap-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="round-corners" className="font-normal">
              Round corners
            </Label>
            <Switch
              id="round-corners"
              size="sm"
              checked={rounding.on}
              onCheckedChange={(on) => setRounding({ ...rounding, on })}
            />
          </div>
          <div className={rounding.on ? "" : "pointer-events-none opacity-50"} aria-disabled={!rounding.on}>
            <SliderField
              label="Radius"
              value={rounding.amount}
              min={CORNER_ROUNDING.min}
              max={CORNER_ROUNDING.max}
              step={CORNER_ROUNDING.step}
              scale={100}
              unit="%"
              onChange={(amount) => setRounding({ ...rounding, amount })}
            />
          </div>
        </div>
      )}
      {import.meta.env.DEV && landTool === "islands" && (
        <>
          {saving ? (
            <>
              <p className="text-muted-foreground text-xs">Click landmasses to pick them.</p>
              <div className="grid grid-cols-[1fr_auto] gap-1">
                <Button size="sm" disabled={!placement.candidate} onClick={() => placement.setPicked(placement.candidate)}>
                  <MapPinned /> Save {placement.selection.length > 0 ? placement.selection.length : ""} as stamp
                </Button>
                <Button variant="outline" size="sm" onClick={placement.endPick}>
                  Cancel
                </Button>
              </div>
            </>
          ) : (
            <Button variant="outline" size="sm" onClick={() => placement.setSaving(true)}>
              <MapPinned /> Save landmasses as stamp
            </Button>
          )}
          <MapSaveStampDialog
            picked={placement.picked}
            onClose={() => placement.setPicked(null)}
            onSaved={placement.endPick}
          />
        </>
      )}
    </>
  )
}
