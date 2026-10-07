import { css } from "./colour"
import type { Rgb } from "./colour"
import type { AssetInfo } from "./map-assets"

// A piece of art read as ink, made at the size it is drawn at. Ink art is black
// lines (grey where lighter), pure white where the shape is solid, and
// transparent outside it:
// - "ink" is the lines in the map's ink colour, as strong as the pixel is dark;
// - "solid" is the shape: every pixel the art covers, white or ink alike, which
//   is where the ground shows through;
// - "preview" is the shape in flat colour with the ink on it, for drawing a
//   piece while it is moved.
export type Art = { ink: HTMLCanvasElement; solid: HTMLCanvasElement; preview: HTMLCanvasElement }

// Sizes are rounded up to steps this far apart, so the art is only ever drawn a
// little smaller than it was made, never larger, and pieces of nearly one size
// share the same pictures.
const STEP = 1.15
// Most pixels kept over all the art made; the longest unused goes first.
const LIMIT = 40_000_000

const cache = new Map<string, { art: Art; pixels: number }>()
let used = 0

const sized = (width: number) =>
  Math.max(16, Math.round(STEP ** Math.ceil(Math.log(Math.max(width, 1)) / Math.log(STEP))))

function canvasOf(width: number, height: number) {
  const canvas = document.createElement("canvas")
  canvas.width = width
  canvas.height = height
  return canvas
}

// The art for a kind of art, drawn "width" pixels wide, in the given colours.
// It is made from the picture itself at that size, so an SVG stays sharp.
export function artFor(id: string, info: AssetInfo, width: number, ink: Rgb, fill: Rgb): Art {
  const w = sized(width)
  const key = `${id}|${w}|${css(ink)}|${css(fill)}`
  const known = cache.get(key)
  if (known) {
    cache.delete(key)
    cache.set(key, known)
    return known.art
  }

  const { trim, image } = info
  const h = Math.max(1, Math.round((w * trim.height) / trim.width))
  const look = canvasOf(w, h).getContext("2d", { willReadFrequently: true })!
  look.drawImage(image, trim.x, trim.y, trim.width, trim.height, 0, 0, w, h)
  const { data } = look.getImageData(0, 0, w, h)

  const inkPixels = new ImageData(w, h)
  const solidPixels = new ImageData(w, h)
  for (let i = 0; i < data.length; i += 4) {
    const alpha = data[i + 3]
    if (alpha === 0) continue
    const light = (0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]) / 255
    inkPixels.data[i] = ink[0]
    inkPixels.data[i + 1] = ink[1]
    inkPixels.data[i + 2] = ink[2]
    inkPixels.data[i + 3] = alpha * (1 - light)
    solidPixels.data[i] = solidPixels.data[i + 1] = solidPixels.data[i + 2] = 255
    solidPixels.data[i + 3] = alpha
  }
  const art = { ink: canvasOf(w, h), solid: canvasOf(w, h), preview: canvasOf(w, h) }
  art.ink.getContext("2d")!.putImageData(inkPixels, 0, 0)
  art.solid.getContext("2d")!.putImageData(solidPixels, 0, 0)

  const flat = art.preview.getContext("2d")!
  flat.drawImage(art.solid, 0, 0)
  flat.globalCompositeOperation = "source-in"
  flat.fillStyle = css(fill)
  flat.fillRect(0, 0, w, h)
  flat.globalCompositeOperation = "source-over"
  flat.drawImage(art.ink, 0, 0)

  const pixels = w * h * 3
  cache.set(key, { art, pixels })
  used += pixels
  for (const [oldest, entry] of cache) {
    if (used <= LIMIT || cache.size <= 1) break
    cache.delete(oldest)
    used -= entry.pixels
  }
  return art
}
