import type { Biome } from "./biomes/biomes"
import { shapeOf } from "./map-asset-shape"
import type { AssetShape } from "./map-asset-shape"

// The art that can be placed on a map: every image in
// src/assets/map-assets/<category>/. Dropping a file in a category folder adds
// it to the library, with no list to keep. A file's path under map-assets is
// its id in saved scenes, so a file must not be renamed or moved once maps use
// it.
export type MapAsset = { id: string; category: string; name: string; url: string }

const FILES = import.meta.glob<string>("/src/assets/map-assets/*/*.{svg,png,webp,jpg,jpeg}", {
  eager: true,
  query: "?url",
  import: "default",
})

const words = (file: string) =>
  file
    .replace(/\.[^.]+$/, "")
    .replace(/[-_]+/g, " ")
    .replace(/^./, (letter) => letter.toUpperCase())

// A mask next to a painted piece of art (tree.mask.png beside tree.png) says
// which parts of it may change colour with the biome: white may, black may not.
// It is not art itself, so it is kept out of the library.
const MASK = /\.mask\.(png|webp)$/
const withoutExtension = (id: string) => id.replace(/\.[^.]+$/, "")
const MASKS = new Map(
  Object.entries(FILES)
    .filter(([path]) => MASK.test(path))
    .map(([path, url]) => [withoutExtension(path.split("/map-assets/")[1]).replace(/\.mask$/, ""), url])
)

export const MAP_ASSETS: MapAsset[] = Object.entries(FILES)
  .filter(([path]) => !MASK.test(path))
  .map(([path, url]) => {
    const id = path.split("/map-assets/")[1]
    const [category, file] = id.split("/")
    return { id, category, name: words(file), url }
  })
  .sort((a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name))

export const ASSET_CATEGORIES = [...new Set(MAP_ASSETS.map((asset) => asset.category))]

const BY_ID = new Map(MAP_ASSETS.map((asset) => [asset.id, asset]))
export const assetById = (id: string) => BY_ID.get(id)

export const categoryLabel = (category: string) => words(category)

// The settings below are looked up by a folder's name, with spaces and dashes
// counting the same, so "desert trees" and "desert-trees" are one category.
export const categoryKey = (category: string) => category.toLowerCase().replace(/\s+/g, "-")

// How wide an asset is when first placed, in canvas pixels, by category. The
// canvas is a few thousand pixels wide. Categories not listed get the fallback.
const DEFAULT_WIDTH: Record<string, number> = {
  mountains: 220,
  forests: 180,
  "desert-trees": 180,
  hills: 300,
  volcanos: 280,
  towns: 170,
  nature: 90,
}
const FALLBACK_WIDTH = 160

// How much the ink of art takes on the colour of the ground it stands on, from 0
// (always the map's ink) to 1 (the ground's own ink: dark orange on desert, dark
// green in swamp). Nature follows the ground; buildings only lean toward it.
const INK_FOLLOWS: Record<string, number> = {
  mountains: 1,
  forests: 1,
  towns: 0.25,
}
const FALLBACK_FOLLOWS = 0.6
export const inkFollows = (category: string) => INK_FOLLOWS[categoryKey(category)] ?? FALLBACK_FOLLOWS

