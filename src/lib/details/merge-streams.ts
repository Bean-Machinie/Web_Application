import { CHANNELS } from "../biomes/paint-tiles"
import type { Paint, Tile } from "../biomes/paint-tiles"
import { RIVER } from "./details"

// The place the stream had in each cell, from when there was a stream brush besides the river.
const STREAM = 3

// Maps saved with stream paint have it as river now: what the stream held in a cell is
// added to the river's, and the stream's place is left empty. The same paint comes back
// if there is none, so that most maps cost nothing.
export function mergeStreams(paint: Paint): Paint {
  let next: Map<string, Tile> | null = null
  for (const [key, tile] of paint) {
    let merged: Tile | null = null
    for (let i = 0; i < tile.length; i += CHANNELS) {
      const stream = tile[i + STREAM]
      if (!stream) continue
      merged ??= tile.slice()
      merged[i + RIVER] = Math.min(255, merged[i + RIVER] + stream)
      merged[i + STREAM] = 0
    }
    if (merged) (next ??= new Map(paint)).set(key, merged)
  }
  return next ?? paint
}
