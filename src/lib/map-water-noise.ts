import { random, valueNoise } from "./map-noise"
import { MAX_RINGS } from "./map-water-look"

type Noise = (x: number, y: number) => number

// How the wandering, the swelling, the breaks and the shake vary across the
// map, in canvas pixels.
const WANDER = 190
const SWELL = 85
const BREAKS = 230
const SHAKE = 12

export type RingNoise = { wander: Noise; swell: Noise; breaks: Noise; shake: Noise }

let last: { key: string; shared: Noise; rings: RingNoise[] } | null = null

// Every ring gets noise of its own, so no two lines run as copies of each other.
// Making it takes a moment on a big canvas, so the last set is kept.
export function waterNoise(seed: number, width: number, height: number) {
  const key = `${seed}|${width}|${height}`
  if (last?.key === key) return last
  const next = random(seed ^ 0x5bd1e995)
  const shared = valueNoise(width, height, WANDER * 1.6, next)
  const rings = Array.from({ length: MAX_RINGS }, () => ({
    wander: valueNoise(width, height, WANDER, next),
    swell: valueNoise(width, height, SWELL, next),
    breaks: valueNoise(width, height, BREAKS, next),
    shake: valueNoise(width, height, SHAKE, next),
  }))
  last = { key, shared, rings }
  return last
}
