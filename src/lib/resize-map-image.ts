import { canvasToWebp } from "./encode-webp"

// A map ready to upload: a WebP file, its size in pixels, and how far the viewer
// may zoom into it, if that is not the usual.
export type PreparedMap = { file: File; width: number; height: number; maxZoom?: number }

// The longest side of a map after shrinking, so it stays quick on phones.
const MAX_SIDE = 4096
const QUALITY = 0.85
export const MAP_MAX_BYTES = 10 * 1024 * 1024
export const MAP_INPUT_TYPES = "image/png,image/jpeg,image/webp,image/gif"

// Shrinks a map to at most 4096 px on its longest side and converts it to
// WebP, in the browser, before it is uploaded.
export async function prepareMapImage(file: File): Promise<PreparedMap> {
  const bitmap = await createImageBitmap(file).catch(() => {
    throw new Error("Could not read that image.")
  })
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height))
  const width = Math.round(bitmap.width * scale)
  const height = Math.round(bitmap.height * scale)

  const canvas = document.createElement("canvas")
  canvas.width = width
  canvas.height = height
  const context = canvas.getContext("2d")!
  context.imageSmoothingQuality = "high"
  context.drawImage(bitmap, 0, 0, width, height)
  bitmap.close()

  const blob = await canvasToWebp(canvas, QUALITY)
  if (blob.size > MAP_MAX_BYTES) {
    throw new Error("This map is still over 10 MB after shrinking. Try a simpler image.")
  }

  return { file: new File([blob], "map.webp", { type: "image/webp" }), width, height }
}
