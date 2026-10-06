import { CELL } from "./map-water-field"
import type { Field } from "./map-water-field"
import { random, smooth, valueNoise } from "./map-noise"
import type { SceneBackground } from "./map-scene"
import type { MapStyle } from "./map-style"

type Rgb = [number, number, number]

// Art, not interface, so fixed colours. A dark band hugs the coast; light lines
// spread out from it.
const LOOKS: Record<SceneBackground, { dark: Rgb; darkAlpha: number; light: Rgb; lightAlpha: number }> = {
  parchment: { dark: [96, 66, 36], darkAlpha: 0.6, light: [255, 252, 240], lightAlpha: 0.95 },
  ocean: { dark: [8, 38, 58], darkAlpha: 0.55, light: [214, 244, 248], lightAlpha: 0.7 },
}

// The dark band, and where the first line sits beyond it, in canvas pixels.
const BAND = 24
const FIRST_RING = 0.8 * BAND
// Line widths run from the first ring to the last.
const WIDTH_NEAR = 5
const WIDTH_FAR = 2.8
const MAX_RINGS = 8
// Water narrower than this across (twice the half-width given) shows no rings,
// and they fade in over the next stretch of width. Rings further out need more room.
const CHANNEL_HALF = 70
const CHANNEL_FADE = 40
// How the wandering and the gaps vary across the map, in canvas pixels.
const WANDER = 190
const WANDER_FINE = 70
const BREAKS = 230

// A rectangle of the canvas, drawn at "scale" pixels to each canvas pixel.
export type Region = { x: number; y: number; width: number; height: number; scale: number }

const STRIP = 128

// The water around the land: a canvas holding the region, transparent where
// there is no water to draw. Every pixel is shaded from its distance to the
// land, so edges are as smooth at any scale as the pixels allow.
export function renderWater(
  field: Field,
  style: Pick<MapStyle, "rings" | "spacing" | "waviness">,
  background: SceneBackground,
  seed: number,
  canvas: { width: number; height: number },
  region: Region
) {
  const look = LOOKS[background]
  const out = document.createElement("canvas")
  out.width = Math.max(1, Math.round(region.width * region.scale))
  out.height = Math.max(1, Math.round(region.height * region.scale))
  const context = out.getContext("2d")!

  const next = random(seed ^ 0x5bd1e995)
  const wander = valueNoise(canvas.width, canvas.height, WANDER, next)
  const fine = valueNoise(canvas.width, canvas.height, WANDER_FINE, next)
  const breaks = Array.from({ length: MAX_RINGS }, () =>
    valueNoise(canvas.width, canvas.height, BREAKS, next)
  )

  const { rings, spacing } = style
  const reach = FIRST_RING + rings * spacing
  const swing = style.waviness * spacing * 0.55
  const pixel = 1 / region.scale
  const limit = reach + swing + WIDTH_NEAR + BAND

  const sample = (grid: Float32Array, x: number, y: number) => {
    const fx = Math.min(Math.max(x / CELL - 0.5, 0), field.cols - 1.001)
    const fy = Math.min(Math.max(y / CELL - 0.5, 0), field.rows - 1.001)
    const x0 = Math.floor(fx)
    const y0 = Math.floor(fy)
    const tx = fx - x0
    const ty = fy - y0
    const i = y0 * field.cols + x0
    const top = grid[i] + (grid[i + 1] - grid[i]) * tx
    const bottom = grid[i + field.cols] + (grid[i + field.cols + 1] - grid[i + field.cols]) * tx
    return top + (bottom - top) * ty
  }

  for (let top = 0; top < out.height; top += STRIP) {
    const rows = Math.min(STRIP, out.height - top)
    const image = context.createImageData(out.width, rows)
    const data = image.data
    for (let row = 0; row < rows; row++) {
      const y = Math.min(region.y + (top + row + 0.5) * pixel, canvas.height - 0.01)
      for (let column = 0; column < out.width; column++) {
        const x = Math.min(region.x + (column + 0.5) * pixel, canvas.width - 0.01)
        const distance = sample(field.land, x, y)
        if (distance > limit) continue

        const sway = (wander(x, y) * 0.7 + fine(x, y) * 0.3 - 0.5) * 2 * swing
        const here = distance + sway
        let dark = look.darkAlpha * (1 - smooth(Math.min(Math.max(distance / BAND, 0), 1))) ** 1.4
        let light = 0

        if (distance > 0.5 * FIRST_RING && rings > 0) {
          const room = sample(field.open, x, y)
          for (let k = 1; k <= rings; k++) {
            const centre = FIRST_RING + (k - 1) * spacing
            const across = Math.abs(here - centre)
            if (across > WIDTH_NEAR) continue
            const along = (k - 1) / Math.max(rings - 1, 1)
            // Thinner and fainter the further out, thinning away to nothing
            // where the line breaks, and gone where the water is a narrow channel.
            const half = (WIDTH_NEAR + (WIDTH_FAR - WIDTH_NEAR) * along) / 2
            const gap = smooth(Math.min(Math.max((breaks[k - 1](x, y) - 0.3) / 0.22, 0), 1))
            const needs = Math.max(CHANNEL_HALF, centre * 1.1)
            const open = smooth(Math.min(Math.max((room - needs) / Math.max(CHANNEL_FADE, centre * 0.7), 0), 1))
            const cover = Math.min(Math.max((half * gap - across) / pixel + 0.5, 0), 1)
            const strength = look.lightAlpha * (1 - 0.5 * along) * open * cover
            if (strength > light) light = strength
          }
        }

        const alpha = light + dark * (1 - light)
        if (alpha <= 0.002) continue
        const at = (row * out.width + column) * 4
        for (let c = 0; c < 3; c++) {
          data[at + c] = (look.light[c] * light + look.dark[c] * dark * (1 - light)) / alpha
        }
        data[at + 3] = alpha * 255
      }
    }
    context.putImageData(image, 0, top)
  }
  return out
}
