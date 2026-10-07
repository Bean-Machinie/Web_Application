import { mixRgb } from "../colour"
import type { Rgb } from "../colour"
import type { MapTheme } from "../map-theme"
import { BIOMES } from "./biomes"

// The ink that goes with the ground, given how much of each biome is there (0
// to 1, in biome order; null for none). What no biome covers is plains, which
// is the theme's own ink; each biome pulls the ink toward its own by its share.
export function groundInk(theme: MapTheme, weights: readonly number[] | null): Rgb {
  if (!weights) return theme.ink
  let used = Math.max(1 - weights.reduce((sum, weight) => sum + weight, 0), 0)
  let ink = theme.ink
  BIOMES.forEach((biome, index) => {
    const weight = weights[index]
    if (weight <= 0) return
    used += weight
    ink = mixRgb(ink, theme.biomes[biome].ink, weight / used)
  })
  return ink
}
