import { Settings2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { BACKGROUNDS, CANVAS_PRESETS } from "@/lib/map-scene"
import type { MapScene, SceneBackground } from "@/lib/map-scene"

type Props = {
  canvas: MapScene["canvas"]
  disabled: boolean
  onBackground: (background: SceneBackground) => void
}

// The canvas's facts and its background, kept out of the way until wanted.
export function MapSettingsPopover({ canvas, disabled, onBackground }: Props) {
  return (
    <Popover>
      <Tooltip>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Map settings" disabled={disabled}>
              <Settings2 />
            </Button>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent>Map settings</TooltipContent>
      </Tooltip>
      <PopoverContent align="start" className="w-72">
        <div className="grid gap-4">
          <div className="grid gap-1">
            <h2 className="text-sm font-medium">Canvas</h2>
            <p className="text-muted-foreground text-[13px] leading-snug">
              {CANVAS_PRESETS[canvas.preset].label}, {canvas.width} × {canvas.height} px. The size
              is fixed, so pins stay put when the map is published again.
            </p>
          </div>
          <div className="grid gap-2">
            <h2 className="text-sm font-medium">Background</h2>
            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(BACKGROUNDS) as SceneBackground[]).map((background) => (
                <Button
                  key={background}
                  variant={canvas.background === background ? "secondary" : "outline"}
                  aria-pressed={canvas.background === background}
                  onClick={() => onBackground(background)}
                >
                  {BACKGROUNDS[background].label}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
