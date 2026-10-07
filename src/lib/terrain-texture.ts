import { random, smooth, valueNoise } from "./map-noise"
import { grade, tint } from "./map-asset-pixels"
import type { SceneBackground } from "./map-scene"
import { themeFor } from "./map-theme"

// How many canvas pixels one tile covers. A tile is made at two to four pixels
// to each of those, so that it stays sharp in the published picture.
export const TILE_SPAN = 512

// The second copy of a tile is drawn this much larger than the first, and turned
// a quarter, so that its marks never line up with the first's.
const SECOND_SCALE = 1.37
// How big the patches are in which one copy or the other shows, and the larger
// ones over which the light and dark of the ground drift, in canvas pixels.
const PATCH = 320
const DRIFT = 1100
// How far the light and dark drift, as the strength of the overlay.
const DRIFT_AMOUNT = 0.3
// The noise that picks the patches is worked out at this many canvas pixels to
// each of its own.
const MASK_STEP = 32

type Canvas = { width: number; height: number; seed: number }

const canvasOf = (w: number, h: number) => {
  const canvas = document.createElement("canvas")
  canvas.width = w
  canvas.height = h
  return canvas
}

const graded = new WeakMap<HTMLImageElement, Map<SceneBackground, HTMLCanvasElement>>()

// The tile as it is used: the map's colour grade over it, and a light tint, and
// nothing else, so that it looks as it was painted.
function gradedTile(image: HTMLImageElement, background: SceneBackground) {
  const known = graded.get(image)?.get(background)
  if (known) return known
  const w = image.naturalWidth
  const h = image.naturalHeight
  const canvas = canvasOf(w, h)
  const context = canvas.getContext("2d", { willReadFrequently: true })!
  context.drawImage(image, 0, 0)
  const data = context.getImageData(0, 0, w, h)
  const look = themeFor(background).paint
  grade(data.data, look.grade, 0)
  tint(data.data, look.terrainTint.tint, look.terrainTint.amount)
  context.putImageData(data, 0, 0)
  const byBackground = graded.get(image) ?? new Map()
  byBackground.set(background, canvas)
  graded.set(image, byBackground)
  return canvas
}

// A soft low-resolution picture of noise, stretched over the canvas when drawn:
// white with the noise as its opacity, or grey with it as its tone.
function noiseMask(canvas: Canvas, cell: number, seed: number, toAlpha: boolean) {
  const w = Math.ceil(canvas.width / MASK_STEP)
  const h = Math.ceil(canvas.height / MASK_STEP)
  const noise = valueNoise(canvas.width, canvas.height, cell, random(seed))
  const out = new ImageData(w, h)
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const n = noise(x * MASK_STEP, y * MASK_STEP)
      const at = (y * w + x) * 4
      if (toAlpha) {
        out.data[at] = out.data[at + 1] = out.data[at + 2] = 255
        out.data[at + 3] = smooth(Math.min(Math.max((n - 0.3) / 0.4, 0), 1)) * 255
      } else {
        const tone = 128 + (n - 0.5) * 2 * 90
        out.data[at] = out.data[at + 1] = out.data[at + 2] = tone
        out.data[at + 3] = 255
      }
    }
  }
  const mask = canvasOf(w, h)
  mask.getContext("2d")!.putImageData(out, 0, 0)
  return mask
}

// The painted tile laid over the whole canvas, at "scale" pixels to each canvas
// pixel, without a visible repeat. Plain tiling shows the same marks every 512
// pixels, so a second copy, larger and turned, is mixed in over soft patches of
// noise, and the light and dark of the ground drift a little over larger ones.
// The same seed always makes the same picture. "kind" only varies the noise, so
// that sea and land do not drift together.
export function terrainTexture(
  image: HTMLImageElement,
  kind: number,
  canvas: Canvas,
  background: SceneBackground,
  scale: number,
  // For tuning and tests: the size of the patches, in canvas pixels.
  patch = PATCH
) {
  const tile = gradedTile(image, background)
  const w = Math.round(canvas.width * scale)
  const h = Math.round(canvas.height * scale)
  const out = canvasOf(w, h)
  const context = out.getContext("2d")!
  context.imageSmoothingQuality = "high"
  const seed = (canvas.seed ^ (kind * 0x9e3779b1)) >>> 0

  const lay = (target: CanvasRenderingContext2D, span: number, turn: boolean) => {
    const pattern = target.createPattern(tile, "repeat")!
    const k = (span * scale) / tile.width
    // Offsets so that the copies do not meet at the same corner.
    pattern.setTransform(turn ? new DOMMatrix().translate(span * scale * 0.37, 0).rotate(90).scale(k) : new DOMMatrix().scale(k))
    target.fillStyle = pattern
    target.fillRect(0, 0, w, h)
  }
  lay(context, TILE_SPAN, false)

  const second = canvasOf(w, h)
  const secondContext = second.getContext("2d")!
  lay(secondContext, TILE_SPAN * SECOND_SCALE, true)
  secondContext.globalCompositeOperation = "destination-in"
  secondContext.imageSmoothingQuality = "high"
  secondContext.drawImage(noiseMask(canvas, patch, seed, true), 0, 0, w, h)
  context.drawImage(second, 0, 0)

  context.globalCompositeOperation = "overlay"
  context.globalAlpha = DRIFT_AMOUNT
  context.drawImage(noiseMask(canvas, DRIFT, seed ^ 0x5bd1e995, false), 0, 0, w, h)
  return out
}
