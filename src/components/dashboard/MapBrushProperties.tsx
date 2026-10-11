import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import type { Brush } from "@/hooks/use-brush"
import type { EraseTarget } from "@/lib/erase"
import { useShortcutText } from "@/hooks/use-shortcut-text"
import { BLEND_STRENGTH, BLEND_STRETCH, BRUSH_OPACITY } from "@/lib/biomes/biomes"
import { Shortcut } from "./Shortcut"
import { SliderField } from "./SliderField"

type Props = {
  blending: boolean
  // What the eraser is taking away, when it is the tool.
  erasing: EraseTarget | null
  brush: Brush
  showAssets: boolean
  onShowAssets: (show: boolean) => void
}

// What the brush (biomes or details), the eraser and the blend brush are set with. Only
// the brush and the eraser have an opacity, and the eraser of art has none, as it takes a
// piece whole; only the brush can hide the art; the blend brush has a strength and a stretch.
export function MapBrushProperties({ blending, erasing, brush, showAssets, onShowAssets }: Props) {
  const keyOf = useShortcutText()
  return (
    <>
      <SliderField
        label="Size"
        value={brush.size}
        min={brush.range.min}
        max={brush.range.max}
        step={1}
        unit="px"
        onChange={brush.onSize}
      />
      {blending ? (
        <>
          <SliderField
            label="Strength"
            value={brush.strength}
            min={BLEND_STRENGTH.min}
            max={BLEND_STRENGTH.max}
            step={0.01}
            scale={100}
            unit="%"
            onChange={brush.onStrength}
          />
          <SliderField
            label="Stretch"
            value={brush.stretch}
            min={BLEND_STRETCH.min}
            max={BLEND_STRETCH.max}
            step={0.01}
            scale={100}
            unit="%"
            onChange={brush.onStretch}
          />
        </>
      ) : (
        <>
          {erasing !== "assets" && (
            <SliderField
              label="Opacity"
              value={brush.opacity}
              min={BRUSH_OPACITY.min}
              max={BRUSH_OPACITY.max}
              step={0.01}
              scale={100}
              unit="%"
              onChange={brush.onOpacity}
            />
          )}
          {!erasing && (
            <div className="flex items-center justify-between">
              <Label htmlFor="show-assets" className="font-normal">
                Show assets
              </Label>
              <Switch id="show-assets" size="sm" checked={showAssets} onCheckedChange={onShowAssets} />
            </div>
          )}
        </>
      )}
      <p className="text-muted-foreground text-xs">
        Change the size<Shortcut>{keyOf("brush.smaller")} {keyOf("brush.larger")}</Shortcut>
      </p>
    </>
  )
}
