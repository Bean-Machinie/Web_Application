import type { MultiPolygon } from "polygon-clipping"
import { PAINT_CELL } from "./biomes"
import { gridSize } from "./paint-tiles"

// A 1 for every cell of the paint grid that any land touches. The land is
// drawn on a canvas of one pixel to the cell, and a cell counts if any of it is
// covered, so paint reaches right up to the coast. The coast itself is cut
// sharp when the paint is drawn.
export function landMask(land: MultiPolygon, canvas: { width: number; height: number }) {
  const { cols, rows } = gridSize(canvas)
  const surface = document.createElement("canvas")
  surface.width = cols
  surface.height = rows
  const context = surface.getContext("2d", { willReadFrequently: true })!
  context.scale(1 / PAINT_CELL, 1 / PAINT_CELL)
  context.beginPath()
  for (const polygon of land) {
    for (const ring of polygon) {
      ring.forEach(([x, y], index) => (index === 0 ? context.moveTo(x, y) : context.lineTo(x, y)))
      context.closePath()
    }
  }
  context.fillStyle = "#fff"
  context.fill("evenodd")
  const pixels = context.getImageData(0, 0, cols, rows).data
  const mask = new Uint8Array(cols * rows)
  for (let i = 0; i < mask.length; i++) mask[i] = pixels[i * 4 + 3] > 0 ? 1 : 0
  return mask
}
