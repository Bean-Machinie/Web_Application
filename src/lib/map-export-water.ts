import type Konva from "konva"
import { smoothLand } from "./map-coast-smooth"
import { renderScale } from "./map-scene"
import type { MapScene } from "./map-scene"
import { buildField } from "./map-water-field"
import { renderWater } from "./map-water-render"

// The builder draws the water for the screen. The published picture is far
// larger, so the water is drawn again for it, sharp at that size, and put in
// place of the screen's. The returned function puts the screen's back.
export function sharpWater(stage: Konva.Stage, scene: MapScene) {
  const node = stage.findOne<Konva.Image>(".water")
  if (!node || scene.land.length === 0) return () => {}

  const { canvas, style } = scene
  const land = smoothLand(scene.land, style.roundness, canvas)
  const image = renderWater(buildField(land, canvas), style, canvas.background, canvas.seed, canvas, {
    x: 0,
    y: 0,
    width: canvas.width,
    height: canvas.height,
    scale: renderScale(canvas),
  })

  const before = { image: node.image(), x: node.x(), y: node.y(), width: node.width(), height: node.height() }
  node.setAttrs({ image, x: 0, y: 0, width: canvas.width, height: canvas.height })
  return () => node.setAttrs(before)
}
