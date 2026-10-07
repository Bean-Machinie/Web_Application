import { random } from "./map-noise"
import type { SceneBackground } from "./map-scene"
import type { MapStyle } from "./map-style"

type Rgb = [number, number, number]

// Art, not interface, so fixed colours. A dark band hugs the coast; light lines
// spread out from it.
export const LOOKS: Record<SceneBackground, { dark: Rgb; darkAlpha: number; light: Rgb; lightAlpha: number }> = {
  parchment: { dark: [96, 66, 36], darkAlpha: 0.42, light: [255, 252, 240], lightAlpha: 0.95 },
  ocean: { dark: [8, 38, 58], darkAlpha: 0.45, light: [214, 244, 248], lightAlpha: 0.85 },
}

export const MAX_RINGS = 8
// The widest a line can swell to, as a share of its usual width.
const SWELL_MAX = 1.7

export type WaterStyle = Pick<MapStyle, "thickness" | "spacing" | "variation">

export type Sizes = ReturnType<typeof sizesFor>

// Everything is worked out from the three settings, in canvas pixels, so the
// look stays in proportion however they are set.
export function sizesFor({ thickness, spacing, variation }: WaterStyle) {
  return {
    band: 0.44 * spacing,
    first: 0.5 * spacing,
    near: thickness,
    far: 0.7 * thickness,
    // Water narrower than this across (twice the half-width given) shows no
    // rings, and they fade in over the next stretch of width.
    channelHalf: 1 * spacing,
    channelFade: 0.8 * spacing,
    // The big wander of the lines, and the fine shake of the pen on top of it.
    swing: 0.55 * spacing * variation,
    tremor: 0.5 * thickness * variation,
    // Never finer than a clear line, however thin the setting.
    least: Math.min(1.3, thickness / 2),
  }
}

export type Ring = {
  centre: number
  // Own share of the wandering.
  amp: number
  half: number
  // Breaks start where the break noise falls below this; further rings break more.
  cut: number
  // How far from the centre the line can reach, so most pixels skip it early.
  reach: number
}

// Where each ring sits and how it is drawn. Gaps are uneven and every ring has
// its own character, all drawn in a fixed order so adding a ring leaves the
// others as they were.
export function makeRings(count: number, style: WaterStyle, sizes: Sizes, seed: number) {
  const { spacing, variation } = style
  const next = random(seed ^ 0x2c1b3c6d)
  const rings: Ring[] = []
  let centre = sizes.first
  for (let k = 0; k < count; k++) {
    const gap = spacing * (1 + (next() - 0.5) * 0.9 * variation)
    const amp = 0.7 + 0.6 * next()
    const weight = 1 + (next() - 0.5) * 0.3 * variation
    if (k > 0) centre += gap
    const along = k / Math.max(count - 1, 1)
    const half = Math.max(((sizes.near + (sizes.far - sizes.near) * along) / 2) * weight, sizes.least)
    // Without variation nothing breaks: the cut sits below any noise.
    const cut = -0.3 + (0.4 + 0.25 * along) * variation
    rings.push({
      centre,
      amp,
      half,
      cut,
      reach: sizes.swing * amp + sizes.tremor + half * SWELL_MAX + 1,
    })
  }
  return rings
}
