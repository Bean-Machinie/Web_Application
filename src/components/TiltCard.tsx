import { useRef } from "react"
import type { ReactNode } from "react"
import { motion, useSpring } from "motion/react"

const MAX_TILT = 4
const HOVER_SCALE = 1.02
const PRESS_SCALE = 0.99
const GLARE_SIZE = 320
// Heavily damped, so it follows the cursor softly and never overshoots.
const SPRING = { stiffness: 220, damping: 32, mass: 0.6 }

// Touch screens have no cursor to follow, and reduced motion asks for none.
const still = () =>
  window.matchMedia("(pointer: coarse), (prefers-reduced-motion: reduce)").matches

type Props = { className?: string; children: ReactNode }

// A card that tilts toward the cursor, with a faint glare under it. Pointer
// movement only writes motion values, so nothing re-renders. Style the card
// itself (fill, border, shadow) with className; the glare is drawn over the children.
export function TiltCard({ className, children }: Props) {
  const card = useRef<HTMLDivElement>(null)
  const rotateX = useSpring(0, SPRING)
  const rotateY = useSpring(0, SPRING)
  const scale = useSpring(1, SPRING)
  const glareOpacity = useSpring(0, SPRING)
  // Pointer position in pixels, from the card's centre, kept as a motion value.
  const glareX = useSpring(0, SPRING)
  const glareY = useSpring(0, SPRING)
  const hovering = useRef(false)

  function follow(event: React.PointerEvent) {
    if (still() || !card.current) return
    const box = card.current.getBoundingClientRect()
    const x = (event.clientX - box.left) / box.width
    const y = (event.clientY - box.top) / box.height
    rotateY.set((x - 0.5) * 2 * MAX_TILT)
    rotateX.set((0.5 - y) * 2 * MAX_TILT)
    glareX.set(x * box.width - GLARE_SIZE / 2)
    glareY.set(y * box.height - GLARE_SIZE / 2)
  }

  function enter(event: React.PointerEvent) {
    if (still()) return
    hovering.current = true
    follow(event)
    scale.set(HOVER_SCALE)
    glareOpacity.set(1)
  }

  function leave() {
    hovering.current = false
    rotateX.set(0)
    rotateY.set(0)
    scale.set(1)
    glareOpacity.set(0)
  }

  return (
    <motion.div
      ref={card}
      className={className}
      style={{ rotateX, rotateY, scale, transformPerspective: 1000 }}
      onPointerEnter={enter}
      onPointerMove={follow}
      onPointerLeave={leave}
      onPointerDown={() => hovering.current && scale.set(PRESS_SCALE)}
      onPointerUp={() => hovering.current && scale.set(HOVER_SCALE)}
    >
      <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden rounded-[inherit]">
        <motion.div
          className="absolute top-0 left-0 rounded-full"
          style={{
            width: GLARE_SIZE,
            height: GLARE_SIZE,
            x: glareX,
            y: glareY,
            opacity: glareOpacity,
            background:
              "radial-gradient(closest-side, color-mix(in oklab, var(--foreground) 6%, transparent), transparent)",
          }}
        />
      </div>
      {children}
    </motion.div>
  )
}
