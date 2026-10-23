import { ArrowLeftRight, Link2, Unlink2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Toggle } from "@/components/ui/toggle"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import type { useMapSize } from "@/hooks/use-map-size"
import { MapPresetSelect } from "./MapPresetSelect"
import { MapSizeInput } from "./MapSizeInput"

export const LABEL = "text-muted-foreground text-xs font-medium"

// The preset, then the width and height in pixels with the lock between them and the swap
// after, all on one row; below, what is wrong, if anything.
export function MapCanvasFields({ size }: { size: ReturnType<typeof useMapSize> }) {
  return (
    <>
      <div className="grid gap-2">
        <Label className={LABEL}>Preset</Label>
        <MapPresetSelect value={size.preset} portrait={size.portrait} onPick={size.pick} />
      </div>
      <div className="grid gap-2">
        <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)_auto] gap-x-2 gap-y-2">
          <Label htmlFor="new-map-width" className={LABEL}>
            Width
          </Label>
          <span />
          <Label htmlFor="new-map-height" className={LABEL}>
            Height
          </Label>
          <span />
          <MapSizeInput id="new-map-width" value={size.width} onChange={size.editWidth} invalid={size.widthInvalid} />
          <Tooltip>
            <TooltipTrigger asChild>
              <Toggle
                variant="outline"
                pressed={size.locked}
                onPressedChange={size.setLocked}
                aria-label="Lock the aspect ratio"
                className="size-9 px-0"
              >
                {size.locked ? <Link2 /> : <Unlink2 />}
              </Toggle>
            </TooltipTrigger>
            <TooltipContent>{size.locked ? "Aspect ratio locked" : "Lock the aspect ratio"}</TooltipContent>
          </Tooltip>
          <MapSizeInput id="new-map-height" value={size.height} onChange={size.editHeight} invalid={size.heightInvalid} />
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="size-9"
                aria-label="Swap width and height"
                onClick={size.swap}
              >
                <ArrowLeftRight />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Swap width and height</TooltipContent>
          </Tooltip>
        </div>
        {size.problem && <p className="text-destructive text-xs">{size.problem}</p>}
      </div>
    </>
  )
}
