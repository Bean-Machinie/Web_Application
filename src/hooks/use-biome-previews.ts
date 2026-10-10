import { useEffect, useState } from "react"
import { brushPreviews } from "@/lib/biomes/brush-preview"
import type { BrushPreviews } from "@/lib/biomes/brush-preview"
import type { SceneBackground } from "@/lib/map-scene"
import { loadTiles } from "@/lib/terrain-tiles"

// The brush pictures for the sub tool list: null until the ground tiles are there,
// and drawn again only when the background changes.
export function useBiomePreviews(background: SceneBackground) {
  const [previews, setPreviews] = useState<BrushPreviews | null>(null)
  useEffect(() => {
    let current = true
    loadTiles()
      .then((tiles) => brushPreviews(tiles, background))
      .then(
      (made) => current && setPreviews(made),
      // The map's own loading reports a missing tile; here the rows just stay plain.
      () => {}
    )
    return () => {
      current = false
    }
  }, [background])
  return previews
}
