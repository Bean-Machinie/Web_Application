import { circle, ENGRAVING_OPACITY, engraving, GOLD, polygon } from "@/lib/dice-label-engraving"
import { faceFitAvailable } from "@/lib/dice-face-fit"
import { FACE_SHAPES } from "@/lib/dice-label-shapes"
import type { FaceShape } from "@/lib/dice-label-shapes"
import { drawCapsFace } from "@/lib/dice-label-caps"
import { newCanvas, seedOf, toImage } from "@/lib/dice-label-canvas"
import { smoke } from "@/lib/dice-label-smoke"

// Numerals drawn as pictures, for the styles that engrave them. The library stretches a picture over the
// whole face texture (a square, 512 pixels at the sizes we use), so each face is drawn at that size.
const SIZE = 512
// The d4 places each of its three numbers in a small cell of the texture, a picture of this size in each.
const D4_CELL = 260
const SHINE = ["#e8c66a", "#b8912f"]
const FONT = "DiceNumerals, sans-serif"
const SHAPE: Record<string, string> = { d100: "d10" }

const cache = new Map<string, Promise<HTMLImageElement>>()

export type LabelLayout = "engraved" | "caps"

// The dice each layout draws; the others keep the library's own numerals. The caps need every corner of
// the face inside the texture: the d6, d8, d10 and d12 have that, and the d20 has it when its layout is
// fitted. The d4 never does, because the library puts its numbers in three fixed cells away from the corners.
export function typesOf(layout: LabelLayout) {
  if (layout === "engraved") return ["d4", "d6", "d8", "d10", "d100", "d12", "d20"]
  return faceFitAvailable() ? ["d6", "d8", "d10", "d100", "d12", "d20"] : ["d6", "d8", "d10", "d100", "d12"]
}

// One face, drawn once and kept.
export function faceLabel(type: string, text: string, layout: LabelLayout) {
  const key = `${layout}/${type}/${text}`
  let image = cache.get(key)
  if (!image) {
    const shape = FACE_SHAPES[type === "d20" && faceFitAvailable() ? "d20fit" : (SHAPE[type] ?? type)]
    const canvas = layout === "caps" ? drawCapsFace(shape, text) : type === "d4" ? drawD4(text) : drawFace(shape, text)
    image = toImage(canvas)
    cache.set(key, image)
  }
  return image
}

// Bold gold with a faint shine from top to bottom; a 6 or a 9 is underlined.
function numeral(ctx: CanvasRenderingContext2D, text: string, cx: number, cy: number, size: number) {
  const shine = ctx.createLinearGradient(0, cy - size * 0.4, 0, cy + size * 0.4)
  shine.addColorStop(0, SHINE[0])
  shine.addColorStop(1, SHINE[1])
  ctx.fillStyle = ctx.strokeStyle = shine
  ctx.font = `800 ${size}px ${FONT}`
  ctx.textAlign = "center"
  ctx.textBaseline = "middle"
  ctx.fillText(text, cx, cy)
  if (text === "6" || text === "9") {
    const half = ctx.measureText(text).width * 0.45
    ctx.lineWidth = size * 0.07
    ctx.beginPath()
    ctx.moveTo(cx - half, cy + size * 0.46)
    ctx.lineTo(cx + half, cy + size * 0.46)
    ctx.stroke()
  }
}

function drawFace(shape: FaceShape, text: string) {
  const { canvas, ctx } = newCanvas(SIZE)
  const seed = seedOf(text)
  smoke(ctx, SIZE, seed)
  const inner = shape.inradius * SIZE
  // Where the library puts its own numerals: a little below the middle, and lower on the d10.
  const center = { x: SIZE / 2, y: shape === FACE_SHAPES.d10 ? SIZE * 0.58 : SIZE * 0.52 }
  // One size for every number of a die, small enough that a two-digit one still sits inside the ring.
  const size = inner * 1.3
  engraving(ctx, SIZE, center, inner * 0.98, shape, seed, Math.max(2, inner * 1.15 * 0.028))
  numeral(ctx, text, center.x, center.y, size)
  return canvas
}

// The d4 is limited to the three small cells its numbers go in, which the face's edges cut into at the
// top, so each number gets a larger numeral and a small ornament under it, and no figure around it.
function drawD4(text: string) {
  const { canvas, ctx } = newCanvas(D4_CELL)
  const mid = D4_CELL / 2
  const line = 3
  ctx.save()
  ctx.globalAlpha = ENGRAVING_OPACITY
  ctx.strokeStyle = ctx.fillStyle = GOLD
  ctx.lineWidth = line
  ctx.lineCap = "round"
  const y = mid + D4_CELL * 0.43
  const half = D4_CELL * 0.26
  ctx.beginPath()
  ctx.moveTo(mid - half, y)
  ctx.lineTo(mid - D4_CELL * 0.05, y)
  ctx.moveTo(mid + D4_CELL * 0.05, y)
  ctx.lineTo(mid + half, y)
  ctx.stroke()
  polygon(ctx, { x: mid, y }, D4_CELL * 0.035, 4, Math.PI / 4)
  circle(ctx, { x: mid - half - line * 2, y }, line * 1.2, true)
  circle(ctx, { x: mid + half + line * 2, y }, line * 1.2, true)
  ctx.restore()
  numeral(ctx, text, mid, mid - D4_CELL * 0.02, D4_CELL * 0.73)
  return canvas
}
