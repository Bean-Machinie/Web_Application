import { mixRgb } from "./colour"
import type { Rgb } from "./colour"
import type { Biome } from "./biomes/biomes"
import type { SceneBackground } from "./map-scene"

// How a map looks, in one place. Every layer reads its colours and its line
// weight from here, so that the ink, the land, the biomes and the water stay one
// style. These are art, not interface, so fixed colours rather than the app's
// theme tokens; the app's own UI is not in this.
//
// Which theme a map uses follows its background. Nothing here is saved in a map,
// so changing a value restyles every map.

// The weight of the ink line, in canvas pixels. The coast is drawn at it unless
// the map says otherwise, and the art in the asset library is drawn to match it
// at the size art is first placed.
export const LINE_WEIGHT = 2.5

type Biomes = Record<Biome, { fill: Rgb; ink: Rgb }>

export type MapTheme = {
  // The ink the coast and the art are drawn in.
  ink: Rgb
  // What the sheet or the sea looks like under everything: the colour from low to
  // high ground of the noise, the darker edge of the sheet, and how strong the
  // bands of waves are (none on paper).
  backdrop: { low: Rgb; high: Rgb; edge: Rgb; edgeAmount: number; waves: number }
  land: {
    fill: Rgb
    // How strongly the grain shows on the land.
    grain: number
    shadow: { colour: string; blur: number; offsetY: number; opacity: number }
  }
  // Each biome's ground, and the ink the coast takes where it borders it.
  // "accent" is the glow in volcanic ground.
  biomes: Biomes & { volcanic: { accent: Rgb } }
  // The sea around the land: a dark band along the coast and light lines
  // spreading out from it, with grain over the sea.
  water: { dark: Rgb; darkAlpha: number; light: Rgb; lightAlpha: number; grain: number }
}

const BIOMES: Biomes & { volcanic: { accent: Rgb } } = {
  ice: { fill: [208, 230, 238], ink: [86, 120, 140] },
  swamp: { fill: [106, 126, 66], ink: [48, 62, 32] },
  desert: { fill: [226, 196, 124], ink: [136, 82, 30] },
  volcanic: { fill: [74, 68, 64], ink: [30, 24, 22], accent: [196, 70, 30] },
}

// On paper the biome colours are drawn toward the land's own, where saturated
// ground looks out of place.
const MUTED = 0.25

function muted(land: { fill: Rgb; ink: Rgb }): MapTheme["biomes"] {
  const toward = ({ fill, ink }: { fill: Rgb; ink: Rgb }) => ({
    fill: mixRgb(fill, land.fill, MUTED),
    ink: mixRgb(ink, land.ink, MUTED),
  })
  return {
    ice: toward(BIOMES.ice),
    swamp: toward(BIOMES.swamp),
    desert: toward(BIOMES.desert),
    volcanic: { ...toward(BIOMES.volcanic), accent: BIOMES.volcanic.accent },
  }
}

const SHADOW = { colour: "#000", blur: 16, offsetY: 5, opacity: 0.3 }

const PARCHMENT_LAND = { fill: [239, 227, 189] as Rgb, ink: [52, 38, 26] as Rgb }

const THEMES: Record<SceneBackground, MapTheme> = {
  parchment: {
    ink: PARCHMENT_LAND.ink,
    backdrop: { low: [205, 178, 132], high: [240, 225, 190], edge: [120, 84, 44], edgeAmount: 0.38, waves: 0 },
    land: { fill: PARCHMENT_LAND.fill, grain: 0.4, shadow: SHADOW },
    biomes: muted(PARCHMENT_LAND),
    water: { dark: [96, 66, 36], darkAlpha: 0.42, light: [255, 252, 240], lightAlpha: 0.95, grain: 0.3 },
  },
  ocean: {
    ink: [34, 34, 30],
    backdrop: { low: [28, 92, 122], high: [64, 144, 168], edge: [10, 40, 62], edgeAmount: 0.3, waves: 0.06 },
    land: { fill: [198, 209, 147], grain: 0.4, shadow: SHADOW },
    biomes: BIOMES,
    water: { dark: [8, 38, 58], darkAlpha: 0.45, light: [214, 244, 248], lightAlpha: 0.85, grain: 0.3 },
  },
}

export const themeFor = (background: SceneBackground) => THEMES[background]
