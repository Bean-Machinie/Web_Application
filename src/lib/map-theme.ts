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

// A ramp of colour from the darkest of a painting (0) to its lightest (1), as
// stops in order.
export type Ramp = [number, Rgb][]

// What each surface of a painting becomes in a biome: the grass or foliage, the
// snow and the rock (where the art has them).
export type Surfaced = { grass?: Ramp | null; snow?: Ramp | null; rock?: Ramp | null }

// How art painted in colour is drawn.
export type PaintLook = {
  // One grade over all painted art, so that it sits in the map: saturation and
  // contrast are 1 for no change, brightness is added (0 for none), and the tint
  // multiplies the colours toward it by "tintAmount".
  grade: { saturation: number; contrast: number; brightness: number; tint: Rgb; tintAmount: number }
  // Sharpening when art is drawn smaller than it was painted, so that brush
  // texture stays readable. This is the most, at a strong shrinking, 0 to 1; it
  // is gentle, because more makes halos on brushstrokes. "smallContrast" is the
  // most contrast added at the same time.
  sharpen: number
  smallContrast: number
  // The soft shadow at the foot of art: its colour, how dark it is at most, and
  // how far it is blurred, as a share of the art's width.
  shadow: { colour: Rgb; opacity: number; blur: number }
  // What the changing parts of painted art become in each biome: their own lights
  // and darks, in these colours. There is a set for each category that needs its
  // own; "default" is what the rest use. Plains keeps the painting as it is, so
  // it has none. A surface left out, or null, stays as painted in that biome.
  recolour: Record<string, Record<Biome, Surfaced>>
}

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
  paint: PaintLook
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

// The same colours on every background: the grade, below, is what makes them sit.
const FOLIAGE: Record<Biome, Surfaced> = {
  ice: { grass: [[0, [38, 74, 84]], [0.45, [104, 152, 156]], [0.8, [196, 226, 228]], [1, [255, 255, 255]]] },
  desert: { grass: [[0, [52, 50, 26]], [0.5, [122, 116, 56]], [1, [198, 190, 118]]] },
  swamp: { grass: [[0, [20, 28, 18]], [0.5, [46, 60, 34]], [1, [96, 112, 58]]] },
  volcanic: { grass: [[0, [18, 17, 16]], [0.5, [56, 54, 52]], [1, [116, 112, 108]]] },
}

// Mountains: grass on the slopes, snow and rock, each in the biome's terms. Snow
// stays on ice and is not on desert, swamp or volcanic ground, where it becomes
// pale rock of that ground; the rock itself takes the ground's colours.
const MOUNTAINS: Record<Biome, Surfaced> = {
  ice: {
    grass: [[0, [118, 138, 160]], [0.5, [198, 212, 226]], [1, [255, 255, 255]]],
    snow: null,
    rock: [[0, [28, 38, 52]], [0.5, [84, 100, 120]], [1, [160, 176, 192]]],
  },
  desert: {
    grass: [[0, [118, 90, 52]], [0.5, [194, 162, 100]], [1, [232, 208, 152]]],
    snow: [[0, [150, 112, 70]], [0.5, [214, 178, 126]], [1, [244, 224, 184]]],
    rock: [[0, [58, 30, 20]], [0.5, [160, 88, 52]], [1, [222, 150, 96]]],
  },
  swamp: {
    grass: [[0, [24, 34, 24]], [0.5, [52, 66, 40]], [1, [92, 106, 62]]],
    snow: [[0, [60, 70, 56]], [0.5, [118, 128, 106]], [1, [176, 184, 158]]],
    rock: [[0, [16, 22, 18]], [0.5, [56, 68, 54]], [1, [108, 122, 96]]],
  },
  volcanic: {
    grass: [[0, [44, 42, 42]], [0.5, [96, 92, 90]], [1, [158, 154, 150]]],
    snow: [[0, [70, 66, 64]], [0.5, [130, 124, 120]], [1, [196, 190, 184]]],
    rock: [[0, [12, 10, 10]], [0.5, [52, 46, 44]], [1, [112, 100, 94]]],
  },
}

// Desert trees: golden leaves and an orange trunk, which would stand out on any
// other ground. The leaves take the ground's foliage colours, and the trunk takes
// bark of the ground, so the tree belongs wherever it is. On desert ground both
// are only toned down and dried.
const DESERT_TREES: Record<Biome, Surfaced> = {
  ice: {
    grass: FOLIAGE.ice.grass,
    rock: [[0, [40, 44, 52]], [0.5, [96, 100, 112]], [1, [176, 180, 192]]],
  },
  desert: {
    grass: [[0, [70, 60, 26]], [0.5, [150, 128, 56]], [1, [220, 194, 110]]],
    rock: [[0, [70, 44, 28]], [0.5, [150, 104, 70]], [1, [212, 170, 126]]],
  },
  swamp: {
    grass: FOLIAGE.swamp.grass,
    rock: [[0, [22, 20, 16]], [0.5, [62, 54, 40]], [1, [108, 98, 76]]],
  },
  volcanic: {
    grass: FOLIAGE.volcanic.grass,
    rock: [[0, [10, 9, 9]], [0.5, [46, 42, 40]], [1, [100, 92, 88]]],
  },
}

const PAINT = {
  sharpen: 0.3,
  smallContrast: 0.05,
  shadow: { colour: [30, 24, 16] as Rgb, opacity: 0.32, blur: 0.06 },
  recolour: { default: FOLIAGE, mountains: MOUNTAINS, "desert-trees": DESERT_TREES },
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
    paint: { ...PAINT, grade: { saturation: 0.92, contrast: 1.03, brightness: 0, tint: [255, 232, 190], tintAmount: 0.1 } },
  },
  ocean: {
    ink: [34, 34, 30],
    backdrop: { low: [28, 92, 122], high: [64, 144, 168], edge: [10, 40, 62], edgeAmount: 0.3, waves: 0.06 },
    land: { fill: [198, 209, 147], grain: 0.4, shadow: SHADOW },
    biomes: BIOMES,
    water: { dark: [8, 38, 58], darkAlpha: 0.45, light: [214, 244, 248], lightAlpha: 0.85, grain: 0.3 },
    paint: { ...PAINT, grade: { saturation: 1, contrast: 1.03, brightness: 0, tint: [255, 244, 220], tintAmount: 0.04 } },
  },
}

export const themeFor = (background: SceneBackground) => THEMES[background]
