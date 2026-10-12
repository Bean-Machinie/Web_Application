import type Konva from "konva"
import type { MultiPolygon } from "polygon-clipping"
import { createDetailSurface } from "./details/detail-surface"
import { renderScale } from "./map-scene"
import type { MapScene } from "./map-scene"
import type { Terrain } from "./terrain"

export type DetailPictures = { details: HTMLCanvasElement; river: HTMLCanvasElement }

// The builder draws the details for the screen. The published picture is far
// larger, so they are drawn again for it, sharp at that size, from the larger ground of the
// sea and the land as it is shown ("land", rounded). Null if there are none.
export function exportDetails(scene: MapScene, terrain: Terrain, land: MultiPolygon): DetailPictures | null {
  if (scene.details.size === 0) return null
  const surface = createDetailSurface(scene.canvas, renderScale(scene.canvas), terrain.sea)
  surface.setLand(land)
  surface.drawAll(scene.details)
  return { details: surface.picture, river: surface.river }
}

// Puts those pictures in place of the screen's for the instant of drawing. The
// returned function puts the screen's back.
export function sharpDetails(stage: Konva.Stage, pictures: DetailPictures | null) {
  if (!pictures) return () => {}
  const nodes = [
    [stage.findOne<Konva.Shape>(".detail-paint"), pictures.details],
    [stage.findOne<Konva.Shape>(".river-paint"), pictures.river],
  ] as const
  for (const [node, picture] of nodes) node?.setAttr("picture", picture)
  return () => nodes.forEach(([node]) => node?.setAttr("picture", undefined))
}
