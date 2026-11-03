import { newCanvas } from "@/lib/dice-label-canvas"
import type { Point } from "@/lib/dice-label-engraving"
import type { FaceShape } from "@/lib/dice-label-shapes"

// Gold corner caps with a curved inner edge, around the library's own gold numerals.
const SIZE = 512
const GOLD = "#d4af37"
const HIGHLIGHT = "#f0d27a"
const NUMERAL = "#d4af37"
const FONT = "DiceNumerals, sans-serif"
// How far a cap runs along each edge, as a part of the edge's length.
const REACH = 0.24
// How far the inner curve bows toward the corner: 0 is a straight edge, 1 touches the corner.
const BOW = 0.7
// The gap between the cap's curve and the thin arc inside it, in pixels.
const GAP = 7

const mix = (a: Point, b: Point, t: number): Point => ({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t })

// One cap, at the corner `index` of the face.
function cap(ctx: CanvasRenderingContext2D, points: Point[], index: number, middle: Point) {
  const corner = points[index]
  const before = points[(index + points.length - 1) % points.length]
  const after = points[(index + 1) % points.length]
  const start = mix(corner, before, REACH)
  const end = mix(corner, after, REACH)
  // The curve is concave: its control point is pulled toward the corner, so the cap is a slim bracket.
  const control = mix(mix(start, end, 0.5), corner, BOW)

  ctx.beginPath()
  ctx.moveTo(corner.x, corner.y)
  ctx.lineTo(start.x, start.y)
  ctx.quadraticCurveTo(control.x, control.y, end.x, end.y)
  ctx.closePath()
  ctx.fillStyle = ctx.strokeStyle = GOLD
  ctx.lineJoin = "round"
  // A stroke in the same gold rounds the tip and both ends.
  ctx.lineWidth = 3
  ctx.fill()
  ctx.stroke()

  ctx.strokeStyle = HIGHLIGHT
  ctx.globalAlpha = 0.85
  ctx.lineWidth = 1.6
  ctx.beginPath()
  ctx.moveTo(start.x, start.y)
  const raised = mix(control, corner, 0.12)
  ctx.quadraticCurveTo(raised.x, raised.y, end.x, end.y)
  ctx.stroke()
  ctx.globalAlpha = 1

  // The thin arc runs parallel, a small gap further toward the middle of the face, a little shorter.
  const reach = Math.hypot(middle.x - corner.x, middle.y - corner.y)
  const inward = { x: (middle.x - corner.x) / reach, y: (middle.y - corner.y) / reach }
  const shift = (point: Point): Point => ({ x: point.x + inward.x * GAP, y: point.y + inward.y * GAP })
  ctx.strokeStyle = GOLD
  ctx.lineWidth = 2.4
  ctx.lineCap = "round"
  ctx.beginPath()
  const from = mix(shift(start), shift(end), 0.12)
  const to = mix(shift(start), shift(end), 0.88)
  ctx.moveTo(from.x, from.y)
  ctx.quadraticCurveTo(shift(control).x, shift(control).y, to.x, to.y)
  ctx.stroke()
}

// The numeral as the library would draw it, and a cap at every corner the texture shows. A 6 or a 9 gets
// the library's own dot.
export function drawCapsFace(shape: FaceShape, text: string) {
  const { canvas, ctx } = newCanvas(SIZE)
  ctx.font = `${shape.numeral.size}px ${FONT}`
  ctx.fillStyle = NUMERAL
  ctx.textAlign = "center"
  ctx.textBaseline = "middle"
  const x = shape.numeral.x ?? SIZE / 2
  ctx.fillText(text, x, shape.numeral.y)
  if (text === "6" || text === "9") ctx.fillText("  .", x, shape.numeral.y)

  const points = shape.points ?? []
  const middle = { x: SIZE / 2, y: SIZE / 2 }
  // The picture's outermost pixels are stretched past a face's edge, so they must stay clear.
  ctx.save()
  ctx.beginPath()
  ctx.rect(2, 2, SIZE - 4, SIZE - 4)
  ctx.clip()
  points.forEach((_, index) => cap(ctx, points, index, middle))
  ctx.restore()
  return canvas
}
