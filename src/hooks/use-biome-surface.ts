import { useMemo } from "react"
import type { MapScene } from "@/lib/map-scene"
import { createSurface } from "@/lib/biomes/surface"

// The editor draws the paint on a picture of at most this many pixels, so a big
// canvas does not cost much memory. The land's edge cuts it sharp at any zoom.
const MAX_PIXELS = 5_000_000

// The picture the biomes are drawn on, made again when the canvas or what it
// sits on changes (the textures follow the colours).
export function useBiomeSurface({ width, height, background }: MapScene["canvas"]) {
  return useMemo(
    () =>
      createSurface({ width, height }, background, Math.min(1, Math.sqrt(MAX_PIXELS / (width * height)))),
    [width, height, background]
  )
}
