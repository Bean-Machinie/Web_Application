// The editable scene behind a built map. All geometry is in canvas pixels; the
// canvas has one of a few fixed sizes, so nothing is stretched. Pins on the
// rendered image stay percentages of the image, as for any map.
//
// "version" is the format version: when the shape of a scene changes, readScene
// upgrades older ones. Layers draw in a fixed order: background, land, roads,
// assets.
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
}

export type CanvasChoice = { preset: CanvasPreset; background: SceneBackground }

export function createScene({ preset, background }: CanvasChoice): MapScene {
  const { width, height } = CANVAS_PRESETS[preset]
  return {
    version: SCENE_VERSION,
    canvas: { preset, width, height, background, seed: Math.floor(Math.random() * 2 ** 31) },
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
  return createSceneFrom(scene as MapScene)
}

// The canvas size comes from the preset, never from what was stored.
function createSceneFrom(scene: MapScene): MapScene {
  const { width, height } = CANVAS_PRESETS[scene.canvas.preset]
  return { ...scene, canvas: { ...scene.canvas, width, height } }
}
