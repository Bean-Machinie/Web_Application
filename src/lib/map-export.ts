import type Konva from "konva"
import { canvasToWebp } from "./encode-webp"
import { MAP_MAX_BYTES } from "./resize-map-image"
import type { PreparedMap } from "./resize-map-image"
import { exportAssets, sharpAssets } from "./map-export-assets"
import { exportBiomes, sharpBiomes } from "./map-export-biomes"
import { smoothLand } from "./map-coast-smooth"
import { exportDetails, sharpDetails } from "./map-export-details"
import { pinSet } from "./map-pins"
import { exportTerrain, sharpTerrain } from "./map-export-terrain"
import { sharpWater } from "./map-export-water"
import { BUILT_MAX_ZOOM, renderScale } from "./map-scene"
import type { MapScene } from "./map-scene"

// Tried in turn, until the picture fits what the bucket accepts.
const QUALITIES = [0.92, 0.85, 0.75]

// Draws the scene on a stage to the picture of the map. The scale is how many times larger
// than the canvas it is drawn: the most the scene's render size allows, for publishing, and
// less for a preview. The view is put to one-to-one for the instant of the drawing and put
// back before anything can paint, and the layers and groups named "chrome" (what only the
// editor shows) are left out. Drawing goes straight onto a canvas of the picture's size, so
// the stage itself is never resized. Nothing is saved or uploaded here.
export async function drawScene(
  stage: Konva.Stage,
  scene: MapScene,
  scale = renderScale(scene.canvas)
): Promise<HTMLCanvasElement> {
  const { canvas } = scene
  // The slow, asynchronous drawing is done before the stage is touched.
  const terrain = await exportTerrain(scene, scale)
  const biomes = exportBiomes(scene, terrain, scale)
  const details = exportDetails(scene, terrain, smoothLand(scene.land, scene.style.roundness, canvas, pinSet(scene.pinned)), scale)
  const art = await exportAssets(scene, biomes, terrain, scale)
  // The view, turned and mirrored too, is put back as it was: none of it is the map's.
  const { x, y, rotation, scaleX, scaleY } = stage.attrs
  const chrome = stage.find<Konva.Node>(".chrome")

  chrome.forEach((layer) => layer.hide())
  stage.setAttrs({ x: 0, y: 0, rotation: 0, scaleX: 1, scaleY: 1 })
  let restoreWater = () => {}
  let restoreBiomes = () => {}
  let restoreDetails = () => {}
  let restoreAssets = () => {}
  let restoreTerrain = () => {}
  let drawn: HTMLCanvasElement
  try {
    restoreWater = sharpWater(stage, scene, scale)
    restoreTerrain = sharpTerrain(stage, terrain)
    restoreBiomes = sharpBiomes(stage, biomes)
    restoreDetails = sharpDetails(stage, details)
    restoreAssets = sharpAssets(stage, art)
    drawn = stage.toCanvas({
      x: 0,
      y: 0,
      width: canvas.width,
      height: canvas.height,
      pixelRatio: scale,
    })
  } finally {
    restoreWater()
    restoreBiomes()
    restoreDetails()
    restoreAssets()
    restoreTerrain()
    stage.setAttrs({ x, y, rotation, scaleX, scaleY })
    chrome.forEach((layer) => layer.show())
  }

  return drawn
}

// Draws the scene for publishing, as large as its render size allows, and encodes it as WebP
// once (no lossless middle step, and so no second round of loss).
export async function exportCanvas(
  stage: Konva.Stage,
  scene: MapScene
): Promise<PreparedMap> {
  const drawn = await drawScene(stage, scene)

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
