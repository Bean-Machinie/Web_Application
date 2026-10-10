import { css } from "../colour"
import type { SceneBackground } from "../map-scene"
import { themeFor } from "../map-theme"
import { gradedTile } from "../terrain-texture"
import type { Tiles } from "../terrain-tiles"
import { BIOMES } from "./biomes"
import type { BrushBiome } from "./biomes"

export type BrushSwatches = Record<BrushBiome, string>

// A square of ground, in screen pixels, which the strip shows in a circle, and how
// much of a tile it takes in: a small chunk, so the marks can be made out.
const SIZE = 14
const TILE_SHOWN = 40

const made = new Map<string, BrushSwatches>()

function swatchOf(tiles: Tiles, biome: BrushBiome, background: SceneBackground, density: number) {
  const theme = themeFor(background)
  const fill = biome === "plains" ? theme.land.fill : theme.biomes[biome].fill
  const tile = gradedTile(tiles[biome === "plains" ? "land" : biome], background)
  const side = Math.round(SIZE * density)
  const out = Object.assign(document.createElement("canvas"), { width: side, height: side })
  const context = out.getContext("2d")!
  context.fillStyle = css(fill)
  context.fillRect(0, 0, side, side)
  const pattern = context.createPattern(tile, "repeat")!
  pattern.setTransform(new DOMMatrix().scale((TILE_SHOWN * density) / tile.width))
  context.fillStyle = pattern
  context.fillRect(0, 0, side, side)
  return out.toDataURL()
}

// A small picture of each biome's ground, drawn once for each background and
// screen density, in the map's own colour and grade.
export function biomeSwatches(tiles: Tiles, background: SceneBackground): BrushSwatches {
  const density = window.devicePixelRatio || 1
  const key = `${background}@${density}`
  const known = made.get(key)
  if (known) return known
  const swatches = Object.fromEntries(
    (["plains", ...BIOMES] as BrushBiome[]).map((biome) => [biome, swatchOf(tiles, biome, background, density)])
  ) as BrushSwatches
  made.set(key, swatches)
  return swatches
}
