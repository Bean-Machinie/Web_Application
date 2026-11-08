import { hex, pack } from "./buffer"
import type { Buf } from "./buffer"
import { countFor } from "./effect"
import type { Effect } from "./effect"
import { noise2 } from "./noise"
import type { Rng } from "./noise"

// Brightest, light, mid, deep and dark teal.
const COLOURS = ["#e6fff9", "#8ff0d8", "#3cc0ad", "#1f8088", "#124b5c"].map((value) => pack(hex(value)))
const TRAIL = 3
const SCALE = 0.05
const EPS = 0.6
const SPEED = 0.5
const FLASH_FRAMES = 7

type Mote = { x: number; y: number; flash: number; trail: [number, number][] }

// Arcane motes: single teal pixels that drift along the curl of a slowly changing noise field, which
// makes them flow in loops and eddies and never bunch up, each with a trail of two or three pixels
// that darkens behind it. Now and then one brightens for a moment.
export function motes(w: number, h: number, rng: Rng, seed: number): Effect {
  const field = noise2(seed)
  const list: Mote[] = Array.from({ length: countFor(w, h, 40) }, () => ({ x: rng() * w, y: rng() * h, flash: 0, trail: [] }))
  let frame = 0

  return {
    step() {
      frame++
      const drift = frame * 0.004
      for (const mote of list) {
        mote.trail.unshift([mote.x, mote.y])
        mote.trail.length = Math.min(mote.trail.length, TRAIL)
        const at = (dx: number, dy: number) => field((mote.x + dx) * SCALE + drift, (mote.y + dy) * SCALE - drift * 0.6)
        // The curl of the field: the way round its hills and hollows, not up or down them.
        const vx = (at(0, EPS) - at(0, -EPS)) / (2 * EPS)
        const vy = -(at(EPS, 0) - at(-EPS, 0)) / (2 * EPS)
        const length = Math.hypot(vx, vy) || 1
        mote.x += (vx / length) * SPEED + 0.04
        mote.y += (vy / length) * SPEED - 0.05
        if (mote.flash > 0) mote.flash--
        else if (rng() < 0.004) mote.flash = FLASH_FRAMES
        if (mote.x < -3 || mote.x > w + 3 || mote.y < -3 || mote.y > h + 3) {
          mote.x = rng() * w
          mote.y = rng() * h
          mote.trail = []
        }
      }
    },
    draw(buf: Buf) {
      for (const mote of list) {
        mote.trail.forEach(([x, y], i) => buf.set(x, y, COLOURS[2 + Math.min(i, 2)]))
        buf.set(mote.x, mote.y, COLOURS[mote.flash > 0 ? 0 : 1])
      }
    },
  }
}
