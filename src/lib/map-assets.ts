import type { Biome } from "./biomes/biomes"
import { ownSizeOf } from "./map-asset-sizes"
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

// How wide an asset of a category is drawn before its picture has loaded, as a faint
// blot in the navigator, in canvas pixels. (Placing uses placedWidth, below.) The
// canvas is a few thousand pixels wide. Categories not listed get the fallback.
const DEFAULT_WIDTH: Record<string, number> = {
  mountains: 220,
  "oak-trees": 180,
  "pine-trees": 180,
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
  "oak-trees": 1,
  "pine-trees": 1,
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
// "group" says that the mask marks a group of ground parts, told apart by colour:
// "grass" is the green (the window picks it), "snow" the sunlit sand, "rock" the rest.
export type Recolour = { grass: Window; snow?: boolean; rock?: boolean; keep?: boolean; group?: boolean; base?: Biome | "plains" }
// Towns and towers: the moss, bushes, trees and ivy change. The stone, roofs,
// wood and rocks are ochre and orange, below this hue, so they stay. Plains has
// its own, calmer green, which is the look they rest in.
const SETTLEMENT: Recolour = { grass: { hue: [39, 44], saturation: [0.08, 0.16], light: [1, 1.01] }, base: "plains" }
// Leaves change in every biome. On plains the trunks do too, so the whole tree
// sits in the ground; elsewhere they stay as painted.
const TREE: Recolour = { grass: { hue: [34, 58], saturation: [0.12, 0.3], light: [1, 1.01] }, rock: true, base: "plains" }
const RECOLOURS: Record<string, Recolour> = {
  towns: SETTLEMENT,
  buildings: SETTLEMENT,
  camp: SETTLEMENT,
  floating: SETTLEMENT,
  // The mask marks the ground: sand, scrub and rocks, which change on their own by
  // colour. Everything outside it stays as painted.
  desert: { grass: { hue: [38, 44], saturation: [0.2, 0.3], light: [1, 1.01] }, group: true, base: "plains" },
  "oak-trees": TREE,
  "pine-trees": TREE,
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
export const recolourOf = (category: string): Recolour => RECOLOURS[categoryKey(category)] ?? TREE
// Art that is part of the ground, like grass tufts, casts no shadow.
const NO_SHADOW = new Set(["nature"])
export const castsShadow = (category: string) => !NO_SHADOW.has(categoryKey(category))
export const defaultWidth = (category: string) => DEFAULT_WIDTH[categoryKey(category)] ?? FALLBACK_WIDTH

// How big a piece of art is when placed. Whatever its picture, the square root of the
// area its painted part covers, in canvas pixels, is the same for all of a size, so a
// tall tower and a wide ridge look alike in size; and the size is set by what the art is:
// mountains are larger than towns, and towns larger than trees. The longest side is held
// to a bit under twice the size, so a very long piece does not run away.
const PLACED_SIZE = 150
const LONGEST_SIDE = 270

// How large a category is next to the largest, which is 1. Looked up by folder name
// (see categoryKey); both spellings of a few are here, as the folders may be renamed.
// A category that is not listed gets the one below.
const CATEGORY_SIZE: Record<string, number> = {
  mountains: 1,
  volcanos: 1,
  volcanoes: 1,
  cities: 0.8,
  hills: 0.7,
  towns: 0.55,
  camp: 0.5,
  camps: 0.5,
  villages: 0.4,
  buildings: 0.4,
  landmarks: 0.4,
  trees: 0.25,
  "oak-trees": 0.25,
  "pine-trees": 0.25,
  "desert-trees": 0.25,
  nature: 0.18,
}
const UNLISTED_SIZE = 0.5
// A piece of art can have a size of its own, by its id (its path under map-assets, as in
// "towns/castle.png"), in sizes.json: see map-asset-sizes. It replaces its category's.

// The size a piece of art gets from its category, or the one for categories not listed.
export const categorySizeOf = (assetId: string) =>
  CATEGORY_SIZE[categoryKey(assetById(assetId)?.category ?? "")] ?? UNLISTED_SIZE

// The size, relative to the largest, of a piece as it is now: how much the area of its
// painted part is of the area that size has. A piece stretched out of shape gives a fair
// size, as it would if it were put back in shape with the same area.
export const sizeOfPlaced = (trim: { width: number; height: number }, scaleX: number, scaleY: number) =>
  Math.sqrt(trim.width * Math.abs(scaleX) * trim.height * Math.abs(scaleY)) / PLACED_SIZE

// The width, on the canvas, to place a piece of art whose painted part is this many
// pixels across and down, whatever the zoom: art is the same size on the map wherever it
// is placed. A size given to the piece itself is used as it is; the category's is held
// to the longest side.
export function placedWidth(assetId: string, trim: { width: number; height: number }) {
  const own = ownSizeOf(assetId)
  const size = own ?? categorySizeOf(assetId)
  const even = PLACED_SIZE * size * Math.sqrt(trim.width / trim.height)
  const longest = Math.max(trim.width, trim.height)
  return own === undefined ? Math.min(even, (LONGEST_SIDE * size * trim.width) / longest) : even
}

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
