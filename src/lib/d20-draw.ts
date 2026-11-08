import { edgeDots, FACE_CENTRES, faceDots, rotate } from "./icosahedron"
import type { Vec3 } from "./icosahedron"

const EDGES = edgeDots(18)
const STIPPLE = faceDots(16)
const VIEWER = 4
const length = ([x, y, z]: Vec3) => Math.hypot(x, y, z)
const unit = (v: Vec3): Vec3 => [v[0] / length(v), v[1] / length(v), v[2] / length(v)]
const NORMALS = FACE_CENTRES.map(unit)
// The light comes from the upper left, in front.
const LIGHT = unit([-0.45, 0.6, 0.66])
// The faces that carry a pin, spread round the die.
export const PIN_FACES = [0, 3, 7, 10, 13, 16, 19]
const PIN_LENGTH = 0.28
const PULSE_MS = 1400

export type D20Look = {
  cx: number
  cy: number
  radius: number
  yaw: number
  pitch: number
  ink: string
  accent: string
  // How far each pin stands out, 0 to 1, in the order of PIN_FACES.
  pins: number[]
  // How much the die is lit up as it is pointed at, 0 to 1.
  glow: number
  now: number
}

// A d20 drawn as a dotted globe is: fine dots packed over its faces, each face as bright as the light
// falling on it, its edges in brighter rows, a soft halo, and pins standing out of some faces with
// glowing heads that ripple while it is lit. The far side is left out but for its faint edges.
export function drawD20(ctx: CanvasRenderingContext2D, look: D20Look) {
  const { cx, cy, radius, yaw, pitch, glow } = look
  const size = Math.max(1, radius / 160)
  const project = (p: Vec3) => {
    const [x, y, z] = rotate(p, yaw, pitch)
    const s = VIEWER / (VIEWER - z)
    return [cx + x * radius * s, cy - y * radius * s, z] as const
  }
  const square = (x: number, y: number, side: number, alpha: number) => {
    ctx.globalAlpha = alpha
    ctx.fillRect(x - side / 2, y - side / 2, side, side)
  }

  const halo = ctx.createRadialGradient(cx, cy, radius * 0.6, cx, cy, radius * 1.3)
  halo.addColorStop(0, look.ink)
  halo.addColorStop(1, "transparent")
  ctx.fillStyle = halo
  ctx.globalAlpha = 0.05 + glow * 0.05
  ctx.fillRect(cx - radius * 1.3, cy - radius * 1.3, radius * 2.6, radius * 2.6)

  const faces = NORMALS.map((normal) => {
    const n = rotate(normal, yaw, pitch)
    return { front: n[2], light: Math.max(0, n[0] * LIGHT[0] + n[1] * LIGHT[1] + n[2] * LIGHT[2]) }
  })
  ctx.fillStyle = look.ink
  for (const { face, point } of STIPPLE) {
    const { front, light } = faces[face]
    if (front <= 0) continue
    const [x, y] = project(point)
    square(x, y, size * 1.6, (0.07 + light * (0.5 + glow * 0.15)) * Math.sqrt(front))
  }
  for (const point of EDGES) {
    const [x, y, z] = project(point)
    square(x, y, size * (z > 0 ? 2 : 1.4), z > 0 ? 0.35 + z * 0.5 : 0.06)
  }

  PIN_FACES.forEach((face, index) => {
    const centre = FACE_CENTRES[face]
    const out = 1 + PIN_LENGTH * look.pins[index]
    const [bx, by, bz] = project(centre)
    const [tx, ty, tz] = project([centre[0] * out, centre[1] * out, centre[2] * out])
    if (tz <= 0.05 || faces[face].front <= 0) return
    const fade = Math.min(1, tz * 3)
    ctx.strokeStyle = look.ink
    ctx.lineWidth = size
    ctx.globalAlpha = 0.55 * fade
    ctx.beginPath()
    ctx.moveTo(bx, by)
    ctx.lineTo(tx, ty)
    ctx.stroke()
    ctx.fillStyle = look.accent
    if (glow > 0) {
      const phase = ((look.now / PULSE_MS + index * 0.17) % 1 + 1) % 1
      ctx.globalAlpha = (1 - phase) * 0.6 * glow * fade
      ctx.beginPath()
      ctx.arc(tx, ty, size * (3 + phase * 9), 0, Math.PI * 2)
      ctx.lineWidth = size
      ctx.strokeStyle = look.accent
      ctx.stroke()
    }
    ctx.globalAlpha = fade
    ctx.beginPath()
    ctx.arc(tx, ty, size * (2.4 + look.pins[index] * 0.8), 0, Math.PI * 2)
    ctx.fill()
    square(bx, by, size * 2, 0.6 * fade * (bz > 0 ? 1 : 0))
  })
  ctx.globalAlpha = 1
}
