import { TILE } from "./biomes"
import type { Cells } from "./brush"
import { CHANNELS } from "./paint-tiles"

// How far toward its target a cell goes with one stamp at full strength and full
// falloff. A stroke lays about ten stamps over a cell, so this makes one pass
// clearly visible but not total at the default strength, and scrubbing finishes it.
const APPLY = 0.4
// How much of what the brush carries is replaced, at every stamp, by what is
// under it now: the carried amounts fade over a few stamps.
const PICKUP = 0.3

// What the brush has picked up along the stroke so far.
export type Carry = { amounts: Float32Array | null }

type Stamp = {
  // The cells the brush reaches, and how strongly it reaches each.
  cells: Cells
  strength: number
  coverage: (cx: number, cy: number) => number
  // A 1 for each cell with land, and the grid's size.
  land: Uint8Array
  cols: number
  // The stroke's weights for the tile a cell is in.
  tileWork: (cx: number, cy: number) => Float32Array
}

// One stamp of the blend brush. Every cell under it moves toward the average of
// the land under the whole brush, each average weighted by the soft falloff, so
// the brush's size is how wide the blend is. With "stretch", the target is
// mixed with what the brush carried from the stamps before it, so dragging
// across a border pulls a soft trail of one side into the other.
//
// The average is over land only, and no cell off the land is touched. A target
// is an average of amounts that added up to at most the whole, so a cell
// moved toward it still does. The textures are not in this at all.
export function blendStamp(stamp: Stamp, carry: Carry, stretch: number) {
  const { cells, strength, coverage, land, cols, tileWork } = stamp
  const width = cells.x1 - cells.x0 + 1
  const falloff = new Float32Array(width * (cells.y1 - cells.y0 + 1))
  const average = new Float32Array(CHANNELS)
  const cellAt = (cx: number, cy: number) => ((cy % TILE) * TILE + (cx % TILE)) * CHANNELS

  let total = 0
  for (let cy = cells.y0; cy <= cells.y1; cy++) {
    for (let cx = cells.x0; cx <= cells.x1; cx++) {
      if (!land[cy * cols + cx]) continue
      const f = coverage(cx, cy)
      if (f <= 0) continue
      falloff[(cy - cells.y0) * width + (cx - cells.x0)] = f
      total += f
      const work = tileWork(cx, cy)
      const cell = cellAt(cx, cy)
      for (let c = 0; c < CHANNELS; c++) average[c] += f * work[cell + c]
    }
  }
  if (total <= 0) return
  for (let c = 0; c < CHANNELS; c++) average[c] /= total

  const target = new Float32Array(CHANNELS)
  for (let c = 0; c < CHANNELS; c++) {
    target[c] = carry.amounts ? average[c] * (1 - stretch) + carry.amounts[c] * stretch : average[c]
  }
  carry.amounts = carry.amounts
    ? carry.amounts.map((kept, c) => kept * (1 - PICKUP) + average[c] * PICKUP)
    : average

  for (let cy = cells.y0; cy <= cells.y1; cy++) {
    for (let cx = cells.x0; cx <= cells.x1; cx++) {
      const f = falloff[(cy - cells.y0) * width + (cx - cells.x0)]
      if (f <= 0) continue
      const share = f * strength * APPLY
      const work = tileWork(cx, cy)
      const cell = cellAt(cx, cy)
      for (let c = 0; c < CHANNELS; c++) work[cell + c] += (target[c] - work[cell + c]) * share
    }
  }
}
