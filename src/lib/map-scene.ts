// The editable scene behind a built map. All geometry is in canvas pixels; the
// canvas has one of a few fixed sizes, so nothing is stretched. Pins on the
// rendered image stay percentages of the image, as for any map.
//
// "version" is the format version: when the shape of a scene changes, readScene
// upgrades older ones. Layers draw in a fixed order: background, land, roads,
// assets.
import type { MultiPolygon } from "polygon-clipping"
import { clipToCanvas } from "./map-land-clip"
import { DEFAULT_STYLE, readStyle } from "./map-style"
import type { MapStyle } from "./map-style"

export const SCENE_VERSION = 1

export type CanvasPreset = "3:2" | "16:9" | "square"
export type SceneBackground = "parchment" | "ocean"

// Longest side at most 4096, which is what uploaded maps are shrunk to too.
export const CANVAS_PRESETS: Record<
  CanvasPreset,
  { label: string; width: number; height: number }
> = {
  "3:2": { label: "Landscape 3:2", width: 3072, height: 2048 },
  "16:9": { label: "Widescreen 16:9", width: 3840, height: 2160 },
  square: { label: "Square", width: 3072, height: 3072 },
}

export const BACKGROUNDS: Record<SceneBackground, { label: string }> = {
  parchment: { label: "Parchment" },
  ocean: { label: "Ocean" },
}

export type MapScene = {
  version: typeof SCENE_VERSION
  canvas: {
    preset: CanvasPreset
    width: number
    height: number
    background: SceneBackground
    // Seeds the background's noise, so every render looks the same.
    seed: number
  }
  // All the land as one merged shape: polygons with their holes, as rings of
  // [x, y] points in canvas pixels, as drawn and never past the canvas's edge.
  // Empty until something is drawn.
  land: MultiPolygon
  style: MapStyle
  assets: PlacedAsset[]
}

// A piece of art placed on the map. "x" and "y" are where its centre is, in
// canvas pixels. The scales multiply the picture's own size and are signed:
// a negative one is a flip. The rotation is in degrees. Assets draw in list
// order, the last on top.
export type PlacedAsset = {
  id: string
  // The asset's id in the library: its path under src/assets/map-assets.
  asset: string
  x: number
  y: number
  scaleX: number
  scaleY: number
  rotation: number
}

export type CanvasChoice = { preset: CanvasPreset; background: SceneBackground }

export function createScene({ preset, background }: CanvasChoice): MapScene {
  const { width, height } = CANVAS_PRESETS[preset]
  return {
    version: SCENE_VERSION,
    canvas: { preset, width, height, background, seed: Math.floor(Math.random() * 2 ** 31) },
    land: [],
    style: DEFAULT_STYLE,
    assets: [],
  }
}

const isPlacedAsset = (value: unknown): value is PlacedAsset => {
  const asset = value as Partial<PlacedAsset> | null
  return (
    typeof asset?.id === "string" &&
    typeof asset.asset === "string" &&
    [asset.x, asset.y, asset.scaleX, asset.scaleY, asset.rotation].every(
      (number) => typeof number === "number" && Number.isFinite(number)
    )
  )
}

// Land saved before it was kept inside the canvas is cut to it now. A shape
// that cannot be clipped is kept as it is.
function readLand(land: unknown, canvas: { width: number; height: number }): MultiPolygon {
  if (!Array.isArray(land)) return []
  try {
    return clipToCanvas(land, canvas)
  } catch {
    return land
  }
}

// Turns what the database holds into a scene of the current format, or null if
// it is not one this builder understands.
export function readScene(json: unknown): MapScene | null {
  const scene = json as Partial<MapScene> | null
  if (scene?.version !== SCENE_VERSION || !scene.canvas) return null
  const { preset, background, seed } = scene.canvas
  if (!(preset in CANVAS_PRESETS) || !(background in BACKGROUNDS)) return null
  if (typeof seed !== "number") return null
  // The canvas size comes from the preset, never from what was stored. Parts
  // added to the format later start empty in scenes saved before them.
  const { width, height } = CANVAS_PRESETS[preset]
  return {
    version: SCENE_VERSION,
    canvas: { preset, width, height, background, seed },
    land: readLand(scene.land, { width, height }),
    style: readStyle(scene.style),
    assets: Array.isArray(scene.assets) ? scene.assets.filter(isPlacedAsset) : [],
  }
}

// A built map's picture is rendered as large as fits in this many pixels,
// whatever the canvas shape: a bigger picture can fail to load on a phone,
// leaving the map blank or reloading the tab, however it was made.
export const RENDER_PIXELS = 16_000_000

// How many times larger than the canvas the picture is drawn, so that it has
// RENDER_PIXELS (at most) and the canvas's proportions.
export const renderScale = ({ width, height }: { width: number; height: number }) =>
  Math.sqrt(RENDER_PIXELS / (width * height))

// How far the viewer may zoom into a built map: two screen pixels to each pixel
// of the picture, which is one device pixel on a sharp screen. Past that there
// is nothing more to see, only blur.
export const BUILT_MAX_ZOOM = 1
