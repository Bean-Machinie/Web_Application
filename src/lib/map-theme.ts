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
  // The light tint over painted ground (the tiles in src/assets/textures), on top
  // of the grade above; none when the amount is 0.
  terrainTint: { tint: Rgb; amount: number }
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
  recolour: Record<string, Record<Biome, Surfaced> & { plains?: Surfaced }>
}

export type MapTheme = {
  // The ink the coast and the art are drawn in.
  ink: Rgb
  land: {
    fill: Rgb
    shadow: { colour: string; blur: number; offsetY: number; opacity: number }
  }
  // Each biome's ground, and the ink the coast takes where it borders it.
  // "accent" is the glow in volcanic ground.
  biomes: Biomes & { volcanic: { accent: Rgb } }
  // The sea around the land: a dark band along the coast and light lines
  // spreading out from it.
  water: { dark: Rgb; darkAlpha: number; light: Rgb; lightAlpha: number }
  paint: PaintLook
}

const BIOMES: Biomes & { volcanic: { accent: Rgb } } = {
  ice: { fill: [193, 208, 220], ink: [86, 120, 140] },
  swamp: { fill: [93, 89, 45], ink: [48, 46, 22] },
  desert: { fill: [200, 148, 97], ink: [120, 70, 28] },
  volcanic: { fill: [89, 76, 67], ink: [34, 26, 22], accent: [196, 70, 30] },
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
  desert: { grass: [[0, [56, 48, 22]], [0.5, [128, 112, 52]], [1, [206, 184, 104]]] },
  swamp: { grass: [[0, [16, 20, 10]], [0.5, [44, 52, 24]], [1, [96, 106, 48]]] },
  volcanic: { grass: [[0, [16, 13, 12]], [0.5, [54, 46, 42]], [1, [116, 100, 90]]] },
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
    grass: [[0, [112, 78, 48]], [0.5, [182, 134, 86]], [1, [226, 184, 128]]],
    snow: [[0, [140, 100, 66]], [0.5, [200, 154, 106]], [1, [226, 188, 140]]],
    rock: [[0, [86, 54, 36]], [0.5, [158, 108, 70]], [1, [212, 160, 108]]],
  },
  swamp: {
    grass: [[0, [26, 30, 16]], [0.5, [58, 64, 32]], [1, [102, 108, 56]]],
    snow: [[0, [62, 64, 46]], [0.5, [122, 122, 94]], [1, [180, 178, 146]]],
    rock: [[0, [18, 20, 12]], [0.5, [58, 62, 40]], [1, [110, 114, 76]]],
  },
  volcanic: {
    grass: [[0, [44, 38, 34]], [0.5, [98, 86, 76]], [1, [160, 144, 130]]],
    snow: [[0, [72, 62, 56]], [0.5, [134, 118, 106]], [1, [198, 182, 168]]],
    rock: [[0, [14, 11, 10]], [0.5, [56, 46, 42]], [1, [116, 100, 90]]],
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
    rock: [[0, [22, 20, 12]], [0.5, [62, 58, 34]], [1, [110, 104, 66]]],
  },
  volcanic: {
    grass: FOLIAGE.volcanic.grass,
    rock: [[0, [12, 10, 9]], [0.5, [50, 42, 38]], [1, [106, 92, 82]]],
  },
}

// Hills: the same ground colours as the slopes and rock of the mountains, so the
// two match on every biome, and a green meadow of their own for plains, which is
// the look they rest in where nothing is painted.
const HILLS: Record<Biome, Surfaced> & { plains: Surfaced } = {
  plains: {
    grass: [[0, [62, 58, 34]], [0.5, [122, 114, 68]], [1, [178, 168, 104]]],
    rock: [[0, [66, 58, 40]], [0.5, [116, 104, 72]], [1, [170, 154, 108]]],
  },
  ice: { grass: MOUNTAINS.ice.grass, rock: MOUNTAINS.ice.rock },
  // Sandier than the mountains' red rock: hills are dunes here, not cliffs.
  desert: { grass: MOUNTAINS.desert.grass, rock: [[0, [96, 64, 40]], [0.5, [168, 120, 78]], [1, [218, 170, 116]]] },
  swamp: { grass: MOUNTAINS.swamp.grass, rock: MOUNTAINS.swamp.rock },
  volcanic: { grass: MOUNTAINS.volcanic.grass, rock: MOUNTAINS.volcanic.rock },
}

