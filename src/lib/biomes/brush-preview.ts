import maskUrl from "@/assets/ui/brush.mask.png"
import { css } from "../colour"
import type { SceneBackground } from "../map-scene"
import { themeFor } from "../map-theme"
import { gradedTile } from "../terrain-texture"
import type { Tiles } from "../terrain-tiles"
import { BIOMES } from "./biomes"
import type { BrushBiome } from "./biomes"

export type BrushPreviews = Record<BrushBiome, string>

// The room a picture has in the sub tool list, in screen pixels: the stroke is
// fitted into it, whole, and keeps its proportions.
const BOX = { width: 120, height: 30 }
// How much of the picture one repeat of the ground tile covers, in screen pixels:
// enough of a tile to make out its marks.
const TILE_SHOWN = 85
// Opacity below this counts as empty when trimming the stroke's picture.
const EMPTY = 8

const canvasOf = (width: number, height: number) =>
  Object.assign(document.createElement("canvas"), { width, height })

// The stroke's shape as opacity, trimmed of the empty space round it. A picture
// with transparency is used as it is; one with a white background, as a drawing
// on white would be, has its white made transparent and its darkness kept.
function trimmed(image: HTMLImageElement) {
  const source = canvasOf(image.naturalWidth, image.naturalHeight)
  const context = source.getContext("2d", { willReadFrequently: true })!
  context.drawImage(image, 0, 0)
  const { data, width, height } = context.getImageData(0, 0, source.width, source.height)
  const onWhite = data[3] === 255
  let [left, top, right, bottom] = [width, height, -1, -1]
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const at = (y * width + x) * 4
      if (onWhite) data[at + 3] = 255 - Math.min(data[at], data[at + 1], data[at + 2])
      if (data[at + 3] < EMPTY) continue
      left = Math.min(left, x)
      right = Math.max(right, x)
      top = Math.min(top, y)
      bottom = Math.max(bottom, y)
    }
  }
  if (right < 0) return source
  context.putImageData(new ImageData(data, width, height), 0, 0)
  const out = canvasOf(right - left + 1, bottom - top + 1)
  out.getContext("2d")!.drawImage(source, left, top, out.width, out.height, 0, 0, out.width, out.height)
  return out
}

let maskLoading: Promise<HTMLCanvasElement> | null = null
const loadMask = () =>
  (maskLoading ??= new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(trimmed(image))
    image.onerror = () => reject(new Error("Could not load the brush mask"))
    image.src = maskUrl
  }))

// The stroke at a size, shrunk by halves: one big step down would drop pixels and
// leave its edges jagged.
function scaledTo(mask: HTMLCanvasElement, width: number, height: number) {
  let current = mask
  while (current.width / 2 > width) {
    const half = canvasOf(Math.ceil(current.width / 2), Math.ceil(current.height / 2))
    const context = half.getContext("2d")!
    context.imageSmoothingQuality = "high"
    context.drawImage(current, 0, 0, half.width, half.height)
    current = half
  }
  const out = canvasOf(width, height)
  const context = out.getContext("2d")!
  context.imageSmoothingQuality = "high"
  context.drawImage(current, 0, 0, width, height)
  return out
}

// The ground of a biome as the map draws it: its tile, graded for the background
// the way the map's terrain is, cut to the stroke's shape. The colour lies under
// the texture, as it does in the map's own fallback.
function previewOf(tiles: Tiles, shape: HTMLCanvasElement, density: number, biome: BrushBiome, background: SceneBackground) {
  const theme = themeFor(background)
  const fill = biome === "plains" ? theme.land.fill : theme.biomes[biome].fill
  const tile = gradedTile(tiles[biome === "plains" ? "land" : biome], background)
  const out = canvasOf(shape.width, shape.height)
  const context = out.getContext("2d")!
  context.fillStyle = css(fill)
  context.fillRect(0, 0, out.width, out.height)
  const pattern = context.createPattern(tile, "repeat")!
  pattern.setTransform(new DOMMatrix().scale((TILE_SHOWN * density) / tile.width))
  context.fillStyle = pattern
  context.fillRect(0, 0, out.width, out.height)
  context.globalCompositeOperation = "destination-in"
  context.drawImage(shape, 0, 0)
  return out.toDataURL()
}

const made = new Map<string, BrushPreviews>()

// A picture of each biome's brush, drawn once for each background and screen density.
export async function brushPreviews(tiles: Tiles, background: SceneBackground): Promise<BrushPreviews> {
  const density = window.devicePixelRatio || 1
  const key = `${background}@${density}`
  const known = made.get(key)
  if (known) return known
  const mask = await loadMask()
  const fit = Math.min(BOX.width / mask.width, BOX.height / mask.height)
  const shape = scaledTo(
    mask,
    Math.max(1, Math.round(mask.width * fit * density)),
    Math.max(1, Math.round(mask.height * fit * density))
  )
  const previews = Object.fromEntries(
    (["plains", ...BIOMES] as BrushBiome[]).map((biome) => [biome, previewOf(tiles, shape, density, biome, background)])
  ) as BrushPreviews
  made.set(key, previews)
  return previews
}
