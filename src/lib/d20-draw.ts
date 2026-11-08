import { FACE_DOTS, FACE_STEPS } from "./d20-numbers"
import { edgeDots, FACE_CENTRES } from "./icosahedron"
import type { Vec3 } from "./icosahedron"

// The edges' dots as far apart as the faces', so the whole die shares one grain.
const EDGES = edgeDots(FACE_STEPS)
const VIEWER = 4
const length = ([x, y, z]: Vec3) => Math.hypot(x, y, z)
const unit = (v: Vec3): Vec3 => [v[0] / length(v), v[1] / length(v), v[2] / length(v)]
const NORMALS = FACE_CENTRES.map(unit)
// The light comes from the upper left, in front.
const LIGHT = unit([-0.45, 0.6, 0.66])

// 0 below `from`, 1 above `to`, easing in between.
const smoothstep = (from: number, to: number, value: number) => {
  const t = Math.max(0, Math.min(1, (value - from) / (to - from)))
  return t * t * (3 - 2 * t)
}

export type D20Look = {
  cx: number
  cy: number
  radius: number
  yaw: number
  pitch: number
  ink: string
  // The colour the numbers are drawn in, which stands out from the faces.
  digit: string
  // How much the die is lit up as it is pointed at, 0 to 1.
  glow: number
}

// A d20 drawn as a dotted globe: one even grid of fine dots over its faces, each face as bright as the
// light falling on it but kept subtle, the dots on its number's strokes in a bright colour of their own,
// its edges in brighter rows and a soft halo. Faces fade in gently as they turn into view and the far
// side is left out, edges and all, so nothing shows through at the rim.
export function drawD20(ctx: CanvasRenderingContext2D, look: D20Look) {
  const { cx, cy, radius, yaw, pitch, glow } = look
  const size = Math.max(1, radius / 160)
  // The turn worked out once a frame, as there are thousands of dots to turn.
  const [cosYaw, sinYaw, cosPitch, sinPitch] = [Math.cos(yaw), Math.sin(yaw), Math.cos(pitch), Math.sin(pitch)]
  const turn = ([x, y, z]: Vec3): Vec3 => {
    const x1 = x * cosYaw + z * sinYaw
    const z1 = -x * sinYaw + z * cosYaw
    return [x1, y * cosPitch - z1 * sinPitch, y * sinPitch + z1 * cosPitch]
  }
  const fill = (points: Vec3[], side: number) => {
    for (const point of points) {
      const [x, y, z] = turn(point)
      const s = (VIEWER / (VIEWER - z)) * radius
      ctx.fillRect(cx + x * s - side / 2, cy - y * s - side / 2, side, side)
    }
  }

  const halo = ctx.createRadialGradient(cx, cy, radius * 0.6, cx, cy, radius * 1.3)
  halo.addColorStop(0, look.ink)
  halo.addColorStop(1, "transparent")
  ctx.fillStyle = halo
  ctx.globalAlpha = 0.05 + glow * 0.05
  ctx.fillRect(cx - radius * 1.3, cy - radius * 1.3, radius * 2.6, radius * 2.6)

  NORMALS.forEach((normal, face) => {
    const n = turn(normal)
    if (n[2] <= 0) return
    const light = Math.max(0, n[0] * LIGHT[0] + n[1] * LIGHT[1] + n[2] * LIGHT[2])
    // Faces only just turned toward the viewer are squeezed into the rim, so they come in faintly.
    const facing = smoothstep(0, 0.55, n[2])
    const { plain, strokes } = FACE_DOTS[face]
    ctx.fillStyle = look.ink
    ctx.globalAlpha = (0.04 + light * (0.22 + glow * 0.08)) * facing
    fill(plain, size * 1.3)
    // The digits at full strength on a face turned toward the viewer, fading as it turns away.
    ctx.fillStyle = look.digit
    strokes.forEach((points, level) => {
      ctx.globalAlpha = ((level + 1) / strokes.length) * facing
      fill(points, size * 1.3)
    })
  })

  ctx.fillStyle = look.ink
  for (const point of EDGES) {
    const [x, y, z] = turn(point)
    const s = (VIEWER / (VIEWER - z)) * radius
    // Edges on the rim fade out just past it rather than showing through from the far side.
    const shown = smoothstep(-0.12, 0.12, z)
    if (shown === 0) continue
    const side = size * 1.8
    ctx.globalAlpha = (0.18 + Math.max(0, z) * 0.24) * shown
    ctx.fillRect(cx + x * s - side / 2, cy - y * s - side / 2, side, side)
  }
  ctx.globalAlpha = 1
}
