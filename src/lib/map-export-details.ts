import type Konva from "konva"
import { createDetailSurface } from "./details/detail-surface"
import { renderScale } from "./map-scene"
import type { MapScene } from "./map-scene"

// The builder draws the details for the screen. The published picture is far
// larger, so they are drawn again for it, sharp at that size. Null if there are none.
export function exportDetails(scene: MapScene) {
  if (scene.details.size === 0) return null
  const surface = createDetailSurface(scene.canvas, renderScale(scene.canvas))
  surface.drawAll(scene.details)
  return surface.picture
}

// Puts that picture in place of the screen's for the instant of drawing. The
// returned function puts the screen's back.
export function sharpDetails(stage: Konva.Stage, picture: HTMLCanvasElement | null) {
  const node = stage.findOne<Konva.Shape>(".detail-paint")
  if (!node || !picture) return () => {}
  node.setAttr("picture", picture)
  return () => node.setAttr("picture", undefined)
}
