import type { Window } from "./map-assets"
import type { Ramp } from "./map-theme"

// Which parts of a painting may change colour with the biome, and how: every
// pixel gets an amount from 0 (stays) to 1 (changes), and the changing ones are
// mapped from their own lights and darks onto a ramp of the biome's colours.

const clamp = (value: number) => Math.min(Math.max(value, 0), 1)
const smooth = (t: number) => t * t * (3 - 2 * t)
const between = (value: number, from: number, to: number) => smooth(clamp((value - from) / (to - from)))

// Hue (degrees), saturation and value of a colour, 0 to 255 in.
function hsv(r: number, g: number, b: number) {
  const high = Math.max(r, g, b)
  const low = Math.min(r, g, b)
  const span = high - low
  let hue = 0
  if (span > 0) {
    if (high === r) hue = 60 * (((g - b) / span + 6) % 6)
    else if (high === g) hue = 60 * ((b - r) / span + 2)
    else hue = 60 * ((r - g) / span + 4)
  }
  return { hue, saturation: high === 0 ? 0 : span / high, value: high / 255 }
}

// The greens change, with soft edges on the range of colour: from the lower hue
// they start to, and from the higher they fully do, up to the blue-greens, which
// they stop at. Browns and greys, ochre rock, snow and blue shadows stay, and so
// does what is near black or hardly coloured at all.
export function automaticAmount(r: number, g: number, b: number, window: Window) {
  const colour = hsv(r, g, b)
  const { hue, saturation, light } = window
  return (
    between(colour.hue, hue[0], hue[1]) *
    between(175 - colour.hue, 0, 25) *
    between(colour.saturation, saturation[0], saturation[1]) *
    between(colour.value, 0.1, 0.25) *
    (1 - between(colour.value, light[0], light[1]))
  )
}

// The amounts for a whole picture, from its pixels (RGBA): by colour, or, where
// a mask is given (as pixels of the same size), by the mask, white to change.
export function amounts(pixels: Uint8ClampedArray, mask: Uint8ClampedArray | null, window: Window) {
  const out = new Float32Array(pixels.length / 4)
  for (let i = 0; i < out.length; i++) {
    if (mask) {
      const light = (0.299 * mask[i * 4] + 0.587 * mask[i * 4 + 1] + 0.114 * mask[i * 4 + 2]) / 255
      out[i] = light * (mask[i * 4 + 3] / 255)
    } else {
      out[i] = automaticAmount(pixels[i * 4], pixels[i * 4 + 1], pixels[i * 4 + 2], window)
    }
  }
  return out
}

const lightOf = (r: number, g: number, b: number) => (0.299 * r + 0.587 * g + 0.114 * b) / 255

// The lightest and darkest the changing parts are, ignoring the extreme few. It
// is worked out from those parts alone, weighted by how much they change, so a
// pale trunk or dark outline does not stretch the range foliage is mapped over.
export function lightRange(pixels: Uint8ClampedArray, change: Float32Array) {
  const bins = new Float32Array(256)
  let total = 0
  for (let i = 0; i < change.length; i++) {
    const weight = change[i] * (pixels[i * 4 + 3] / 255)
    if (weight <= 0.01) continue
    bins[Math.min(255, Math.floor(lightOf(pixels[i * 4], pixels[i * 4 + 1], pixels[i * 4 + 2]) * 255))] += weight
    total += weight
  }
  if (total === 0) return { low: 0, high: 1 }
  const at = (share: number) => {
    let sum = 0
    for (let bin = 0; bin < 256; bin++) {
      sum += bins[bin]
      if (sum >= total * share) return bin / 255
    }
    return 1
  }
  const low = at(0.04)
  return { low, high: Math.max(at(0.96), low + 0.1) }
}

// A ramp as 256 colours, from its darkest to its lightest.
export function rampTable(ramp: Ramp) {
  const table = new Uint8ClampedArray(256 * 3)
  for (let i = 0; i < 256; i++) {
    const t = i / 255
    let k = 1
    while (k < ramp.length - 1 && ramp[k][0] < t) k++
    const [t0, c0] = ramp[k - 1]
    const [t1, c1] = ramp[k]
    const along = clamp((t - t0) / (t1 - t0 || 1))
    for (let c = 0; c < 3; c++) table[i * 3 + c] = c0[c] + (c1[c] - c0[c]) * along
  }
  return table
}

// Snow: very bright and hardly saturated (cream and white), or the pale blue of
// snow in shade. The deep blues of shadowed rock are darker and more saturated,
// so they are not snow.
export function snowAmount(r: number, g: number, b: number) {
  const { hue, saturation, value } = hsv(r, g, b)
  const bright = between(value, 0.8, 0.9) * (1 - between(saturation, 0.22, 0.34))
  const pale =
    between(hue, 190, 200) *
    between(235 - hue, 0, 10) *
    between(value, 0.45, 0.55) *
    between(saturation, 0.08, 0.16) *
    (1 - between(saturation, 0.38, 0.5))
  return Math.max(bright, pale)
}

// What a painting is made of, as an amount from 0 to 1 at each pixel for each of
// its surfaces. Grass is picked by its colour, or by the mask; snow by its
// colour; and rock is everything else.
export type Surfaces = { grass: Float32Array; snow: Float32Array | null; rock: Float32Array | null }

export function surfaces(
  pixels: Uint8ClampedArray,
  mask: Uint8ClampedArray | null,
  config: { grass: Window; snow?: boolean; rock?: boolean }
): Surfaces {
  const grass = amounts(pixels, mask, config.grass)
  const snow = config.snow ? new Float32Array(grass.length) : null
  const rock = config.rock ? new Float32Array(grass.length) : null
  for (let i = 0; i < grass.length; i++) {
    const alpha = pixels[i * 4 + 3] / 255
    const free = 1 - grass[i]
    if (snow) snow[i] = snowAmount(pixels[i * 4], pixels[i * 4 + 1], pixels[i * 4 + 2]) * free * alpha
    if (rock) rock[i] = Math.max(free - (snow ? snow[i] : 0), 0) * alpha
  }
  return { grass, snow, rock }
}

// Changes the pixels in place. Each surface is taken from what it was to the
// ramp's colour at the same place in that surface's own range of light, by its
// amount; a surface with no table stays as painted.
export function recolour(
  pixels: Uint8ClampedArray,
  parts: { amount: Float32Array; range: { low: number; high: number }; table: Uint8ClampedArray }[]
) {
  const count = pixels.length / 4
  for (let i = 0; i < count; i++) {
    const light = lightOf(pixels[i * 4], pixels[i * 4 + 1], pixels[i * 4 + 2])
    let taken = 0
    let r = 0
    let g = 0
    let b = 0
    for (const { amount, range, table } of parts) {
      const share = amount[i]
      if (share <= 0.003) continue
      const at = Math.round(clamp((light - range.low) / (range.high - range.low)) * 255) * 3
      r += table[at] * share
      g += table[at + 1] * share
      b += table[at + 2] * share
      taken += share
    }
    if (taken === 0) continue
    const kept = 1 - Math.min(taken, 1)
    pixels[i * 4] = pixels[i * 4] * kept + r
    pixels[i * 4 + 1] = pixels[i * 4 + 1] * kept + g
    pixels[i * 4 + 2] = pixels[i * 4 + 2] * kept + b
  }
}
