import { BIOMES, PAINT_CELL, TILE } from "./biomes"
import type { BrushBiome } from "./biomes"
import { blendStamp } from "./blend"
import type { Carry } from "./blend"
import { CHANNELS, TILE_BYTES, settle, tileKey } from "./paint-tiles"
import type { Paint, Tile } from "./paint-tiles"
import { FINE_BRUSH, SPACING, coverage } from "./stamp"

// What a stroke has done to one tile so far. The weights are kept as exact
// numbers and only rounded when the stroke ends.
type Touched = { base: Tile | undefined; cover: Float32Array; work: Float32Array }

// A rectangle of cells.
export type Cells = { x0: number; y0: number; x1: number; y1: number }

// One brush stroke. Each cell takes the strongest the brush has reached it, not
// the sum, so the edge looks the same however slowly the brush moves, and each
// cell's result is worked out afresh from how it was before the stroke. A
// paint of full strength therefore always reaches exactly nothing or exactly
// all, whatever the order of the dabs.
//
// A blend stroke is the exception: its stamps do build up, each one softening
// what the last left, so that scrubbing an area blends it more and more.
export function startStroke(
  paint: Paint,
  biome: BrushBiome | "blend",
  land: Uint8Array,
  cols: number,
  rows: number,
  strength = 0,
  stretch = 0
) {
  const channel = biome === "plains" || biome === "blend" ? -1 : BIOMES.indexOf(biome)
  const touched = new Map<string, Touched>()
  const carry: Carry = { amounts: null }

  const tileFor = (tx: number, ty: number) => {
    const key = tileKey(tx, ty)
    let entry = touched.get(key)
    if (!entry) {
      const base = paint.get(key)
      entry = {
        base,
        cover: new Float32Array(TILE * TILE),
        work: Float32Array.from({ length: TILE_BYTES }, (_, i) => base?.[i] ?? 0),
      }
      touched.set(key, entry)
    }
    return entry
  }

  // The stroke's weights for the tile a cell is in. Asked for cell after cell, so
  // the last tile is kept.
  let lastX = -1
  let lastY = -1
  let lastWork: Float32Array | null = null
  const tileWork = (cx: number, cy: number) => {
    const tx = Math.floor(cx / TILE)
    const ty = Math.floor(cy / TILE)
    if (tx !== lastX || ty !== lastY || !lastWork) {
      lastX = tx
      lastY = ty
      lastWork = tileFor(tx, ty).work
    }
    return lastWork
  }

  function dab(x: number, y: number, radius: number): Cells {
    const reach = radius / PAINT_CELL + 1
    const fine = radius < FINE_BRUSH * PAINT_CELL
    const cells = {
      x0: Math.max(Math.floor(x / PAINT_CELL - reach), 0),
      y0: Math.max(Math.floor(y / PAINT_CELL - reach), 0),
      x1: Math.min(Math.ceil(x / PAINT_CELL + reach), cols - 1),
      y1: Math.min(Math.ceil(y / PAINT_CELL + reach), rows - 1),
    }
    if (biome === "blend") {
      blendStamp(
        { cells, strength, coverage: (cx, cy) => coverage(cx, cy, x, y, radius, fine), land, cols, tileWork },
        carry,
        stretch
      )
      return cells
    }
    for (let cy = cells.y0; cy <= cells.y1; cy++) {
      for (let cx = cells.x0; cx <= cells.x1; cx++) {
        if (!land[cy * cols + cx]) continue
        const covered = coverage(cx, cy, x, y, radius, fine)
        if (covered <= 0) continue
        const tile = tileFor(Math.floor(cx / TILE), Math.floor(cy / TILE))
        const cell = (cy % TILE) * TILE + (cx % TILE)
        if (covered <= tile.cover[cell]) continue
        tile.cover[cell] = covered
        for (let c = 0; c < CHANNELS; c++) {
          const before = tile.base?.[cell * CHANNELS + c] ?? 0
          tile.work[cell * CHANNELS + c] = before * (1 - covered) + (c === channel ? 255 : 0) * covered
        }
      }
    }
    return cells
  }

  const join = (a: Cells | null, b: Cells): Cells =>
    a ? { x0: Math.min(a.x0, b.x0), y0: Math.min(a.y0, b.y0), x1: Math.max(a.x1, b.x1), y1: Math.max(a.y1, b.y1) } : b

  // How far the path has gone since the last stamp, so that the stamps are the
  // same distance apart however the pointer's moves were cut up.
  let owed = 0

  // Stamps along a drag from one point to the next, from where the last one was
  // left off. A stamp always lands under the pointer's first point.
  function line(x0: number, y0: number, x1: number, y1: number, radius: number): Cells | null {
    const step = Math.max(radius * 2 * SPACING, 0.75)
    const length = Math.hypot(x1 - x0, y1 - y0)
    let all: Cells | null = null
    let at = step - owed
    for (; at <= length; at += step) {
      all = join(all, dab(x0 + ((x1 - x0) * at) / length, y0 + ((y1 - y0) * at) / length, radius))
    }
    owed = length - (at - step)
    return all
  }

  // The paint with the stroke in it. The same paint comes back if nothing changed.
  function finish(): Paint {
    let next: Map<string, Tile> | null = null
    for (const [key, { base, work }] of touched) {
      const tile = new Uint8Array(work.length)
      let changed = base === undefined
      let any = false
      for (let i = 0; i < work.length; i += CHANNELS) {
        let sum = 0
        let biggest = i
        for (let c = 0; c < CHANNELS; c++) {
          tile[i + c] = settle(work[i + c])
          sum += tile[i + c]
          if (tile[i + c] > tile[biggest]) biggest = i + c
        }
        // Rounding must not make a cell add up to more than the whole.
        if (sum > 255) tile[biggest] -= sum - 255
        for (let c = 0; c < CHANNELS; c++) {
          if (tile[i + c] !== 0) any = true
          if (base && tile[i + c] !== base[i + c]) changed = true
        }
      }
      if (!changed && base) continue
      if (!base && !any) continue
      next ??= new Map(paint)
      if (any) next.set(key, tile)
      else next.delete(key)
    }
    return next ?? paint
  }

  // Tiles as they are mid-stroke, for drawing what is being painted.
  return { dab, line, finish, working: touched as ReadonlyMap<string, Pick<Touched, "work">> }
}

export type Stroke = ReturnType<typeof startStroke>
