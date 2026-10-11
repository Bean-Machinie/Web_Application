import type { Brush } from "@/hooks/use-brush"
import { MapSizePresets } from "./MapSizePresets"
import { SliderField } from "./SliderField"

// The size of the brush, the same for every tool that has one: the slider with its
// number, and presets under it. Its range is the one of what the brush is working on.
export function MapBrushSize({ brush }: { brush: Brush }) {
  const { min, max } = brush.range
  return (
    <div className="grid gap-3">
      <SliderField label="Size" value={brush.size} min={min} max={max} step={1} unit="px" onChange={brush.onSize} />
      <MapSizePresets size={brush.size} min={min} max={max} onPick={brush.onSize} />
    </div>
  )
}
