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

// The greens and yellow-greens change, with soft edges on the range of colour.
// Browns and greys, such as trunks, stay, and so does what is near black or
// hardly coloured at all.
export function automaticAmount(r: number, g: number, b: number) {
  const { hue, saturation, value } = hsv(r, g, b)
  return between(hue, 34, 58) * between(175 - hue, 0, 25) * between(saturation, 0.12, 0.3) * between(value, 0.1, 0.25)
}

// The amounts for a whole picture, from its pixels (RGBA): by colour, or, where
// a mask is given (as pixels of the same size), by the mask, white to change.
export function amounts(pixels: Uint8ClampedArray, mask: Uint8ClampedArray | null) {
  const out = new Float32Array(pixels.length / 4)
  for (let i = 0; i < out.length; i++) {
    if (mask) {
      const light = (0.299 * mask[i * 4] + 0.587 * mask[i * 4 + 1] + 0.114 * mask[i * 4 + 2]) / 255
      out[i] = light * (mask[i * 4 + 3] / 255)
    } else {
      out[i] = automaticAmount(pixels[i * 4], pixels[i * 4 + 1], pixels[i * 4 + 2])
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

// Changes the pixels in place: each by its amount, from what it was to the
// ramp's colour at the same place in the painting's own range of light.
export function recolour(
  pixels: Uint8ClampedArray,
  change: Float32Array,
  range: { low: number; high: number },
  table: Uint8ClampedArray
) {
  for (let i = 0; i < change.length; i++) {
    const amount = change[i]
    if (amount <= 0.003) continue
    const light = clamp((lightOf(pixels[i * 4], pixels[i * 4 + 1], pixels[i * 4 + 2]) - range.low) / (range.high - range.low))
    const at = Math.round(light * 255) * 3
    for (let c = 0; c < 3; c++) pixels[i * 4 + c] += (table[at + c] - pixels[i * 4 + c]) * amount
  }
}
