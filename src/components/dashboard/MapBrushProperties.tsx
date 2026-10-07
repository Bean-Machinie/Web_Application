import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import type { Brush } from "@/hooks/use-brush"
import { useShortcutText } from "@/hooks/use-shortcut-text"
import { BLEND_STRENGTH, BLEND_STRETCH, BRUSH_OPACITY, BRUSH_SIZE } from "@/lib/biomes/biomes"
import { Shortcut } from "./Shortcut"
import { SliderField } from "./SliderField"

type Props = {
  blending: boolean
  brush: Brush
  showAssets: boolean
  onShowAssets: (show: boolean) => void
}

// What the biome brush and the blend brush are set with. Only the biome brush
// has an opacity and can hide the art; the blend brush has a strength and a stretch.
export function MapBrushProperties({ blending, brush, showAssets, onShowAssets }: Props) {
  const keyOf = useShortcutText()
  return (
    <>
      <SliderField
        label="Size"
        value={brush.size}
        min={BRUSH_SIZE.min}
        max={BRUSH_SIZE.max}
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
          <div className="flex items-center justify-between">
            <Label htmlFor="show-assets" className="font-normal">
              Show assets
            </Label>
            <Switch id="show-assets" size="sm" checked={showAssets} onCheckedChange={onShowAssets} />
          </div>
        </>
      )}
      <p className="text-muted-foreground text-xs">
        Change the size<Shortcut>{keyOf("brush.smaller")} {keyOf("brush.larger")}</Shortcut>
      </p>
    </>
  )
}
