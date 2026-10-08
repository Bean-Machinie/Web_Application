import { CELL } from "./map-water-field"
import type { Field } from "./map-water-field"
import { smooth } from "./map-noise"
import { MAX_RINGS, makeRings, sizesFor } from "./map-water-look"
import type { WaterStyle } from "./map-water-look"
import { waterNoise } from "./map-water-noise"
import type { SceneBackground } from "./map-scene"
import type { MapStyle } from "./map-style"
import { themeFor } from "./map-theme"

// A rectangle of the canvas, drawn at "scale" pixels to each canvas pixel.
export type Region = { x: number; y: number; width: number; height: number; scale: number }

const STRIP = 32

const unit = (t: number) => Math.min(Math.max(t, 0), 1)

// The water around the land: a canvas holding the region, transparent where
// there is no water to draw. Every pixel is shaded from its distance to the
// land, so edges are as smooth at any scale as the pixels allow. It is drawn a
// strip at a time, pausing after each, so that the builder can spread it over time.
export function* waterSteps(
  field: Field,
  style: Pick<MapStyle, "rings"> & WaterStyle,
  background: SceneBackground,
  seed: number,
  canvas: { width: number; height: number },
  region: Region
): Generator<void, HTMLCanvasElement> {
  const look = themeFor(background).water
  const out = document.createElement("canvas")
  out.width = Math.max(1, Math.round(region.width * region.scale))
  out.height = Math.max(1, Math.round(region.height * region.scale))
  const context = out.getContext("2d")!

  const { shared, rings: noise } = waterNoise(seed, canvas.width, canvas.height)
  const count = Math.min(style.rings, MAX_RINGS)
  const sizes = sizesFor(style)
  const rings = makeRings(count, style, sizes, seed)
  const pixel = 1 / region.scale
  const last = rings[count - 1]
  // Lines grow fainter with distance from land, whatever the spacing, so the
  // outermost ones are only just there.
  const farthest = (last ? last.centre : 0) + sizes.first
  const limit = Math.max(sizes.band, last ? last.centre + last.reach : 0) + sizes.band

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

                const band = sizes.band * (1 + (noise[0].swell(x, y) - 0.5) * 0.5 * style.variation)
        let dark = look.darkAlpha * (1 - smooth(unit(distance / band))) ** 1.4
        let light = 0

        if (distance > 0.5 * sizes.first && count > 0) {
          const sway = shared(x, y)
          let room = -1
          for (let k = 0; k < count; k++) {
            const ring = rings[k]
            if (Math.abs(distance - ring.centre) > ring.reach) continue
            const own = noise[k]
            const wobble = (sway * 0.35 + own.wander(x, y) * 0.65 - 0.5) * 2 * sizes.swing * ring.amp
            const shake = (own.shake(x, y) - 0.5) * 2 * sizes.tremor
            // However it wanders, a line stays clear of the dark band at the coast.
            const at = Math.max(ring.centre - wobble - shake, sizes.band * 0.8 + ring.half)
            const across = Math.abs(distance - at)
            // Swells and thins like pen pressure, and fades away where the
            // line breaks.
            const pressure = Math.max(1 + (own.swell(x, y) - 0.5) * 1.4 * style.variation, 0.5)
            const gap = smooth(unit((own.breaks(x, y) - ring.cut) / 0.3))
            if (gap <= 0) continue
            // Ends dim and narrow only a little, so they dissolve instead of
            // thinning to a hairline.
            const half = ring.half * pressure * (0.7 + 0.3 * gap)
            const cover = unit((half - across) / pixel + 0.5)
            if (cover <= 0) continue
            if (room < 0) room = sample(field.open, x, y)
            const needs = Math.max(sizes.channelHalf, ring.centre * 1.1)
            const open = smooth(unit((room - needs) / Math.max(sizes.channelFade, ring.centre * 0.7)))
            const strength = look.lightAlpha * (1 - unit(distance / farthest) ** 0.65) * open * cover * gap
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
    yield
  }
  return out
}

// All of it at once, for the published picture.
export function renderWater(...args: Parameters<typeof waterSteps>) {
  const steps = waterSteps(...args)
  for (let step = steps.next(); ; step = steps.next()) if (step.done) return step.value
}
