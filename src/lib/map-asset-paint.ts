import type { Biome } from "./biomes/biomes"
import { amounts, lightRange, recolour, rampTable } from "./map-asset-recolour"
import { footShadow, grade, sharpen } from "./map-asset-pixels"
import { sized } from "./map-asset-art"
import type { AssetInfo } from "./map-assets"
import type { SceneBackground } from "./map-scene"
import { themeFor } from "./map-theme"

// Art painted in colour, made at the size it is drawn at: the picture shrunk with
// care, sharpened a little for the shrinking, graded to the map, and given its
// shadow; and, for art that changes with the biome, a version for each biome,
// made when first wanted.
export type PaintedArt = {
  base: HTMLCanvasElement
  // The shadow, and where it goes, in this art's own pixels from its top left.
  shadow: { canvas: HTMLCanvasElement; left: number; top: number }
  // The art as it looks in a biome, or null if nothing in it changes.
  variant: (biome: Biome) => HTMLCanvasElement | null
  // The width the art was made at.
  width: number
}

// Most pixels kept over all the painted art made; the longest unused goes first.
const LIMIT = 40_000_000

const cache = new Map<string, { art: PaintedArt; pixels: number }>()
const grown = new Map<string, number>()
let used = 0

const canvasOf = (w: number, h: number) => {
  const canvas = document.createElement("canvas")
  canvas.width = w
  canvas.height = h
  return canvas
}

// The picture at halving sizes, the largest first, so that shrinking it a long
// way is done in steps, each looking at all it needs to.
const levels = new WeakMap<AssetInfo, HTMLCanvasElement[]>()

function levelsOf(info: AssetInfo) {
  let made = levels.get(info)
  if (!made) {
    const { trim, image } = info
    const first = canvasOf(trim.width, trim.height)
    first.getContext("2d")!.drawImage(image, trim.x, trim.y, trim.width, trim.height, 0, 0, trim.width, trim.height)
    made = [first]
    while (made[made.length - 1].width > 96) {
      const last = made[made.length - 1]
      const next = canvasOf(Math.max(1, Math.round(last.width / 2)), Math.max(1, Math.round(last.height / 2)))
      const context = next.getContext("2d")!
      context.imageSmoothingQuality = "high"
      context.drawImage(last, 0, 0, next.width, next.height)
      made.push(next)
    }
    levels.set(info, made)
  }
  return made
}

function pixelsAt(info: AssetInfo, w: number, h: number) {
  const made = levelsOf(info)
  // The smallest step that is still at least as wide as wanted.
  const from = [...made].reverse().find((level) => level.width >= w) ?? made[0]
  const canvas = canvasOf(w, h)
  const context = canvas.getContext("2d", { willReadFrequently: true })!
  context.imageSmoothingQuality = "high"
  context.drawImage(from, 0, 0, w, h)
  return context.getImageData(0, 0, w, h).data
}

// The mask, as pixels the size of the art, where it has one.
function maskPixels(info: AssetInfo, w: number, h: number) {
  if (!info.mask) return null
  const { trim, image, mask } = info
  const canvas = canvasOf(w, h)
  const context = canvas.getContext("2d", { willReadFrequently: true })!
  const across = mask.naturalWidth / image.naturalWidth
  const down = mask.naturalHeight / image.naturalHeight
  context.drawImage(mask, trim.x * across, trim.y * down, trim.width * across, trim.height * down, 0, 0, w, h)
  return context.getImageData(0, 0, w, h).data
}

export function paintedArtFor(
  id: string,
  info: AssetInfo,
  drawnWidth: number,
  background: SceneBackground,
  changes: boolean
): PaintedArt {
  const w = sized(drawnWidth)
  const key = `${id}|${w}|${background}|${changes ? 1 : 0}`
  const known = cache.get(key)
  if (known) {
    cache.delete(key)
    cache.set(key, known)
    return known.art
  }

  const { trim } = info
  const h = Math.max(1, Math.round((w * trim.height) / trim.width))
  const look = themeFor(background).paint
  const source = pixelsAt(info, w, h)
  // Sharpening and contrast grow with how far the art was shrunk, up to a limit.
  const shrunk = Math.min(Math.max(Math.log2(trim.width / w) / 3, 0), 1)

  const finish = (pixels: Uint8ClampedArray) => {
    sharpen(pixels, w, h, look.sharpen * shrunk)
    grade(pixels, look.grade, look.smallContrast * shrunk)
    const canvas = canvasOf(w, h)
    const image = new ImageData(w, h)
    image.data.set(pixels)
    canvas.getContext("2d")!.putImageData(image, 0, 0)
    return canvas
  }

  const base = finish(new Uint8ClampedArray(source))
  const shadow = footShadow(source, w, h, look.shadow)
  const variants = new Map<Biome, HTMLCanvasElement | null>()
  let change: Float32Array | null = null
  let range = { low: 0, high: 1 }

  const art: PaintedArt = {
    base,
    shadow,
    width: w,
    variant(biome) {
      if (!changes) return null
      if (variants.has(biome)) return variants.get(biome)!
      if (!change) {
        change = amounts(source, maskPixels(info, w, h))
        range = lightRange(source, change)
      }
      const touched = change.some((amount) => amount > 0.05)
      let made: HTMLCanvasElement | null = null
      if (touched) {
        const pixels = new Uint8ClampedArray(source)
        recolour(pixels, change, range, rampTable(look.recolour[biome]))
        made = finish(pixels)
        const added = w * h
        used += added
        grown.set(key, (grown.get(key) ?? 0) + added)
      }
      variants.set(biome, made)
      return made
    },
  }

  const pixels = w * h * 2 + shadow.canvas.width * shadow.canvas.height
  cache.set(key, { art, pixels })
  used += pixels
  for (const [oldest, entry] of cache) {
    if (used <= LIMIT || cache.size <= 1) break
    cache.delete(oldest)
    used -= entry.pixels + (grown.get(oldest) ?? 0)
    grown.delete(oldest)
  }
  return art
}