// Volcanoes: slopes of grass and golden scrub around a dark cone with lava. The
// slopes take the ground's colours (frosted, sandy, murky, ashen) and the cone
// stays darker than them in every biome, so the volcano still reads as one; lava
// and smoke are not here because they stay as painted.
const VOLCANOES: Record<Biome, Surfaced> = {
  ice: {
    grass: [[0, [110, 134, 156]], [0.5, [196, 212, 226]], [1, [250, 252, 255]]],
    rock: [[0, [26, 32, 42]], [0.5, [72, 84, 100]], [1, [140, 154, 170]]],
  },
  desert: {
    grass: [[0, [120, 84, 50]], [0.5, [190, 142, 88]], [1, [230, 192, 134]]],
    rock: [[0, [44, 30, 24]], [0.5, [110, 74, 52]], [1, [178, 128, 88]]],
  },
  swamp: {
    grass: [[0, [20, 24, 12]], [0.5, [52, 60, 28]], [1, [100, 108, 52]]],
    rock: [[0, [12, 14, 9]], [0.5, [46, 50, 34]], [1, [96, 100, 70]]],
  },
  volcanic: {
    grass: [[0, [30, 24, 20]], [0.5, [78, 64, 54]], [1, [138, 118, 100]]],
    rock: [[0, [10, 8, 8]], [0.5, [40, 34, 32]], [1, [96, 84, 78]]],
  },
}

// Grass tufts: the whole plant is taken to a narrow range around the ground's
// own colour, so it sits in the ground instead of standing out. In flowers
// only the stems and leaves change; the petals keep their colours.
const NATURE: Record<Biome, Surfaced> & { plains: Surfaced } = {
  plains: { grass: [[0, [96, 88, 56]], [0.5, [138, 128, 84]], [1, [176, 164, 108]]] },
  ice: { grass: [[0, [150, 172, 190]], [0.5, [190, 206, 220]], [1, [226, 236, 244]]] },
  desert: { grass: [[0, [160, 112, 70]], [0.5, [198, 148, 98]], [1, [232, 188, 134]]] },
  swamp: { grass: [[0, [56, 56, 28]], [0.5, [88, 86, 42]], [1, [124, 122, 66]]] },
  volcanic: { grass: [[0, [56, 46, 40]], [0.5, [86, 74, 64]], [1, [124, 108, 94]]] },
}

// Trees: on plains the painted bright green is taken to a calm olive, and the
// orange trunk to bark, so they sit in the ground instead of standing out. The
// other biomes are the foliage's own, with the trunk as painted.
const OAKS: Record<Biome, Surfaced> & { plains: Surfaced } = {
  ...FOLIAGE,
  plains: {
    // Warm olive, with red kept at or above green so it does not turn minty.
    grass: [[0, [68, 65, 36]], [0.5, [133, 120, 70]], [1, [172, 154, 98]]],
    rock: [[0, [60, 44, 26]], [0.5, [124, 93, 58]], [1, [168, 134, 94]]],
  },
}

// Pines are darker and richer than oaks, as in life, in every biome; where the
// ground is bleak the difference is only slight. The bark is shared.
const PINES: Record<Biome, Surfaced> & { plains: Surfaced } = {
  ice: { grass: [[0, [28, 62, 74]], [0.45, [86, 134, 144]], [0.8, [176, 210, 216]], [1, [240, 248, 250]]] },
  desert: { grass: [[0, [44, 42, 18]], [0.5, [104, 102, 44]], [1, [178, 170, 92]]] },
  swamp: { grass: [[0, [12, 18, 10]], [0.5, [34, 48, 24]], [1, [80, 98, 46]]] },
  volcanic: { grass: [[0, [14, 12, 11]], [0.5, [46, 42, 38]], [1, [100, 90, 82]]] },
  plains: {
    grass: [[0, [32, 42, 22]], [0.5, [86, 98, 50]], [1, [134, 142, 80]]],
    rock: OAKS.plains.rock,
  },
}

