import { useEffect, useRef } from "react"
import { useCanvasLoop } from "@/hooks/use-canvas-loop"
import type { CanvasFrame } from "@/hooks/use-canvas-loop"
import { useReducedMotion } from "@/hooks/use-reduced-motion"
import { useThemeColors } from "@/hooks/use-theme-colors"
import { drift, land, restingSpin, roll, throwTo } from "@/lib/d20-spin"
import { numberDots } from "@/lib/dot-digits"
import { edgeDots, FACE_CENTRES, rotate } from "@/lib/icosahedron"
import type { Vec3 } from "@/lib/icosahedron"
import { useTileHot } from "./tile-hot"

const DOTS = edgeDots(9)
const AMBER = "#f5b544"
const VIEWER = 4

type Face = { centre: Vec3; value: number; landedAt: number | null }

// A d20 drawn as dots along its edges, nearer dots larger and brighter, turning slowly. When its tile
// is hot it is thrown: it spins up, slows and lands with a face toward you showing a number from 1 to 20.
export function DottedD20({ className }: { className?: string }) {
  const canvas = useRef<HTMLCanvasElement>(null)
  const hot = useTileHot()
  const reduced = useReducedMotion()
  const { foreground } = useThemeColors()
  const spin = useRef(restingSpin())
  const face = useRef<Face | null>(null)
  const last = useRef(0)

  // Declared before the loop so a new throw is set up before the loop draws it.
  useEffect(() => {
    if (!hot) {
      spin.current.throw = null
      face.current = null
      return
    }
    const centre = FACE_CENTRES[Math.floor(Math.random() * FACE_CENTRES.length)]
    face.current = { centre, value: 1 + Math.floor(Math.random() * 20), landedAt: reduced ? 0 : null }
    throwTo(spin.current, centre, performance.now())
    if (reduced) land(spin.current)
  }, [hot, reduced])

  const kick = useCanvasLoop(
    canvas,
    ({ ctx, width, height, now }: CanvasFrame) => {
      const dt = last.current ? Math.min(0.1, (now - last.current) / 1000) : 0
      last.current = now
      const s = spin.current
      if (s.throw) {
        if (roll(s, now) && face.current && face.current.landedAt === null) face.current.landedAt = now
      } else if (!reduced) {
        drift(s, dt)
      }

      const radius = Math.min(width, height) * 0.36
      const [cx, cy] = [width / 2, height / 2]
      ctx.fillStyle = hot ? AMBER : foreground
      for (const dot of DOTS) {
        const [x, y, z] = rotate(dot, s.yaw, s.pitch)
        const depth = (z + 1) / 2
        const scale = VIEWER / (VIEWER - z)
        ctx.globalAlpha = 0.12 + depth * 0.7
        ctx.beginPath()
        ctx.arc(cx + x * radius * scale, cy - y * radius * scale, 0.7 + depth * 1.3, 0, Math.PI * 2)
        ctx.fill()
      }

      const shown = face.current
      if (shown?.landedAt != null) {
        const step = radius * 0.055
        ctx.fillStyle = AMBER
        ctx.globalAlpha = reduced ? 1 : Math.min(1, (now - shown.landedAt) / 250)
        for (const [dx, dy] of numberDots(shown.value)) {
          ctx.beginPath()
          ctx.arc(cx + dx * step, cy + dy * step, step * 0.38, 0, Math.PI * 2)
          ctx.fill()
        }
      }
      ctx.globalAlpha = 1
    },
    reduced ? 0 : hot ? 60 : 15
  )

  // With reduced motion nothing runs, so the landed die is drawn once here.
  useEffect(() => kick.current(), [hot, kick])

  return <canvas ref={canvas} aria-hidden className={className} />
}