// The categories whose painted art changes colour with the biome it stands on,
// and, for each, which colours count as what changes when there is no mask. A
// colour changes from the first value of its hue (in degrees) to fully at the
// second, and likewise by saturation (0 to 1): below the first it stays. "light"
// is how bright (0 to 1) a colour may be: fully up to the first, not at all from
// the second. Trees do, greens and yellow-greens. Mountains change only the
// olive and green grass on their slopes: hue above ochre rock, and not as bright
// as sunlit snow, which is cream. Buildings do not. Ink art never does.
// "cap" is the most saturated a colour may be, likewise: fully up to the first,
// not at all from the second, so vivid petals stay.
export type Window = {
  hue: [number, number]
  saturation: [number, number]
  light: [number, number]
  cap?: [number, number]
}
// "snow" and "rock" say that the art of the category has those surfaces too,
// which each biome treats on its own: snow is found by colour, and rock is what
// is neither snow nor grass.
// "base" is a biome whose colours the art has where no biome is painted (on
// plains) and in that biome itself, so the painting as it was made is only the
// start of that look.
// "keep" says that lava, its glow and smoke stay as painted in every biome.
export type Recolour = { grass: Window; snow?: boolean; rock?: boolean; keep?: boolean; base?: Biome | "plains" }
const RECOLOURS: Record<string, Recolour> = {
  forests: { grass: { hue: [34, 58], saturation: [0.12, 0.3], light: [1, 1.01] } },
  // Golden leaves and olive leaf shadows change; the orange trunk is the rock.
  // Golden meadow and orange-brown ridges: the meadow changes, and so do the ridges
  // and teal shadows, which are the rock. Plains has its own look, green.
  hills: { grass: { hue: [36, 46], saturation: [0.25, 0.4], light: [1, 1.01] }, rock: true, base: "plains" },
  "desert-trees": { grass: { hue: [34, 40], saturation: [0.5, 0.62], light: [1, 1.01] }, rock: true, base: "desert" },
  // Olive, green and golden slopes change, and so do the dark cone and its cooled
  // lava, which are the rock. Lava and smoke stay. Plains keeps the painting.
  volcanos: { grass: { hue: [31, 36], saturation: [0.15, 0.25], light: [1, 1.01] }, rock: true, keep: true },
  // Grass tufts change as a whole. In flowers the same range picks the olive
  // stems and leaves; the vivid petals are too saturated or too light to change.
  nature: { grass: { hue: [20, 28], saturation: [0.12, 0.2], light: [0.9, 0.95], cap: [0.68, 0.78] }, base: "plains" },
  mountains: { grass: { hue: [35, 41], saturation: [0.08, 0.16], light: [0.74, 0.86] }, snow: true, rock: true },
}
export const recolours = (category: string) => categoryKey(category) in RECOLOURS
export const recolourOf = (category: string): Recolour => RECOLOURS[categoryKey(category)] ?? RECOLOURS.forests
// Art that is part of the ground, like grass tufts, casts no shadow.
const NO_SHADOW = new Set(["nature"])
export const castsShadow = (category: string) => !NO_SHADOW.has(categoryKey(category))
export const defaultWidth = (category: string) => DEFAULT_WIDTH[categoryKey(category)] ?? FALLBACK_WIDTH

// A loaded picture, and what was worked out about it once (see map-asset-shape).
// "mask" is the picture saying what may change colour, where there is one.
export type AssetInfo = AssetShape & { image: HTMLImageElement; mask: HTMLImageElement | null }

// Pictures are loaded and measured once and kept, so placing and drawing never
// wait twice, and copies on a map share the work.
const loading = new Map<string, Promise<AssetInfo | null>>()
const loaded = new Map<string, AssetInfo>()

const loadImage = (url: string) =>
  new Promise<HTMLImageElement | null>((resolve) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => resolve(null)
    image.src = url
  })

export function loadAssetInfo(id: string) {
  const known = loading.get(id)
  if (known) return known
  const asset = assetById(id)
  const promise = new Promise<AssetInfo | null>((resolve) => {
    if (!asset) return resolve(null)
    const image = new Image()
    image.onload = async () => {
      const shape = shapeOf(image)
      const maskUrl = shape.colour && recolours(asset.category) ? MASKS.get(withoutExtension(id)) : undefined
      const info = { image, mask: maskUrl ? await loadImage(maskUrl) : null, ...shape }
      loaded.set(id, info)
      resolve(info)
    }
    image.onerror = () => resolve(null)
    image.src = asset.url
  })
  loading.set(id, promise)
  return promise
}

export const loadedAssetInfo = (id: string) => loaded.get(id)
