import { LAND_COLOURS } from "../map-land-colours"
import type { SceneBackground } from "../map-scene"
import { BIOMES } from "./biomes"
import type { Biome } from "./biomes"

export type Rgb = [number, number, number]

// Art, not interface, so fixed colours: the ground, and the ink the coast is
// drawn in where it borders that biome.
const BASE: Record<Biome, { fill: Rgb; ink: Rgb }> = {
  ice: { fill: [208, 230, 238], ink: [86, 120, 140] },
  swamp: { fill: [106, 126, 66], ink: [48, 62, 32] },
  desert: { fill: [226, 196, 124], ink: [128, 94, 44] },
  volcanic: { fill: [74, 68, 64], ink: [30, 24, 22] },
}

// How far the colours are drawn toward the land's own on parchment, where
// saturated ground looks out of place.
const MUTED = 0.25

export const hexToRgb = (hex: string): Rgb => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)) as Rgb

export const mixRgb = (a: Rgb, b: Rgb, t: number): Rgb => [0, 1, 2].map((i) => a[i] + (b[i] - a[i]) * t) as Rgb

export const css = ([r, g, b]: Rgb) => `rgb(${Math.round(r)},${Math.round(g)},${Math.round(b)})`

export function biomeColours(biome: Biome, background: SceneBackground) {
  const { fill, ink } = BASE[biome]
  if (background !== "parchment") return { fill, ink }
  const land = LAND_COLOURS.parchment
  return { fill: mixRgb(fill, hexToRgb(land.fill), MUTED), ink: mixRgb(ink, hexToRgb(land.ink), MUTED) }
}

export const biomeInks = (background: SceneBackground) =>
  BIOMES.map((biome) => biomeColours(biome, background).ink)
