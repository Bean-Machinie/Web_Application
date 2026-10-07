import { PAINT_CELL } from "./biomes"
import { smooth } from "../map-noise"

// The stamp is full strength out to this share of the radius, then fades to
// nothing exactly at the radius, where the size ring is drawn.
const CORE = 0.5
// Stamps are placed this share of the diameter apart along the path.
export const SPACING = 0.1
// Cells are measured by averaging this many samples across, when the brush is
// small enough for a cell to matter; larger brushes look at the cell's centre.
const SAMPLES = 3
// A brush whose radius is under this many cells is measured that way.
export const FINE_BRUSH = 24

const falloff = (share: number) =>
  share <= CORE ? 1 : share >= 1 ? 0 : 1 - smooth((share - CORE) / (1 - CORE))

// How much of the stamp at (x, y) falls on a cell: the stamp's strength at
// its centre, or for a small brush the average over the cell, so that the
// footprint is as true as the cells allow.
export function coverage(cx: number, cy: number, x: number, y: number, radius: number, fine: boolean) {
  const left = cx * PAINT_CELL
  const top = cy * PAINT_CELL
  if (!fine) return falloff(Math.hypot(left + PAINT_CELL / 2 - x, top + PAINT_CELL / 2 - y) / radius)
  let sum = 0
  for (let j = 0; j < SAMPLES; j++) {
    for (let i = 0; i < SAMPLES; i++) {
      const px = left + ((i + 0.5) / SAMPLES) * PAINT_CELL
      const py = top + ((j + 0.5) / SAMPLES) * PAINT_CELL
      sum += falloff(Math.hypot(px - x, py - y) / radius)
    }
  }
  return sum / (SAMPLES * SAMPLES)
}
