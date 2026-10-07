import { random, smooth } from "../map-noise"
import type { SceneBackground } from "../map-scene"
import { BIOMES } from "./biomes"
import type { Biome } from "./biomes"
import { biomeColours, mixRgb } from "./palette"
import type { Rgb } from "./palette"

// How many canvas pixels one repeat of a texture covers.
const TEXTURE_SPAN = 256

// Noise that repeats at the edges, so a texture tiles with no seam: random
// values on a lattice of cellsX by cellsY, blended smoothly, one per pixel.
function tiled(size: number, cellsX: number, cellsY: number, next: () => number) {
  const lattice = Float32Array.from({ length: cellsX * cellsY }, next)
  const out = new Float32Array(size * size)
  for (let y = 0; y < size; y++) {
    const gy = (y / size) * cellsY
    const y0 = Math.floor(gy)
    const ty = smooth(gy - y0)
    const y1 = (y0 + 1) % cellsY
    for (let x = 0; x < size; x++) {
      const gx = (x / size) * cellsX
      const x0 = Math.floor(gx)
      const tx = smooth(gx - x0)
      const x1 = (x0 + 1) % cellsX
      const top = lattice[y0 * cellsX + x0] * (1 - tx) + lattice[y0 * cellsX + x1] * tx
      const bottom = lattice[y1 * cellsX + x0] * (1 - tx) + lattice[y1 * cellsX + x1] * tx
      out[y * size + x] = top * (1 - ty) + bottom * ty
    }
  }
  return out
}

type Fields = { broad: Float32Array; medium: Float32Array; fine: Float32Array; streak: Float32Array }

// How much each biome's ground varies in lightness, and what makes it vary.
const SHADE: Record<Biome, { amount: number; of: (f: Fields, i: number) => number }> = {
  ice: { amount: 0.06, of: (f, i) => f.fine[i] * 0.5 + f.medium[i] * 0.5 },
  swamp: { amount: 0.18, of: (f, i) => f.broad[i] * 0.6 + f.medium[i] * 0.4 },
  desert: { amount: 0.1, of: (f, i) => f.streak[i] * 0.7 + f.fine[i] * 0.3 },
  volcanic: { amount: 0.2, of: (f, i) => f.broad[i] * 0.5 + f.medium[i] * 0.5 },
}

const EMBER: Rgb = [196, 70, 30]
const EMBER_WIDTH = 0.014

// One repeat of a biome's ground, as a canvas drawn for "scale" pixels to each
// canvas pixel. The look is the same at any scale: the noise is laid out in
// shares of the tile, not in pixels.
export function biomeTile(biome: Biome, background: SceneBackground, scale: number) {
  const size = Math.max(Math.round(TEXTURE_SPAN * scale), 8)
  const next = random(0x9e3779b1 ^ ((BIOMES.indexOf(biome) + 1) * 7919))
  const fields: Fields = {
    broad: tiled(size, 3, 3, next),
    medium: tiled(size, 8, 8, next),
    fine: tiled(size, 32, 32, next),
    streak: tiled(size, 3, 32, next),
  }
  const { fill } = biomeColours(biome, background)
  const { amount, of } = SHADE[biome]
  const tile = document.createElement("canvas")
  tile.width = size
  tile.height = size
  const context = tile.getContext("2d")!
  const image = context.createImageData(size, size)
  for (let i = 0; i < size * size; i++) {
    const shade = 1 + (of(fields, i) - 0.5) * 2 * amount
    let colour: Rgb = [fill[0] * shade, fill[1] * shade, fill[2] * shade]
    if (biome === "volcanic") {
      const vein = Math.abs(fields.medium[i] - 0.5)
      if (vein < EMBER_WIDTH) colour = mixRgb(colour, EMBER, (1 - vein / EMBER_WIDTH) * 0.45)
    }
    for (let c = 0; c < 3; c++) image.data[i * 4 + c] = Math.min(Math.max(colour[c], 0), 255)
    image.data[i * 4 + 3] = 255
  }
  context.putImageData(image, 0, 0)
  return tile
}
