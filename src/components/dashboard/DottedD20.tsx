import { useEffect, useRef, useState } from "react"
import type { PointerEvent } from "react"
import { useCanvasLoop } from "@/hooks/use-canvas-loop"
import type { CanvasFrame } from "@/hooks/use-canvas-loop"
import { useReducedMotion } from "@/hooks/use-reduced-motion"
import { useThemeColors } from "@/hooks/use-theme-colors"
import { drawD20, PIN_FACES } from "@/lib/d20-draw"
import { dragBy, restingMotion, turn, twirl } from "@/lib/d20-motion"
import { cn } from "@/lib/utils"
import { useTileHot } from "./tile-hot"

const AMBER = "#f5b544"
// At rest the pins stand a little out; pointed at, all the way, one after another.
const PIN_REST = 0.3
const PIN_STAGGER_MS = 70
// The die's radius as a share of its canvas.
const SIZE = 0.42

// A d20 as a dotted globe, turning slowly, with pins standing out of its faces. It can be dragged round
// and flies on when let go. Pointed at, it twirls, its pins rise one after another with their heads
// rippling, and it glows a little brighter.
export function DottedD20({ className }: { className?: string }) {
  const canvas = useRef<HTMLCanvasElement>(null)
  const hot = useTileHot()
  const reduced = useReducedMotion()
  const { foreground } = useThemeColors()
  const motion = useRef(restingMotion())
  const pins = useRef(PIN_FACES.map(() => PIN_REST))
  const glow = useRef(0)
  const hotAt = useRef(0)
  const last = useRef(0)
  const drag = useRef<{ x: number; y: number; at: number } | null>(null)
  const [grabbing, setGrabbing] = useState(false)

  // Declared before the loop so the twirl starts on the frame the tile turns hot.
  useEffect(() => {
    if (!hot) return
    hotAt.current = performance.now()
    if (!reduced) twirl(motion.current)
  }, [hot, reduced])

  const kick = useCanvasLoop(
    canvas,
    ({ ctx, width, height, now }: CanvasFrame) => {
      const dt = last.current ? Math.min(0.1, (now - last.current) / 1000) : 0
      last.current = now
      let busy = reduced ? false : turn(motion.current, dt, hot)
      const ease = (value: number, target: number) => {
        const next = reduced ? target : value + (target - value) * Math.min(1, dt * 7)
        if (Math.abs(next - target) > 0.005) busy = true
        return next
      }
      pins.current = pins.current.map((rise, index) => ease(rise, hot && now - hotAt.current > index * PIN_STAGGER_MS ? 1 : PIN_REST))
      glow.current = ease(glow.current, hot ? 1 : 0)
      const m = motion.current
      drawD20(ctx, { cx: width / 2, cy: height / 2, radius: Math.min(width, height) * SIZE, yaw: m.yaw, pitch: m.pitch, ink: foreground, accent: AMBER, pins: pins.current, glow: glow.current, now })
      return busy
    },
    reduced ? 0 : hot || grabbing ? 60 : 15
  )

  useEffect(() => kick.current(), [hot, kick])

  const onPointerDown = (event: PointerEvent<HTMLCanvasElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId)
    drag.current = { x: event.clientX, y: event.clientY, at: event.timeStamp }
    motion.current.dragging = true
    setGrabbing(true)
  }
  const onPointerMove = (event: PointerEvent<HTMLCanvasElement>) => {
    const from = drag.current
    if (!from) return
    const radius = event.currentTarget.clientWidth * SIZE
    dragBy(motion.current, event.clientX - from.x, event.clientY - from.y, (event.timeStamp - from.at) / 1000, radius)
    drag.current = { x: event.clientX, y: event.clientY, at: event.timeStamp }
    // With reduced motion nothing runs on its own, so each move is drawn here.
    if (reduced) kick.current()
  }
  const onPointerUp = () => {
    drag.current = null
    motion.current.dragging = false
    if (reduced) motion.current.spin = 0
    setGrabbing(false)
  }

  return (
    <canvas
      ref={canvas}
      aria-hidden
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      // Sideways drags turn the die; up and down still scroll the page on a touch screen.
      style={{ touchAction: "pan-y" }}
      className={cn("pointer-events-auto", grabbing ? "cursor-grabbing" : "cursor-grab", className)}
    />
  )
}
