import { BIOMES, PAINT_CELL, TILE } from "./biomes"

export const CHANNELS = BIOMES.length
export const TILE_BYTES = TILE * TILE * CHANNELS

// One tile of paint: for every cell, how much of each biome is there, 0 to 255,
// in biome order. Plains is whatever is left, so it is not stored.
export type Tile = Uint8Array

// All the paint on a map. Only tiles that hold some are present. A paint is
// never changed once made: an edit makes a new one that shares every tile it
// did not touch, so undo keeps a step for the price of a few tiles.
export type Paint = ReadonlyMap<string, Tile>

export const EMPTY_PAINT: Paint = new Map()

export const tileKey = (tx: number, ty: number) => `${tx},${ty}`

export function gridSize({ width, height }: { width: number; height: number }) {
  return { cols: Math.ceil(width / PAINT_CELL), rows: Math.ceil(height / PAINT_CELL) }
}

// Weights this close to nothing, or to everything, are taken to be exactly that,
// so that clearing a biome leaves no faint tint and a full one is full.
const NONE = 3
const FULL = 252

// Rounds a weight (0 to 255, any precision) for keeping.
export function settle(weight: number) {
  const whole = Math.round(weight)
  return whole <= NONE ? 0 : whole >= FULL ? 255 : whole
}

export const isEmpty = (tile: Tile) => tile.every((weight) => weight === 0)

// The paint with everything off the land taken away, so that land drawn there
// later starts as plains. "land" has a 1 for each cell of the grid with land in.
export function eraseOutside(paint: Paint, land: Uint8Array, cols: number, rows: number): Paint {
  let next: Map<string, Tile> | null = null
  for (const [key, tile] of paint) {
    const [tx, ty] = key.split(",").map(Number)
    let cleaned: Tile | null = null
    for (let y = 0; y < TILE; y++) {
      for (let x = 0; x < TILE; x++) {
        const cx = tx * TILE + x
        const cy = ty * TILE + y
        if (cx < cols && cy < rows && land[cy * cols + cx]) continue
        const at = (y * TILE + x) * CHANNELS
        if (!tile.subarray(at, at + CHANNELS).some(Boolean)) continue
        cleaned ??= tile.slice()
        cleaned.fill(0, at, at + CHANNELS)
      }
    }
    if (!cleaned) continue
    next ??= new Map(paint)
    if (isEmpty(cleaned)) next.delete(key)
    else next.set(key, cleaned)
  }
  return next ?? paint
}
