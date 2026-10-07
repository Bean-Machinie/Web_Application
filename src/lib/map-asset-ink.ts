import { PAINT_CELL, TILE } from "./biomes/biomes"
import { CHANNELS, tileKey } from "./biomes/paint-tiles"
import type { Tile } from "./biomes/paint-tiles"
import { BIOMES } from "./biomes/biomes"
import type { Rgb } from "./colour"
import type { Rect } from "./map-asset-pieces"
import type { Ground } from "./map-ground"
import { themeFor } from "./map-theme"

// The picture is never made finer than this many pixels across: ink colour
// changes slowly, so a small picture stretched smoothly says as much.
const MAX_SIDE = 256

// The colour the ink should be at every place of a rectangle of the canvas: the
// ink of whatever ground is under that place, from the biome paint, blended
// smoothly where the ground blends. "follows" is how far toward the ground's ink
// it goes from the map's own, 0 to 1. Returns null where the whole rectangle is
// plain, so that one flat colour does.
export function inkField(rect: Rect, ground: Ground, ink: Rgb, follows: number): HTMLCanvasElement | null {
  const paint = ground.paint.current
  if (paint.size === 0 || follows <= 0) return null
  const theme = themeFor(ground.background)
  const biomeInks = BIOMES.map((biome) => theme.biomes[biome].ink)
  const width = Math.max(1, Math.min(Math.ceil(rect.width / PAINT_CELL), MAX_SIDE))
  const height = Math.max(1, Math.min(Math.ceil(rect.height / PAINT_CELL), MAX_SIDE))
  const image = new ImageData(width, height)

  let tileX = NaN
  let tileY = NaN
  let tile: Tile | undefined
  let painted = false
  for (let j = 0; j < height; j++) {
    const y = rect.y + ((j + 0.5) * rect.height) / height
    for (let i = 0; i < width; i++) {
      const x = rect.x + ((i + 0.5) * rect.width) / width
      const cx = Math.floor(x / PAINT_CELL)
      const cy = Math.floor(y / PAINT_CELL)
      const tx = Math.floor(cx / TILE)
      const ty = Math.floor(cy / TILE)
      if (tx !== tileX || ty !== tileY) {
        tileX = tx
        tileY = ty
        tile = paint.get(tileKey(tx, ty))
      }
      let r = ink[0]
      let g = ink[1]
      let b = ink[2]
      if (tile) {
        const at = ((cy % TILE) * TILE + (cx % TILE)) * CHANNELS
        let used = 255
        for (let c = 0; c < CHANNELS; c++) used -= tile[at + c]
        used = Math.max(used, 0)
        // Plains first; each biome pulls the colour toward its own by its share.
        let gr = theme.ink[0]
        let gg = theme.ink[1]
        let gb = theme.ink[2]
        for (let c = 0; c < CHANNELS; c++) {
          const weight = tile[at + c]
          if (weight === 0) continue
          used += weight
          const t = weight / used
          gr += (biomeInks[c][0] - gr) * t
          gg += (biomeInks[c][1] - gg) * t
          gb += (biomeInks[c][2] - gb) * t
          painted = true
        }
        r += (gr - r) * follows
        g += (gg - g) * follows
        b += (gb - b) * follows
      }
      const out = (j * width + i) * 4
      image.data[out] = r
      image.data[out + 1] = g
      image.data[out + 2] = b
      image.data[out + 3] = 255
    }
  }
  if (!painted) return null
  const canvas = document.createElement("canvas")
  canvas.width = width
  canvas.height = height
  canvas.getContext("2d")!.putImageData(image, 0, 0)
  return canvas
}
