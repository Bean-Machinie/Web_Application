import { useMemo } from "react"
import type { MapScene } from "@/lib/map-scene"
import { createSurface } from "@/lib/biomes/surface"
import { editorScale } from "@/lib/terrain"
import type { Terrain } from "@/lib/terrain"

// The picture the biomes are drawn on, made again when the canvas, what it sits
// on, or the painted ground of the biomes changes. The land's edge cuts it sharp
// at any zoom.
export function useBiomeSurface({ width, height, background }: MapScene["canvas"], terrain: Terrain) {
  return useMemo(
    () => createSurface({ width, height }, background, editorScale({ width, height }), terrain.biomes),
    [width, height, background, terrain.biomes]
  )
}
