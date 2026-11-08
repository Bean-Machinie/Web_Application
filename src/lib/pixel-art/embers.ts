import { hex, pack } from "./buffer"
import type { Buf } from "./buffer"
import { FPS, countFor } from "./effect"
import type { Effect } from "./effect"
import { bayerAt } from "./noise"
import type { Rng } from "./noise"

// Bright, yellow, orange, red and dark red.
const COLOURS = ["#fff1a8", "#f7c948", "#ee8a2b", "#cf3f1f", "#7a1f14"].map((value) => pack(hex(value)))
const BAND = 10
// A brighter, faster spark comes this often, in frames, give or take.
const SPECIAL_EVERY = FPS * 4

type Spark = { x: number; y: number; vx: number; vy: number; age: number; life: number; phase: number; special: boolean }

// Embers: sparks that rise with a slight sway, cooling over their life from yellow through orange and red
// to dark red; a band of dithered warm pixels along the bottom edge that flickers like the fire under it;
// and now and then one spark that is brighter, bigger and faster than the rest.
export function embers(w: number, h: number, rng: Rng): Effect {
  const max = countFor(w, h, 55)
  let sparks: Spark[] = []
  let frame = 0
  let nextSpecial = SPECIAL_EVERY

  const spark = (special: boolean): Spark => ({
    x: rng() * w,
    y: h - 1 - rng() * 3,
    vx: (rng() - 0.5) * 0.12,
    vy: special ? -(1.1 + rng() * 0.4) : -(0.3 + rng() * 0.55),
    age: 0,
    life: special ? 70 : 40 + rng() * 45,
    phase: rng() * 6,
    special,
  })

  return {
    step() {
      frame++
      if (sparks.length < max && rng() < 0.8) sparks.push(spark(false))
      if (frame >= nextSpecial) {
        sparks.push(spark(true))
        nextSpecial = frame + SPECIAL_EVERY * (0.75 + rng() * 0.6)
      }
      for (const one of sparks) {
        one.age++
        one.x += one.vx + Math.sin(one.age * 0.16 + one.phase) * 0.2
        one.y += one.vy
      }
      sparks = sparks.filter((one) => one.age < one.life && one.y > -3)
    },
    draw(buf: Buf) {
      const flicker = 0.7 + 0.2 * Math.sin(frame * 0.4) + 0.1 * Math.sin(frame * 0.97 + 2)
      for (let y = h - BAND; y < h; y++) {
        const up = (h - 1 - y) / BAND
        for (let x = 0; x < w; x++) {
          if ((1 - up) * flicker > bayerAt(x, y) * 0.9) buf.set(x, y, COLOURS[up < 0.35 ? 2 : up < 0.7 ? 3 : 4])
        }
      }
      for (const one of sparks) {
        const age = one.age / one.life
        const colour = one.special ? (age < 0.5 ? 0 : 1) : age < 0.25 ? 1 : age < 0.55 ? 2 : age < 0.8 ? 3 : 4
        const size = one.special ? 2 : 1
        buf.rect(one.x, one.y, size, size, COLOURS[colour])
      }
    },
  }
}
