import { random, smooth } from "../map-noise"
import { DETAIL_LOOK, DETAILS } from "./details"
import type { Detail } from "./details"

// How many canvas pixels one tile of grain covers.
const GRAIN_SPAN = 192
// The coarse blotches in it are this many canvas pixels across.
const BLOTCH = 24

// A grid of random values that joins up with itself at the edges, read with
// smooth blending, so that the tile repeats without a seam.
function wrapping(size: number, cell: number, next: () => number) {
  const count = Math.max(Math.round(size / cell), 1)
  const grid = Float32Array.from({ length: count * count }, next)
  return (x: number, y: number) => {
    const gx = (x / size) * count
    const gy = (y / size) * count
    const x0 = Math.floor(gx)
    const y0 = Math.floor(gy)
    const tx = smooth(gx - x0)
    const ty = smooth(gy - y0)
    const at = (cx: number, cy: number) => grid[(cy % count) * count + (cx % count)]
    const top = at(x0, y0) + (at(x0 + 1, y0) - at(x0, y0)) * tx
    const bottom = at(x0, y0 + 1) + (at(x0 + 1, y0 + 1) - at(x0, y0 + 1)) * tx
    return top + (bottom - top) * ty
  }
}

const made = new Map<string, HTMLCanvasElement>()

// A repeating tile of a detail's ground: its colour with fine grain and soft
// blotches over it, "pixels" across. Made once for each size.
export function detailTile(detail: Detail, pixels: number) {
  const key = `${detail}:${pixels}`
  const known = made.get(key)
  if (known) return known
  const { colour, grain } = DETAIL_LOOK[detail]
  const next = random(0x9e3779b1 * (DETAILS.indexOf(detail) + 1))
  const blotch = wrapping(pixels, (BLOTCH * pixels) / GRAIN_SPAN, next)
  const canvas = Object.assign(document.createElement("canvas"), { width: pixels, height: pixels })
  const context = canvas.getContext("2d")!
  const image = context.createImageData(pixels, pixels)
  for (let y = 0; y < pixels; y++) {
    for (let x = 0; x < pixels; x++) {
      const tone = 1 + ((blotch(x, y) - 0.5) * 0.7 + (next() - 0.5)) * grain * 2
      const at = (y * pixels + x) * 4
      for (let c = 0; c < 3; c++) image.data[at + c] = Math.min(255, colour[c] * tone)
      image.data[at + 3] = 255
    }
  }
  context.putImageData(image, 0, 0)
  made.set(key, canvas)
  return canvas
}

// How many pixels a tile of grain is across when the picture has "scale" pixels to
// a canvas pixel.
export const grainPixels = (scale: number) => Math.max(16, Math.round(GRAIN_SPAN * scale))
