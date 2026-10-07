import { mix, random, smooth, valueNoise } from "./map-noise"
import type { MapScene } from "./map-scene"
import { themeFor } from "./map-theme"

type Canvas = MapScene["canvas"]

// The noise is worked out at a fraction of the canvas and scaled up, which is
// both quick and soft. Same seed and size always give the same picture.
const SCALE = 0.5

export function renderBackground({ width, height, background, seed }: Canvas) {
  const palette = themeFor(background).backdrop
  const w = Math.round(width * SCALE)
  const h = Math.round(height * SCALE)
  const next = random(seed)
  const octaves = [
    { read: valueNoise(w, h, 260 * SCALE, next), weight: 0.5 },
    { read: valueNoise(w, h, 90 * SCALE, next), weight: 0.3 },
    { read: valueNoise(w, h, 30 * SCALE, next), weight: 0.2 },
  ]
  // Ocean gets faint, wandering wave bands on top.
  const waves = valueNoise(w, h, 200 * SCALE, next)

  const small = document.createElement("canvas")
  small.width = w
  small.height = h
  const context = small.getContext("2d")!
  const image = context.createImageData(w, h)

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let tone = 0
      for (const { read, weight } of octaves) tone += read(x, y) * weight
      if (palette.waves > 0) {
        tone += (Math.sin((y + waves(x, y) * 160) * 0.09) * 0.5 + 0.5) * palette.waves
      }
      tone += (next() - 0.5) * 0.04

      // Darker toward the edges, like an old sheet or deep water.
      const dx = (x / w - 0.5) * 2
      const dy = (y / h - 0.5) * 2
      const edge = smooth(Math.min(Math.max((Math.hypot(dx, dy) - 0.7) / 0.75, 0), 1))
      const amount = edge * palette.edgeAmount

      const at = (y * w + x) * 4
      for (let channel = 0; channel < 3; channel++) {
        const base = mix(palette.low[channel], palette.high[channel], tone)
        image.data[at + channel] = mix(base, palette.edge[channel], amount)
      }
      image.data[at + 3] = 255
    }
  }
  context.putImageData(image, 0, 0)

  const full = document.createElement("canvas")
  full.width = width
  full.height = height
  const target = full.getContext("2d")!
  target.imageSmoothingQuality = "high"
  target.drawImage(small, 0, 0, width, height)
  return full
}
