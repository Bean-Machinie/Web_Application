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

// The corners of the face as points: exact where the layout is known, else from their angles.
function cornersOf(shape: FaceShape, size: number): Point[] {
  if (shape.points) return shape.points
  return shape.corners.map((angle) => around({ x: size / 2, y: size / 2 }, shape.circumradius * size, angle))
}

// A line toward a corner stops a little short of it, and inside the picture.
function stopShort(corner: Point, center: Point, size: number): Point {
  const clamp = (value: number) => Math.min(size * 0.965, Math.max(size * 0.035, value))
  return { x: clamp(corner.x + (center.x - corner.x) * 0.08), y: clamp(corner.y + (center.y - corner.y) * 0.08) }
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
  const targets = cornersOf(shape, size)
  for (let i = 0; i < corners; i++) {
    const angle = turn + (i * 2 * Math.PI) / corners
    const vertex = around(center, reach, angle)
    circle(ctx, vertex, line * 1.6, true)
    if (targets.length === 0) continue
    const facing = (corner: Point) => turnBetween(Math.atan2(corner.y - center.y, corner.x - center.x), angle)
    const end = stopShort(targets.reduce((best, next) => (facing(next) < facing(best) ? next : best)), center, size)
    ctx.beginPath()
    ctx.moveTo(vertex.x, vertex.y)
    ctx.lineTo(end.x, end.y)
    ctx.stroke()
    circle(ctx, end, line * 1.2, true)
  }
  ctx.restore()
}
