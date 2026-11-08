import { hex, pack } from "./buffer"
import type { Buf } from "./buffer"
import { FPS, countFor } from "./effect"
import type { Effect } from "./effect"
import type { Rng } from "./noise"

// Off-white, pale grey, grey, dim grey and dark grey.
const COLOURS = ["#f3f3ef", "#cdd0d6", "#9ba1ad", "#6a7080", "#434958"].map((value) => pack(hex(value)))

// Three depths. The far flakes are one dim pixel and slow; the near ones two bright pixels and fast.
const LAYERS = [
  { base: 44, size: 1, colours: [3], fall: 0.12, wind: 0.5 },
  { base: 26, size: 1, colours: [2, 1], fall: 0.22, wind: 0.85 },
  { base: 12, size: 2, colours: [0, 1], fall: 0.4, wind: 1.3 },
]

type Flake = { x: number; y: number; layer: number; colour: number; curl: number; angle: number }

// Ash in the wind: flakes falling on a slant in three layers of depth. The wind comes in gusts, its
// speed easing up and down over five seconds or so, and in a strong gust some flakes curl round in a
// small loop for a moment before they fall on.
export function ash(w: number, h: number, rng: Rng): Effect {
  const flakes: Flake[] = LAYERS.flatMap((layer, index) =>
    Array.from({ length: countFor(w, h, layer.base) }, () => ({
      x: rng() * w,
      y: rng() * h,
      layer: index,
      colour: layer.colours[Math.floor(rng() * layer.colours.length)],
      curl: 0,
      angle: 0,
    }))
  )
  let frame = 0

  // From 0 (a lull) to 1 (a strong gust), easing up and down over about five seconds.
  const wind = () => {
    const seconds = frame / FPS
    return 0.5 + 0.35 * Math.sin((2 * Math.PI * seconds) / 5.3) + 0.15 * Math.sin((2 * Math.PI * seconds) / 8.1 + 1.3)
  }

  return {
    step() {
      frame++
      const gust = wind()
      const strong = Math.max(0, gust - 0.7) / 0.3
      for (const flake of flakes) {
        const layer = LAYERS[flake.layer]
        flake.x += layer.wind * (0.15 + gust * 0.9)
        flake.y += layer.fall
        if (flake.curl > 0) {
          flake.curl--
          flake.angle += 0.5
          flake.x += Math.cos(flake.angle) * 0.7
          flake.y += Math.sin(flake.angle) * 0.45
        } else if (strong > 0.2 && rng() < 0.012 * strong) {
          flake.curl = 16
          flake.angle = rng() * 6
        }
        if (flake.x < -2) flake.x += w + 4
        if (flake.x > w + 2) flake.x -= w + 4
        if (flake.y > h + 1) {
          flake.y = -1
          flake.x = rng() * w
        }
      }
    },
    draw(buf: Buf) {
      for (const flake of flakes) buf.rect(flake.x, flake.y, LAYERS[flake.layer].size, LAYERS[flake.layer].size, COLOURS[flake.colour])
    },
  }
}
