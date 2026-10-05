import type { MapScene, SceneBackground } from "./map-scene"

type Canvas = MapScene["canvas"]

type Rgb = [number, number, number]

// Art, not interface, so these are fixed colours rather than theme tokens.
const PALETTES: Record<SceneBackground, { low: Rgb; high: Rgb; edge: Rgb; edgeAmount: number }> = {
  parchment: { low: [205, 178, 132], high: [240, 225, 190], edge: [120, 84, 44], edgeAmount: 0.38 },
  ocean: { low: [28, 92, 122], high: [64, 144, 168], edge: [10, 40, 62], edgeAmount: 0.3 },
}

// The noise is worked out at a fraction of the canvas and scaled up, which is
// both quick and soft. Same seed and size always give the same picture.
const SCALE = 0.5

function random(seed: number) {
  let state = seed >>> 0
  return () => {
    state = (state + 0x6d2b79f5) >>> 0
    let t = state
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const smooth = (t: number) => t * t * (3 - 2 * t)

// A grid of random values, read with smooth blending between them.
function valueNoise(width: number, height: number, cell: number, next: () => number) {
  const columns = Math.ceil(width / cell) + 2
  const rows = Math.ceil(height / cell) + 2
  const grid = Float32Array.from({ length: columns * rows }, next)
  return (x: number, y: number) => {
    const gx = x / cell
    const gy = y / cell
    const x0 = Math.floor(gx)
    const y0 = Math.floor(gy)
    const tx = smooth(gx - x0)
    const ty = smooth(gy - y0)
    const at = (cx: number, cy: number) => grid[cy * columns + cx]
    const top = at(x0, y0) + (at(x0 + 1, y0) - at(x0, y0)) * tx
    const bottom = at(x0, y0 + 1) + (at(x0 + 1, y0 + 1) - at(x0, y0 + 1)) * tx
    return top + (bottom - top) * ty
  }
}

const mix = (a: number, b: number, t: number) => a + (b - a) * t

export function renderBackground({ width, height, background, seed }: Canvas) {
  const palette = PALETTES[background]
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
      if (background === "ocean") {
        tone += (Math.sin((y + waves(x, y) * 160) * 0.09) * 0.5 + 0.5) * 0.06
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
