import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ratioText } from "@/lib/map-canvas-size"
import { CANVAS_PRESETS } from "@/lib/map-scene"
import type { CanvasPreset } from "@/lib/map-scene"

type Props = {
  value: CanvasPreset | "custom"
  onPick: (preset: CanvasPreset) => void
}

const presets = Object.keys(CANVAS_PRESETS) as CanvasPreset[]

// The sizes worth starting from. "Custom" is only what shows when the size typed is none
// of them; choosing it changes nothing.
export function MapPresetSelect({ value, onPick }: Props) {
  return (
    <div className="grid gap-2">
      <Label htmlFor="new-map-preset">Preset</Label>
      <Select value={value} onValueChange={(next) => next !== "custom" && onPick(next as CanvasPreset)}>
        <SelectTrigger id="new-map-preset" className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {presets.map((preset) => {
            const { label, width, height } = CANVAS_PRESETS[preset]
            return (
              <SelectItem key={preset} value={preset}>
                {label}
                <span className="text-muted-foreground ml-1.5 text-xs">
                  {width} × {height} · {ratioText(width, height)}
                </span>
              </SelectItem>
            )
          })}
          <SelectItem value="custom">Custom</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
