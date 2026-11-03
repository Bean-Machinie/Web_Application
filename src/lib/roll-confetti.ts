import { between } from "@/lib/roll-effect"
import type { Effect } from "@/lib/roll-effect"

const PER_SIDE = 44
const GRAVITY = 900
const DRAG = 1.1
const COLORS = ["#f6e3a1", "#d4af37", "#c9a441", "#fff4d6", "#e8728f", "#58c4b4", "#f0a35a"]

type Piece = {
  x: number
  y: number
  vx: number
  vy: number
  age: number
  life: number
  width: number
  height: number
  turn: number
  spin: number
  flip: number
  flipSpeed: number
  color: string
  round: boolean
}

// Confetti bursts out beside the number, left and right: pieces are fired up and outward, tumble and flip as they
// slow, and then drift down and fade.
export function createConfetti(rect: DOMRect): Effect {
  const centre = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }
  const pieces: Piece[] = ([-1, 1] as const).flatMap((side) =>
    Array.from({ length: PER_SIDE }, () => {
      const lean = between(0.15, 0.75)
      const speed = between(520, 1000)
      return {
        // Just outside the number, on its own side, so the pieces do not start on top of the digits.
        x: centre.x + side * between(rect.width * 0.5 + 20, rect.width * 0.5 + 110),
        y: centre.y + between(-rect.height * 0.25, rect.height * 0.25),
        vx: side * Math.sin(lean) * speed,
        vy: -Math.cos(lean) * speed,
        age: -between(0, 0.22),
        life: between(1.5, 2.4),
        width: between(5, 9),
        height: between(8, 14),
        turn: between(0, Math.PI * 2),
        spin: between(-9, 9),
        flip: between(0, Math.PI * 2),
        flipSpeed: between(6, 16),
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        round: Math.random() < 0.25,
      }
    })
  )

  return {
    step(dt) {
      const slow = Math.exp(-DRAG * dt)
      for (const piece of pieces) {
        piece.age += dt
        if (piece.age <= 0) continue
        piece.vx *= slow
        piece.vy = piece.vy * slow + GRAVITY * dt
        piece.x += piece.vx * dt
        piece.y += piece.vy * dt
        piece.turn += piece.spin * dt
        piece.flip += piece.flipSpeed * dt
      }
      return pieces.some((piece) => piece.age < piece.life)
    },
    draw(ctx) {
      for (const piece of pieces) {
        if (piece.age <= 0 || piece.age >= piece.life) continue
        ctx.save()
        ctx.globalAlpha = Math.min(1, (piece.life - piece.age) / 0.4)
        ctx.translate(piece.x, piece.y)
        ctx.rotate(piece.turn)
        // Turning over: the piece is seen edge on now and then.
        ctx.scale(1, Math.cos(piece.flip))
        ctx.fillStyle = piece.color
        if (piece.round) {
          ctx.beginPath()
          ctx.arc(0, 0, piece.width / 2, 0, Math.PI * 2)
          ctx.fill()
        } else ctx.fillRect(-piece.width / 2, -piece.height / 2, piece.width, piece.height)
        ctx.restore()
      }
    },
  }
}
