import { useEffect, useState } from "react"
import { biomeSwatches } from "@/lib/biomes/brush-swatch"
import type { BrushSwatches } from "@/lib/biomes/brush-swatch"
import type { SceneBackground } from "@/lib/map-scene"
import { loadTiles } from "@/lib/terrain-tiles"

// The small ground pictures, null until the ground tiles are there.
export function useBiomeSwatches(background: SceneBackground) {
  const [swatches, setSwatches] = useState<BrushSwatches | null>(null)
  useEffect(() => {
    let current = true
    loadTiles().then(
      (tiles) => current && setSwatches(biomeSwatches(tiles, background)),
      // The map's own loading reports a missing tile; here the badge just stays away.
      () => {}
    )
    return () => {
      current = false
    }
  }, [background])
  return swatches
}
