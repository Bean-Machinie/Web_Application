import { between } from "@/lib/roll-effect"
import type { Effect } from "@/lib/roll-effect"

const CELL = 4
const GRAVITY = 520
const FALL = 0.9
const DUST = 28

type Piece = { x: number; y: number; vx: number; vy: number; turn: number; spin: number; age: number; color: string }
type Puff = { x: number; y: number; age: number; size: number }

// The glyphs of the number, drawn once off screen, as the pieces it is made of.
function piecesOf(rect: DOMRect, font: string, text: string, color: string): Piece[] {
  const width = Math.ceil(rect.width)
  const height = Math.ceil(rect.height)
  const sheet = document.createElement("canvas")
  sheet.width = width
  sheet.height = height
  const ctx = sheet.getContext("2d", { willReadFrequently: true })
  if (!ctx) return []
  ctx.font = font
  ctx.fillStyle = color
  ctx.textAlign = "center"
  ctx.textBaseline = "middle"
  ctx.fillText(text, width / 2, height / 2)
  const pixels = ctx.getImageData(0, 0, width, height).data
  const pieces: Piece[] = []
  for (let y = 0; y + CELL <= height; y += CELL) {
    for (let x = 0; x + CELL <= width; x += CELL) {
      const at = ((y + CELL / 2) * width + x + CELL / 2) * 4
      if (pixels[at + 3] < 128) continue
      // The pieces nearest the crack go first, and the rest follow outward.
      const away = Math.abs(x + CELL / 2 - width / 2)
      pieces.push({
        x: rect.left + x + CELL / 2,
        y: rect.top + y + CELL / 2,
        vx: between(-30, 30) + (x - width / 2) * 0.4,
        vy: between(-90, -10),
        turn: between(0, Math.PI),
        spin: between(-4, 4),
        age: -(away / width) * 0.35,
        color: `rgb(${pixels[at]} ${pixels[at + 1]} ${pixels[at + 2]})`,
      })
    }
  }
  return pieces
}

// The number breaks into small squares that fall and fade, with a few soft grey puffs of dust where they land.
export function createCrumble(rect: DOMRect, el: HTMLElement, color: string): Effect {
  const style = getComputedStyle(el)
  const pieces = piecesOf(rect, `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`, el.dataset.text ?? "", color)
  const puffs: Puff[] = Array.from({ length: DUST }, () => ({
    x: rect.left + rect.width / 2 + between(-0.7, 0.7) * rect.width,
    y: rect.bottom + between(50, 90),
    age: -between(0.2, 0.6),
    size: between(8, 18),
  }))

  return {
    step(dt) {
      for (const piece of pieces) {
        piece.age += dt
        if (piece.age <= 0) continue
        piece.vy += GRAVITY * dt
        piece.x += piece.vx * dt
        piece.y += piece.vy * dt
        piece.turn += piece.spin * dt
      }
      for (const puff of puffs) puff.age += dt
      return pieces.some((piece) => piece.age < FALL) || puffs.some((puff) => puff.age < 0.8)
    },
    draw(ctx) {
      for (const piece of pieces) {
        if (piece.age >= FALL) continue
        ctx.save()
        ctx.globalAlpha = piece.age <= 0 ? 1 : 1 - piece.age / FALL
        ctx.translate(piece.x, piece.y)
        ctx.rotate(piece.turn)
        ctx.fillStyle = piece.color
        ctx.fillRect(-CELL / 2, -CELL / 2, CELL, CELL)
        ctx.restore()
      }
      for (const puff of puffs) {
        if (puff.age <= 0 || puff.age >= 0.8) continue
        const t = puff.age / 0.8
        const radius = puff.size * (1 + t)
        const cloud = ctx.createRadialGradient(puff.x, puff.y - t * 14, 0, puff.x, puff.y - t * 14, radius)
        cloud.addColorStop(0, `rgb(150 142 142 / ${0.28 * (1 - t)})`)
        cloud.addColorStop(1, "rgb(150 142 142 / 0)")
        ctx.fillStyle = cloud
        ctx.fillRect(puff.x - radius, puff.y - t * 14 - radius, radius * 2, radius * 2)
      }
    },
  }
}
