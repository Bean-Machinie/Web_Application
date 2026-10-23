import { ArrowLeftRight, Link2, Unlink2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Toggle } from "@/components/ui/toggle"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { MapSizeInput } from "./MapSizeInput"

type Props = {
  width: string
  height: string
  invalid: boolean
  locked: boolean
  onWidth: (value: string) => void
  onHeight: (value: string) => void
  onLock: (locked: boolean) => void
  onSwap: () => void
}

// Width and height in pixels, with the lock that keeps their ratio between them and the
// button that turns the canvas on its side. The labels are above, so the buttons are
// level with the inputs.
export function MapSizeFields({ width, height, invalid, locked, onWidth, onHeight, onLock, onSwap }: Props) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)_auto] items-end gap-2">
      <MapSizeInput id="new-map-width" label="Width" value={width} onChange={onWidth} invalid={invalid} />
      <Tooltip>
        <TooltipTrigger asChild>
          <Toggle
            variant="outline"
            pressed={locked}
            onPressedChange={onLock}
            aria-label="Keep the ratio"
            className="size-8 px-0"
          >
            {locked ? <Link2 /> : <Unlink2 />}
          </Toggle>
        </TooltipTrigger>
        <TooltipContent>{locked ? "Ratio locked" : "Lock the ratio"}</TooltipContent>
      </Tooltip>
      <MapSizeInput id="new-map-height" label="Height" value={height} onChange={onHeight} invalid={invalid} />
      <Tooltip>
        <TooltipTrigger asChild>
          <Button type="button" variant="outline" size="icon" aria-label="Swap width and height" onClick={onSwap}>
            <ArrowLeftRight />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Swap width and height</TooltipContent>
      </Tooltip>
    </div>
  )
}
