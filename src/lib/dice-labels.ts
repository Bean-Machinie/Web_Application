import { around, circle, ENGRAVING_OPACITY, engraving, GOLD, polygon } from "@/lib/dice-label-engraving"
import { FACE_SHAPES } from "@/lib/dice-label-shapes"
import type { FaceShape } from "@/lib/dice-label-shapes"
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

// One face, drawn once and kept.
export function faceLabel(type: string, text: string) {
  const key = `${type}/${text}`
  let image = cache.get(key)
  if (!image) {
    image = toImage(type === "d4" ? drawD4(text) : drawFace(FACE_SHAPES[SHAPE[type] ?? type], text))
    cache.set(key, image)
  }
  return image
}

async function toImage(canvas: HTMLCanvasElement) {
  const image = new Image()
  image.src = canvas.toDataURL("image/png")
  await image.decode()
  return image
}

function newCanvas(size: number) {
  const canvas = document.createElement("canvas")
  canvas.width = canvas.height = size
  return { canvas, ctx: canvas.getContext("2d")! }
}

// The same figure for a value every time, but not the same for every value.
function seedOf(text: string) {
  return [...text].reduce((sum, char) => sum * 31 + char.charCodeAt(0), 7)
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

// The d4 is limited to the three small cells its numbers go in, so the triangle and dots go around each number.
function drawD4(text: string) {
  const { canvas, ctx } = newCanvas(D4_CELL)
  const mid = D4_CELL / 2
  const size = D4_CELL * 0.5
  const line = Math.max(2, size * 0.033)
  const center = { x: mid, y: mid + D4_CELL * 0.04 }
  ctx.save()
  ctx.globalAlpha = ENGRAVING_OPACITY
  ctx.strokeStyle = ctx.fillStyle = GOLD
  ctx.lineWidth = line
  const turn = -Math.PI / 2
  polygon(ctx, center, D4_CELL * 0.46, 3, turn)
  for (let i = 0; i < 3; i++) circle(ctx, around(center, D4_CELL * 0.46, turn + (i * 2 * Math.PI) / 3), line * 1.6, true)
  ctx.restore()
  numeral(ctx, text, mid, mid + D4_CELL * 0.08, size)
  return canvas
}
