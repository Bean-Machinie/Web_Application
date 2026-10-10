import { useBiomeSwatches } from "@/hooks/use-biome-swatches"
import type { BrushBiome } from "@/lib/biomes/biomes"
import type { SceneBackground } from "@/lib/map-scene"

// A small outlined circle of the ground of the biome the brush paints, at the
// bottom right corner of the brush's button in the tool strip, standing a little out
// of it.
export function MapBrushBadge({ biome, background }: { biome: BrushBiome; background: SceneBackground }) {
  const swatches = useBiomeSwatches(background)
  if (!swatches) return null
  return (
    <img
      src={swatches[biome]}
      alt=""
      draggable={false}
      className="border-foreground/70 pointer-events-none absolute -right-1 -bottom-1 size-3.5 rounded-full border"
    />
  )
}
