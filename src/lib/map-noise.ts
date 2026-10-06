// Seeded noise, so a map always looks the same for the same seed.
export function random(seed: number) {
  let state = seed >>> 0
  return () => {
    state = (state + 0x6d2b79f5) >>> 0
    let t = state
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export const smooth = (t: number) => t * t * (3 - 2 * t)

// A grid of random values, read with smooth blending between them.
export function valueNoise(width: number, height: number, cell: number, next: () => number) {
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

export const mix = (a: number, b: number, t: number) => a + (b - a) * t
