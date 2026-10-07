import type Konva from "konva"
import { canvasToWebp } from "./encode-webp"
import { MAP_MAX_BYTES } from "./resize-map-image"
import type { PreparedMap } from "./resize-map-image"
import { exportAssets, sharpAssets } from "./map-export-assets"
import { exportBiomes, sharpBiomes } from "./map-export-biomes"
import { exportTerrain, sharpTerrain } from "./map-export-terrain"
import { sharpWater } from "./map-export-water"
import { BUILT_MAX_ZOOM, renderScale } from "./map-scene"
import type { MapScene } from "./map-scene"

// Tried in turn, until the picture fits what the bucket accepts.
const QUALITIES = [0.92, 0.85, 0.75]

// Renders the canvas of a stage to the picture of the map, as large as the
// scene's render size allows, and encodes it as WebP once (no lossless middle
// step, and so no second round of loss). The view is put to one-to-one for the
// instant of the drawing and put back before anything can paint, and the
// layers and groups named "chrome" (what only the editor shows) are left out. Drawing goes
// straight onto a canvas of the picture's size, so the stage itself is never
// resized.
export async function exportCanvas(
  stage: Konva.Stage,
  scene: MapScene
): Promise<PreparedMap> {
  const { canvas } = scene
  // The slow, asynchronous drawing is done before the stage is touched.
  const terrain = await exportTerrain(scene)
  const biomes = exportBiomes(scene, terrain)
  const art = await exportAssets(scene, biomes, terrain)
  // The view, turned and mirrored too, is put back as it was: none of it is the map's.
  const { x, y, rotation, scaleX, scaleY } = stage.attrs
  const chrome = stage.find<Konva.Node>(".chrome")

  chrome.forEach((layer) => layer.hide())
  stage.setAttrs({ x: 0, y: 0, rotation: 0, scaleX: 1, scaleY: 1 })
  let restoreWater = () => {}
  let restoreBiomes = () => {}
  let restoreAssets = () => {}
  let restoreTerrain = () => {}
  let drawn: HTMLCanvasElement
  try {
    restoreWater = sharpWater(stage, scene)
    restoreTerrain = sharpTerrain(stage, terrain)
    restoreBiomes = sharpBiomes(stage, biomes)
    restoreAssets = sharpAssets(stage, art)
    drawn = stage.toCanvas({
      x: 0,
      y: 0,
      width: canvas.width,
      height: canvas.height,
      pixelRatio: renderScale(canvas),
    })
  } finally {
    restoreWater()
    restoreBiomes()
    restoreAssets()
    restoreTerrain()
    stage.setAttrs({ x, y, rotation, scaleX, scaleY })
    chrome.forEach((layer) => layer.show())
  }

  for (const quality of QUALITIES) {
    const blob = await canvasToWebp(drawn, quality)
    if (blob.size <= MAP_MAX_BYTES) {
      return {
        file: new File([blob], "map.webp", { type: "image/webp" }),
        width: drawn.width,
        height: drawn.height,
        maxZoom: BUILT_MAX_ZOOM,
      }
    }
  }
  throw new Error("This map is over 10 MB even at lower quality. Try a simpler map.")
}