// Towns and towers: the ground, bushes and ivy take the biome's ground, with the
// bushes darker than it so they still read. Stone and roofs are not in this.
const SETTLEMENTS: Record<Biome, Surfaced> & { plains: Surfaced } = {
  plains: { grass: [[0, [42, 44, 22]], [0.5, [104, 96, 54]], [1, [140, 124, 78]]] },
  ice: { grass: [[0, [70, 100, 116]], [0.5, [150, 176, 192]], [1, [225, 235, 243]]] },
  desert: { grass: [[0, [96, 64, 38]], [0.5, [176, 128, 80]], [1, [226, 184, 128]]] },
  swamp: { grass: [[0, [22, 26, 12]], [0.5, [56, 60, 30]], [1, [104, 108, 56]]] },
  volcanic: { grass: [[0, [24, 20, 18]], [0.5, [70, 60, 52]], [1, [128, 112, 98]]] },
}

// Desert props: the ground marked by each piece's mask, in three parts. On desert
// ground only the sand is toned to the ground and the rest stays as painted;
// elsewhere the scrub, the sand and the rocks each take that ground's foliage,
// ground and rock colours. Plains is the look the art rests in where no biome is
// painted, with the same calm olive and earth as the trees and hills there.
const DESERT_PROPS: Record<Biome, Surfaced> & { plains: Surfaced } = {
  plains: {
    grass: OAKS.plains.grass,
    snow: [[0, [104, 96, 62]], [0.5, [130, 120, 80]], [1, [152, 140, 96]]],
    rock: HILLS.plains.rock,
  },
  desert: { snow: [[0, [168, 122, 80]], [0.5, [194, 142, 92]], [1, [212, 160, 108]]] },
  ice: {
    grass: FOLIAGE.ice.grass,
    snow: [[0, [150, 172, 190]], [0.5, [196, 212, 226]], [1, [232, 241, 247]]],
    rock: MOUNTAINS.ice.rock,
  },
  swamp: {
    grass: FOLIAGE.swamp.grass,
    snow: [[0, [58, 56, 28]], [0.5, [93, 89, 45]], [1, [126, 120, 66]]],
    rock: MOUNTAINS.swamp.rock,
  },
  volcanic: {
    grass: FOLIAGE.volcanic.grass,
    snow: [[0, [62, 52, 46]], [0.5, [89, 76, 67]], [1, [120, 104, 92]]],
    rock: MOUNTAINS.volcanic.rock,
  },
}

const PAINT = {
  sharpen: 0.3,
  smallContrast: 0.05,
  shadow: { colour: [30, 24, 16] as Rgb, opacity: 0.32, blur: 0.06 },
  recolour: { default: FOLIAGE, "oak-trees": OAKS, "pine-trees": PINES, mountains: MOUNTAINS, hills: HILLS, "desert-trees": DESERT_TREES, nature: NATURE, volcanos: VOLCANOES, towns: SETTLEMENTS, buildings: SETTLEMENTS, camp: SETTLEMENTS, floating: SETTLEMENTS, desert: DESERT_PROPS },
}

const SHADOW = { colour: "#000", blur: 16, offsetY: 5, opacity: 0.3 }

const PARCHMENT_LAND = { fill: [239, 227, 189] as Rgb, ink: [52, 38, 26] as Rgb }

const THEMES: Record<SceneBackground, MapTheme> = {
  parchment: {
    ink: PARCHMENT_LAND.ink,
    land: { fill: PARCHMENT_LAND.fill, shadow: SHADOW },
    biomes: muted(PARCHMENT_LAND),
    water: { dark: [96, 66, 36], darkAlpha: 0.42, light: [255, 252, 240], lightAlpha: 0.95 },
    paint: {
      ...PAINT,
      grade: { saturation: 0.92, contrast: 1.03, brightness: 0, tint: [255, 232, 190], tintAmount: 0.1 },
      terrainTint: { tint: [255, 238, 205], amount: 0.06 },
    },
  },
  ocean: {
    ink: [34, 34, 30],
    land: { fill: [129, 119, 80], shadow: SHADOW },
    biomes: BIOMES,
    water: { dark: [8, 38, 58], darkAlpha: 0.45, light: [214, 244, 248], lightAlpha: 0.85 },
    paint: {
      ...PAINT,
      grade: { saturation: 1, contrast: 1.03, brightness: 0, tint: [255, 244, 220], tintAmount: 0.04 },
      terrainTint: { tint: [255, 255, 255], amount: 0 },
    },
  },
}

export const themeFor = (background: SceneBackground) => THEMES[background]
