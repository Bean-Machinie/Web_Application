export type Rng = () => number

// A seeded random number between 0 and 1, so a scene is the same every time it is made.
export function seeded(seed: number): Rng {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// A 4 by 4 Bayer matrix as thresholds between 0 and 1: the ordered dither of the app's background.
export const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map((value) => (value + 0.5) / 16)
export const bayerAt = (x: number, y: number) => BAYER[((y | 0) & 3) * 4 + ((x | 0) & 3)]

// A value between 0 and 1 from a whole-number place and a seed, the same every time.
function lattice(ix: number, iy: number, seed: number) {
  let h = (Math.imul(ix, 374761393) + Math.imul(iy, 668265263) + Math.imul(seed, 144665)) | 0
  h = Math.imul(h ^ (h >>> 13), 1274126177)
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296
}

const smooth = (f: number) => f * f * (3 - 2 * f)

// Smooth noise over a plane, between 0 and 1.
export function noise2(seed: number) {
  return (x: number, y: number) => {
    const ix = Math.floor(x)
    const iy = Math.floor(y)
    const fx = smooth(x - ix)
    const fy = smooth(y - iy)
    const top = lattice(ix, iy, seed) + (lattice(ix + 1, iy, seed) - lattice(ix, iy, seed)) * fx
    const bottom = lattice(ix, iy + 1, seed) + (lattice(ix + 1, iy + 1, seed) - lattice(ix, iy + 1, seed)) * fx
    return top + (bottom - top) * fy
  }
}

// Smooth noise along a line, between 0 and 1: for the edge of hills.
export function noise1(seed: number) {
  const plane = noise2(seed)
  return (x: number) => plane(x, 0.5) * 0.75 + plane(x * 3.1, 7.5) * 0.25
}
