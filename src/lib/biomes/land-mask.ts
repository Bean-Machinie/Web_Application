import type { MultiPolygon } from "polygon-clipping"
import { PAINT_CELL } from "./biomes"
import { gridSize } from "./paint-tiles"

// A 1 for every cell of a paint grid, of the biomes' cell size unless one is given,
// that any land touches, or lies within "margin" canvas pixels of it. The land is drawn on a
// canvas of one pixel to the cell, and a cell counts if any of it is covered, so paint reaches
// right up to the coast. The coast itself is cut sharp when the paint is drawn.
export function landMask(land: MultiPolygon, canvas: { width: number; height: number }, cell = PAINT_CELL, margin = 0) {
  const { cols, rows } = gridSize(canvas, cell)
  const surface = document.createElement("canvas")
  surface.width = cols
  surface.height = rows
  const context = surface.getContext("2d", { willReadFrequently: true })!
  context.scale(1 / cell, 1 / cell)
  context.beginPath()
  for (const polygon of land) {
    for (const ring of polygon) {
      ring.forEach(([x, y], index) => (index === 0 ? context.moveTo(x, y) : context.lineTo(x, y)))
      context.closePath()
    }
  }
  context.fillStyle = "#fff"
  context.fill("evenodd")
  if (margin > 0) {
    // The edge stroked as wide as twice the margin takes in what is within it of the land.
    context.strokeStyle = "#fff"
    context.lineWidth = margin * 2
    context.lineJoin = "round"
    context.stroke()
  }
  const pixels = context.getImageData(0, 0, cols, rows).data
  const mask = new Uint8Array(cols * rows)
  for (let i = 0; i < mask.length; i++) mask[i] = pixels[i * 4 + 3] > 0 ? 1 : 0
  return mask
}
