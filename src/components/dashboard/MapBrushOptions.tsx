import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import type { Brush } from "@/hooks/use-brush"
import { BIOMES, BRUSH_SIZE } from "@/lib/biomes/biomes"
import type { BrushBiome } from "@/lib/biomes/biomes"
import { biomeColours, css, hexToRgb } from "@/lib/biomes/palette"
import { LAND_COLOURS } from "@/lib/map-land-colours"
import type { SceneBackground } from "@/lib/map-scene"
import { Shortcut } from "./Shortcut"

const CHOICES: { id: BrushBiome; label: string }[] = [
  { id: "plains", label: "Plains" },
  ...BIOMES.map((id) => ({ id, label: id[0].toUpperCase() + id.slice(1) })),
]

type Props = { brush: Brush; background: SceneBackground }

// What the brush paints, as a swatch for each biome (plains clears them), and
// how big it is.
export function MapBrushOptions({ brush, background }: Props) {
  const swatch = (id: BrushBiome) =>
    css(id === "plains" ? hexToRgb(LAND_COLOURS[background].fill) : biomeColours(id, background).fill)

  return (
    <>
      {CHOICES.map(({ id, label }) => (
        <Tooltip key={id}>
          <TooltipTrigger asChild>
            <Button
              variant={brush.biome === id ? "secondary" : "ghost"}
              size="sm"
              aria-pressed={brush.biome === id}
              onClick={() => brush.onBiome(id)}
            >
              <span className="size-3 rounded-full border border-black/30" style={{ background: swatch(id) }} />
              {label}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {id === "plains" ? "Paint plains to clear any biome" : `Paint ${label.toLowerCase()}`}
          </TooltipContent>
        </Tooltip>
      ))}
      <span className="text-muted-foreground ml-3 text-xs">Size</span>
      <Slider
        className="w-40"
        aria-label="Brush size"
        min={BRUSH_SIZE.min}
        max={BRUSH_SIZE.max}
        step={1}
        value={[brush.size]}
        onValueChange={([size]) => brush.onSize(size)}
      />
      <span className="text-muted-foreground w-12 text-xs tabular-nums">{brush.size} px</span>
      <span className="text-muted-foreground ml-2 text-xs">
        <Shortcut>[ ]</Shortcut> change size
      </span>
    </>
  )
}
