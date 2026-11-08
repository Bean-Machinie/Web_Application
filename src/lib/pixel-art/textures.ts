import { pack } from "./buffer"
import type { Buf, Rgb } from "./buffer"
import { bayerAt, noise1, seeded } from "./noise"

// The textures are laid down once, in two shades of the card: a lighter one in the colour of the text
// (`ink`), and a darker one, black. Both are barely there, so they read as the card's own surface.
const light = (ink: Rgb, alpha: number) => pack(ink, alpha * 255)
const dark = (alpha: number) => pack([0, 0, 0], alpha * 255)

const BRICK_W = 12
const BRICK_H = 5

// A brick wall: courses of bricks, each course shifted half a brick from the one above, the mortar
// between them the darker shade, and the faces of the bricks dithered to differing degrees.
export function bricks(buf: Buf, ink: Rgb, seed: number) {
  const rng = seeded(seed)
  const levels = new Map<string, number>()
  for (let y = 0; y < buf.h; y++) {
    const course = Math.floor(y / BRICK_H)
    const shift = (course % 2) * (BRICK_W / 2)
    for (let x = 0; x < buf.w; x++) {
      if (y % BRICK_H === BRICK_H - 1 || (x + shift) % BRICK_W === BRICK_W - 1) {
        buf.set(x, y, dark(0.16))
        continue
      }
      const brick = `${course}:${Math.floor((x + shift) / BRICK_W)}`
      if (!levels.has(brick)) levels.set(brick, 0.2 + rng() * 0.45)
      if (levels.get(brick)! > bayerAt(x, y)) buf.set(x, y, light(ink, 0.08))
    }
  }
}

// Vines hanging from the top edge: stems of one pixel that wave from side to side, with small leaves of a
// pixel or two on alternate sides along them.
export function vines(buf: Buf, ink: Rgb, seed: number) {
  const rng = seeded(seed)
  const stems = Math.max(6, Math.round(buf.w / 9))
  for (let i = 0; i < stems; i++) {
    const x = rng() * buf.w
    const length = 12 + rng() * buf.h * 0.55
    const phase = rng() * 6
    const sway = 1 + rng() * 1.5
    let side = rng() < 0.5 ? -1 : 1
    for (let y = 0; y < length; y++) {
      const at = x + Math.sin(y * 0.28 + phase) * sway
      buf.set(at, y, light(ink, 0.12))
      if (y > 4 && y % 6 === Math.floor(phase) % 6) {
        buf.set(at + side, y, light(ink, 0.18))
        buf.set(at + side * 2, y + 1, light(ink, 0.14))
        side = -side
      }
    }
  }
}

const RIDGES = [
  { base: 0.6, rise: 0.22, scale: 16, shade: (ink: Rgb) => light(ink, 0.08) },
  { base: 0.74, rise: 0.2, scale: 11, shade: (ink: Rgb) => light(ink, 0.05) },
  { base: 0.88, rise: 0.16, scale: 7, shade: () => dark(0.12) },
]

// Mountains along the bottom: three ridges from noise, each in front of the last. The far ones are the
// lighter shade, the near one the darker, and each is dithered along its top.
export function ridges(buf: Buf, ink: Rgb, seed: number) {
  RIDGES.forEach((ridge, index) => {
    const line = noise1(seed + index * 31)
    const colour = ridge.shade(ink)
    for (let x = 0; x < buf.w; x++) {
      const top = Math.round(buf.h * (ridge.base - line(x / ridge.scale) * ridge.rise))
      for (let y = Math.max(top, 0); y < buf.h; y++) {
        const depth = y - top
        if (depth < 3 && bayerAt(x, y) > (depth + 1) / 4) continue
        buf.set(x, y, colour)
      }
    }
  })
}
