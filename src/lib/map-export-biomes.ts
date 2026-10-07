import type Konva from "konva"
import { createSurface } from "./biomes/surface"
import { renderScale } from "./map-scene"
import type { MapScene } from "./map-scene"

// The builder draws the biomes for the screen. The published picture is far
// larger, so they are drawn again for it, sharp at that size, and put in place
// of the screen's. The returned function puts the screen's back.
export function sharpBiomes(stage: Konva.Stage, scene: MapScene) {
  const node = stage.findOne<Konva.Shape>(".biome-paint")
  if (!node || scene.paint.size === 0) return () => {}

  const { canvas } = scene
  const surface = createSurface(canvas, canvas.background, renderScale(canvas))
  surface.drawAll(scene.paint)
  node.setAttr("picture", surface.picture)
  return () => node.setAttr("picture", undefined)
}
