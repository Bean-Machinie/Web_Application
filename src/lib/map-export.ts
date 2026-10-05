import type Konva from "konva"
import { MAP_MAX_BYTES } from "./resize-map-image"
import type { PreparedMap } from "./resize-map-image"
import { BUILT_MAX_ZOOM, renderScale } from "./map-scene"

// Tried in turn, until the picture fits what the bucket accepts.
const QUALITIES = [0.92, 0.85, 0.75]

// Renders the canvas of a stage to the picture of the map, as large as the
// scene's render size allows, and encodes it as WebP once (no lossless middle
// step, and so no second round of loss). The view is put to one-to-one for the
// instant of the drawing and put back before anything can paint, and the
// layers named "chrome" (what only the editor shows) are left out. Drawing goes
// straight onto a canvas of the picture's size, so the stage itself is never
// resized.
export async function exportCanvas(
  stage: Konva.Stage,
  canvas: { width: number; height: number }
): Promise<PreparedMap> {
  const { x, y } = stage.position()
  const scale = stage.scaleX()
  const chrome = stage.find<Konva.Layer>(".chrome")

  chrome.forEach((layer) => layer.hide())
  stage.scale({ x: 1, y: 1 })
  stage.position({ x: 0, y: 0 })
  const drawn = stage.toCanvas({
    x: 0,
    y: 0,
    width: canvas.width,
    height: canvas.height,
    pixelRatio: renderScale(canvas),
  })
  stage.scale({ x: scale, y: scale })
  stage.position({ x, y })
  chrome.forEach((layer) => layer.show())

  for (const quality of QUALITIES) {
    const blob = await new Promise<Blob | null>((resolve) =>
      drawn.toBlob(resolve, "image/webp", quality)
    )
    if (!blob || blob.type !== "image/webp") {
      throw new Error("This browser could not convert the map to WebP.")
    }
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
