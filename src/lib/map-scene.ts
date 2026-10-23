// The editable scene behind a built map. All geometry is in canvas pixels; the
// canvas has one of a few fixed sizes, so nothing is stretched. Pins on the
// rendered image stay percentages of the image, as for any map.
//
// "version" is the format version: when the shape of a scene changes, readScene
// upgrades older ones. Layers draw in a fixed order: background, land, biomes,
// details, assets.
import type { MultiPolygon, Pair } from "polygon-clipping"
import { EMPTY_PAINT } from "./biomes/paint-tiles"
import type { Paint } from "./biomes/paint-tiles"
import { clipToCanvas } from "./map-land-clip"
import { sizeProblem } from "./map-canvas-size"
import { readPins } from "./map-pins"
import { DEFAULT_STYLE, readStyle } from "./map-style"
import type { MapStyle } from "./map-style"

export const SCENE_VERSION = 1

// The keys of the first three are what scenes saved before custom sizes hold.
export type CanvasPreset = "3:2" | "16:9" | "4:3" | "square" | "2:3" | "9:16" | "3:2-large"
export type SceneBackground = "ocean"

// The sizes the New map dialog offers, in its order. Any size within the limits of
// map-canvas-size.ts is allowed; one that is none of these is saved as "custom".
export const CANVAS_PRESETS: Record<
  CanvasPreset,
  { label: string; width: number; height: number }
> = {
  "3:2": { label: "Landscape", width: 3072, height: 2048 },
  "16:9": { label: "Widescreen", width: 3840, height: 2160 },
  "4:3": { label: "Standard", width: 3072, height: 2304 },
  square: { label: "Square", width: 3072, height: 3072 },
  "2:3": { label: "Portrait", width: 2048, height: 3072 },
  "9:16": { label: "Tall", width: 2160, height: 3840 },
  "3:2-large": { label: "Large landscape", width: 6144, height: 4096 },
}

export const BACKGROUNDS: Record<SceneBackground, { label: string }> = {
  ocean: { label: "Ocean" },
}

// The preset a size is exactly, or "custom".
export function presetFor(width: number, height: number): CanvasPreset | "custom" {
  const found = (Object.keys(CANVAS_PRESETS) as CanvasPreset[]).find(
    (key) => CANVAS_PRESETS[key].width === width && CANVAS_PRESETS[key].height === height
  )
  return found ?? "custom"
}

export type MapScene = {
  version: typeof SCENE_VERSION
  canvas: {
    // Only a label: the size is the width and height.
    preset: CanvasPreset | "custom"
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
  // Points of the land's outline that the coast's rounding leaves as they are: see map-pins.ts.
  pinned: Pair[]
  style: MapStyle
  // The biomes painted over the land. In the database this is kept as "biomes",
  // squeezed into text, and is read back by fetchMapScene.
  paint: Paint
  // The details (paths, gravel, rivers) painted over the biomes, on a finer grid. In
  // the database this is kept as "details".
  details: Paint
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

export type CanvasChoice = { width: number; height: number; background: SceneBackground }

export function createScene({ width, height, background }: CanvasChoice): MapScene {
  return {
    version: SCENE_VERSION,
    canvas: { preset: presetFor(width, height), width, height, background, seed: Math.floor(Math.random() * 2 ** 31) },
    land: [],
    pinned: [],
    style: DEFAULT_STYLE,
    paint: EMPTY_PAINT,
    details: EMPTY_PAINT,
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
  if (!(preset in CANVAS_PRESETS) && preset !== "custom") return null
  if (!(background in BACKGROUNDS) || typeof seed !== "number") return null
  // The stored size, if it is one a canvas may have; otherwise the preset's. Parts
  // added to the format later start empty in scenes saved before them.
  const stored = scene.canvas as { width?: unknown; height?: unknown }
  const valid =
    typeof stored.width === "number" && typeof stored.height === "number" && sizeProblem(stored.width, stored.height) === null
  const size = valid ? { width: stored.width as number, height: stored.height as number } : preset === "custom" ? null : CANVAS_PRESETS[preset]
  if (!size) return null
  const { width, height } = size
  return {
    version: SCENE_VERSION,
    canvas: { preset, width, height, background, seed },
    land: readLand(scene.land, { width, height }),
    pinned: readPins(scene.pinned),
    style: readStyle(scene.style),
    paint: EMPTY_PAINT,
    details: EMPTY_PAINT,
    assets: Array.isArray(scene.assets) ? scene.assets.filter(isPlacedAsset) : [],
  }
}

// A built map's picture is rendered as large as fits in this many pixels,
// whatever the canvas shape: a bigger picture can fail to load on a phone,
// leaving the map blank or reloading the tab, however it was made.
export const RENDER_PIXELS = 16_000_000

// No more than this many times the canvas: past it a small canvas would only be
// blown up into a large file.
const MAX_RENDER_SCALE = 2

// How many times larger than the canvas the picture is drawn, so that it has
// RENDER_PIXELS (at most) and the canvas's proportions.
export const renderScale = ({ width, height }: { width: number; height: number }) =>
  Math.min(MAX_RENDER_SCALE, Math.sqrt(RENDER_PIXELS / (width * height)))

// How far the viewer may zoom into a built map: two screen pixels to each pixel
// of the picture, which is one device pixel on a sharp screen. Past that there
// is nothing more to see, only blur.
export const BUILT_MAX_ZOOM = 1
