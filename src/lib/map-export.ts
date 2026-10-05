import type Konva from "konva"

// Renders the canvas of a stage to an image file, at the canvas's own size and
// whatever the view is showing. The stage is put to one-to-one for the instant
// of the drawing and put back before anything can paint, and the layers named
// "chrome" (what only the editor shows) are left out.
export async function exportCanvas(
  stage: Konva.Stage,
  canvas: { width: number; height: number }
) {
  const { x, y } = stage.position()
  const scale = stage.scaleX()
  const { width, height } = stage.size()
  const chrome = stage.find<Konva.Layer>(".chrome")

  chrome.forEach((layer) => layer.hide())
  stage.scale({ x: 1, y: 1 })
  stage.position({ x: 0, y: 0 })
  stage.size(canvas)
  const drawn = stage.toCanvas({ pixelRatio: 1 })
  stage.size({ width, height })
  stage.scale({ x: scale, y: scale })
  stage.position({ x, y })
  chrome.forEach((layer) => layer.show())

  // Lossless here; the upload converts to WebP once.
  const blob = await new Promise<Blob | null>((resolve) => drawn.toBlob(resolve, "image/png"))
  if (!blob) throw new Error("Could not render the map.")
  return new File([blob], "map.png", { type: "image/png" })
}
