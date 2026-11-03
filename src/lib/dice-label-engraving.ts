import type { FaceShape } from "@/lib/dice-label-shapes"

export const GOLD = "#d4af37"
// The engraving is quieter than the numeral, so the number reads first.
export const ENGRAVING_OPACITY = 0.7

export type Point = { x: number; y: number }
export const around = (center: Point, radius: number, angle: number): Point => ({
  x: center.x + radius * Math.cos(angle),
  y: center.y + radius * Math.sin(angle),
})

export function polygon(ctx: CanvasRenderingContext2D, center: Point, radius: number, sides: number, turn: number) {
  ctx.beginPath()
  for (let i = 0; i < sides; i++) {
    const point = around(center, radius, turn + (i * 2 * Math.PI) / sides)
    ctx[i === 0 ? "moveTo" : "lineTo"](point.x, point.y)
  }
  ctx.closePath()
  ctx.stroke()
}

export function circle(ctx: CanvasRenderingContext2D, center: Point, radius: number, fill = false) {
  ctx.beginPath()
  ctx.arc(center.x, center.y, radius, 0, Math.PI * 2)
  ctx[fill ? "fill" : "stroke"]()
}

// The point a line toward a face corner stops at: short of the corner, and inside the picture.
function reachOf(shape: FaceShape, size: number, angle: number): Point {
  const wanted = shape.circumradius * size * 0.92
  const toEdge = (size / 2) * 0.93 / Math.max(Math.abs(Math.cos(angle)), Math.abs(Math.sin(angle)))
  return around({ x: size / 2, y: size / 2 }, Math.min(wanted, toEdge), angle)
}

const turnBetween = (a: number, b: number) => Math.abs(Math.atan2(Math.sin(a - b), Math.cos(a - b)))

// Fine gold lines: a ring, a figure inside it that differs by value, and from each corner of the figure a
// line out toward the nearest corner of the face. All of it but those lines stays inside the ring.
export function engraving(ctx: CanvasRenderingContext2D, size: number, center: Point, ring: number, shape: FaceShape, seed: number, line: number) {
  ctx.save()
  ctx.globalAlpha = ENGRAVING_OPACITY
  ctx.strokeStyle = ctx.fillStyle = GOLD
  ctx.lineWidth = line
  circle(ctx, center, ring)
  const turn = ((seed % 12) * Math.PI) / 6
  const variant = seed % 3
  const reach = ring * 0.9
  // Two triangles and a hexagon both have six corners; a single triangle has three.
  const corners = variant === 1 ? 3 : 6
  if (variant === 2) polygon(ctx, center, reach, 6, turn)
  else polygon(ctx, center, reach, 3, turn)
  if (variant === 0) polygon(ctx, center, reach, 3, turn + Math.PI / 3)
  if (variant === 1) circle(ctx, center, ring * 0.72)

  // Fine ticks inside the ring.
  ctx.lineWidth = line * 0.6
  ctx.beginPath()
  for (let i = 0; i < 24; i++) {
    const angle = turn / 2 + (i * Math.PI) / 12
    const from = around(center, ring * 0.955, angle)
    const to = around(center, ring * 0.99, angle)
    ctx.moveTo(from.x, from.y)
    ctx.lineTo(to.x, to.y)
  }
  ctx.stroke()

  ctx.lineWidth = line
  for (let i = 0; i < corners; i++) {
    const angle = turn + (i * 2 * Math.PI) / corners
    const vertex = around(center, reach, angle)
    circle(ctx, vertex, line * 1.6, true)
    if (shape.corners.length === 0) continue
    const corner = shape.corners.reduce((best, next) => (turnBetween(next, angle) < turnBetween(best, angle) ? next : best))
    const end = reachOf(shape, size, corner)
    ctx.beginPath()
    ctx.moveTo(vertex.x, vertex.y)
    ctx.lineTo(end.x, end.y)
    ctx.stroke()
    circle(ctx, end, line * 1.2, true)
  }
  ctx.restore()
}
