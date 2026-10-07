import type Konva from "konva"
import { createSurface } from "./biomes/surface"
import { renderScale } from "./map-scene"
import type { MapScene } from "./map-scene"
import type { Terrain } from "./terrain"

// The builder draws the biomes for the screen. The published picture is far
// larger, so they are drawn again for it, sharp at that size. Null if nothing
// is painted.
export function exportBiomes(scene: MapScene, terrain: Terrain) {
  if (scene.paint.size === 0) return null
  const { canvas } = scene
  const surface = createSurface(canvas, canvas.background, renderScale(canvas), terrain.biomes)
  surface.drawAll(scene.paint)
  return surface.picture
}

// Puts that picture in place of the screen's for the instant of drawing. The
// returned function puts the screen's back.
export function sharpBiomes(stage: Konva.Stage, picture: HTMLCanvasElement | null) {
  const node = stage.findOne<Konva.Shape>(".biome-paint")
  if (!node || !picture) return () => {}
  node.setAttr("picture", picture)
  return () => node.setAttr("picture", undefined)
}
