import { PAINT_CELL, TILE } from "./biomes"
import type { Cells } from "./brush"
import { CHANNELS } from "./paint-tiles"

// How much of the way to its blurred self a cell goes with one stamp at full
// strength. A stroke lays about ten stamps over a cell, so this keeps one pass
// gentle and lets scrubbing build the effect up.
const APPLY = 0.35
// How far the blur looks, in cells, as a share of the brush's radius.
const REACH = 0.12
const MAX_KERNEL = 16

// The average over a square of 2k + 1 cells, by running sums: the cost does not
// grow with k.
function box(source: Float32Array, width: number, height: number, k: number) {
  const across = new Float32Array(source.length)
  for (let y = 0; y < height; y++) {
    const row = y * width
    let sum = 0
    for (let x = 0; x <= Math.min(k, width - 1); x++) sum += source[row + x]
    for (let x = 0; x < width; x++) {
      across[row + x] = sum
      if (x + k + 1 < width) sum += source[row + x + k + 1]
      if (x - k >= 0) sum -= source[row + x - k]
    }
  }
  const out = new Float32Array(source.length)
  for (let x = 0; x < width; x++) {
    let sum = 0
    for (let y = 0; y <= Math.min(k, height - 1); y++) sum += across[y * width + x]
    for (let y = 0; y < height; y++) {
      out[y * width + x] = sum
      if (y + k + 1 < height) sum += across[(y + k + 1) * width + x]
      if (y - k >= 0) sum -= across[(y - k) * width + x]
    }
  }
  return out
}

type Stamp = {
  // The cells the brush reaches, how strongly it reaches each, and its radius.
  cells: Cells
  radius: number
  strength: number
  coverage: (cx: number, cy: number) => number
  // A 1 for each cell with land, and the grid's size.
  land: Uint8Array
  cols: number
  rows: number
  // The stroke's weights for the tile a cell is in.
  tileWork: (cx: number, cy: number) => Float32Array
}

// One stamp of the blend brush: each cell it reaches moves toward the average
// of the land cells around it. The average is over land only, so the coast does
// not fade paint toward nothing, and no cell off the land is touched. A cell's
// amounts end up an average of amounts that added up to at most the whole, so
// they still do. The textures are not in this at all: only the amounts.
export function blendStamp(stamp: Stamp) {
  const { cells, radius, strength, coverage, land, cols, rows, tileWork } = stamp
  const k = Math.min(Math.max(Math.round((radius / PAINT_CELL) * REACH), 1), MAX_KERNEL)
  const x0 = Math.max(cells.x0 - k, 0)
  const y0 = Math.max(cells.y0 - k, 0)
  const width = Math.min(cells.x1 + k, cols - 1) - x0 + 1
  const height = Math.min(cells.y1 + k, rows - 1) - y0 + 1

  const mask = new Float32Array(width * height)
  const amounts = Array.from({ length: CHANNELS }, () => new Float32Array(width * height))
  const at = (cx: number, cy: number) => ((cy % TILE) * TILE + (cx % TILE)) * CHANNELS
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const cx = x0 + x
      const cy = y0 + y
      if (!land[cy * cols + cx]) continue
      const i = y * width + x
      mask[i] = 1
      const work = tileWork(cx, cy)
      const cell = at(cx, cy)
      for (let c = 0; c < CHANNELS; c++) amounts[c][i] = work[cell + c]
    }
  }

  const reach = box(mask, width, height, k)
  const blurred = amounts.map((amount) => box(amount, width, height, k))
  for (let cy = cells.y0; cy <= cells.y1; cy++) {
    for (let cx = cells.x0; cx <= cells.x1; cx++) {
      if (!land[cy * cols + cx]) continue
      const share = coverage(cx, cy) * strength * APPLY
      if (share <= 0) continue
      const i = (cy - y0) * width + (cx - x0)
      const work = tileWork(cx, cy)
      const cell = at(cx, cy)
      for (let c = 0; c < CHANNELS; c++) {
        work[cell + c] += (blurred[c][i] / reach[i] - work[cell + c]) * share
      }
    }
  }
}
