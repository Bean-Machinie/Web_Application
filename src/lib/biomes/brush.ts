import { BIOMES, PAINT_CELL, TILE } from "./biomes"
import type { BrushBiome } from "./biomes"
import { CHANNELS, TILE_BYTES, isEmpty, settle, tileKey } from "./paint-tiles"
import type { Paint, Tile } from "./paint-tiles"
import { smooth } from "../map-noise"

// Full strength out to this share of the radius, then fading to nothing.
const CORE = 0.35
// Dabs are placed this share of the radius apart along a drag.
const SPACING = 0.2

const falloff = (share: number) => (share <= CORE ? 1 : 1 - smooth((share - CORE) / (1 - CORE)))

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
export function startStroke(
  paint: Paint,
  biome: BrushBiome,
  land: Uint8Array,
  cols: number,
  rows: number
) {
  const channel = biome === "plains" ? -1 : BIOMES.indexOf(biome)
  const touched = new Map<string, Touched>()

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

  function dab(x: number, y: number, radius: number): Cells {
    const reach = radius / PAINT_CELL
    const cells = {
      x0: Math.max(Math.floor(x / PAINT_CELL - reach), 0),
      y0: Math.max(Math.floor(y / PAINT_CELL - reach), 0),
      x1: Math.min(Math.ceil(x / PAINT_CELL + reach), cols - 1),
      y1: Math.min(Math.ceil(y / PAINT_CELL + reach), rows - 1),
    }
    for (let cy = cells.y0; cy <= cells.y1; cy++) {
      for (let cx = cells.x0; cx <= cells.x1; cx++) {
        if (!land[cy * cols + cx]) continue
        const share = Math.hypot((cx + 0.5) * PAINT_CELL - x, (cy + 0.5) * PAINT_CELL - y) / radius
        if (share >= 1) continue
        const strength = falloff(share)
        const tile = tileFor(Math.floor(cx / TILE), Math.floor(cy / TILE))
        const cell = (cy % TILE) * TILE + (cx % TILE)
        if (strength <= tile.cover[cell]) continue
        tile.cover[cell] = strength
        for (let c = 0; c < CHANNELS; c++) {
          const before = tile.base?.[cell * CHANNELS + c] ?? 0
          tile.work[cell * CHANNELS + c] = before * (1 - strength) + (c === channel ? 255 : 0) * strength
        }
      }
    }
    return cells
  }

  // A drag from one point to the next, as dabs close enough to be seamless.
  function line(x0: number, y0: number, x1: number, y1: number, radius: number): Cells {
    const count = Math.max(Math.ceil(Math.hypot(x1 - x0, y1 - y0) / (radius * SPACING)), 1)
    let all: Cells | null = null
    for (let i = 1; i <= count; i++) {
      const t = i / count
      const done = dab(x0 + (x1 - x0) * t, y0 + (y1 - y0) * t, radius)
      all = all
        ? { x0: Math.min(all.x0, done.x0), y0: Math.min(all.y0, done.y0), x1: Math.max(all.x1, done.x1), y1: Math.max(all.y1, done.y1) }
        : done
    }
    return all!
  }

  // The paint with the stroke in it. The same paint comes back if nothing changed.
  function finish(): Paint {
    let next: Map<string, Tile> | null = null
    for (const [key, { base, work }] of touched) {
      const tile = Uint8Array.from(work, settle)
      if (base ? tile.every((weight, i) => weight === base[i]) : isEmpty(tile)) continue
      next ??= new Map(paint)
      if (isEmpty(tile)) next.delete(key)
      else next.set(key, tile)
    }
    return next ?? paint
  }

  // Tiles as they are mid-stroke, for drawing what is being painted.
  return { dab, line, finish, working: touched as ReadonlyMap<string, Pick<Touched, "work">> }
}

export type Stroke = ReturnType<typeof startStroke>
