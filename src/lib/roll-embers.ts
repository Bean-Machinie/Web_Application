import { between } from "@/lib/roll-effect"
import type { Effect } from "@/lib/roll-effect"

const COUNT = 60
const GRAVITY = 520
const DRAG = 2.4
const COLORS = ["#f6e3a1", "#e8c66a", "#c9a441"]

type Ember = { x: number; y: number; vx: number; vy: number; age: number; life: number; size: number; color: string; flicker: number }

// Gold embers thrown out from the number: they slow in the air, arc down and flicker out within about a second.
export function createEmbers(rect: DOMRect): Effect {
  const centre = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }
  const embers: Ember[] = Array.from({ length: COUNT }, () => {
    const angle = between(0, Math.PI * 2)
    const speed = between(160, 520)
    return {
      x: centre.x + Math.cos(angle) * rect.width * 0.25,
      y: centre.y + Math.sin(angle) * rect.height * 0.25,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 80,
      age: 0,
      life: between(0.7, 1.2),
      size: between(1, 3),
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      flicker: between(0, Math.PI * 2),
    }
  })

  return {
    step(dt) {
      const slow = Math.exp(-DRAG * dt)
      for (const ember of embers) {
        ember.age += dt
        ember.vx *= slow
        ember.vy = ember.vy * slow + GRAVITY * dt
        ember.x += ember.vx * dt
        ember.y += ember.vy * dt
      }
      return embers.some((ember) => ember.age < ember.life)
    },
    draw(ctx) {
      ctx.save()
      ctx.globalCompositeOperation = "lighter"
      for (const ember of embers) {
        if (ember.age >= ember.life) continue
        ctx.globalAlpha = (1 - ember.age / ember.life) * (0.65 + 0.35 * Math.sin(ember.age * 38 + ember.flicker))
        ctx.fillStyle = ember.color
        ctx.beginPath()
        ctx.arc(ember.x, ember.y, ember.size / 2, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.restore()
    },
  }
}
