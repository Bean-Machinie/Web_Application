import type { ReactNode } from "react"
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "motion/react"

const SPRING = { stiffness: 260, damping: 24 }
const DEGREES = 6

// Leans toward the cursor, a few degrees, in three dimensions. The pointer's place over the
// element is what leans it; it settles flat when the pointer goes. Not at all for someone who
// asks for less motion.
export function HomeTilt({ children, className }: { children: ReactNode; className?: string }) {
  const reduced = useReducedMotion()
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [DEGREES, -DEGREES]), SPRING)
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-DEGREES, DEGREES]), SPRING)

  return (
    <motion.div
      className={className}
      style={reduced ? undefined : { rotateX, rotateY, transformPerspective: 900 }}
      onPointerMove={(event) => {
        if (event.pointerType !== "mouse") return
        const box = event.currentTarget.getBoundingClientRect()
        x.set((event.clientX - box.left) / box.width - 0.5)
        y.set((event.clientY - box.top) / box.height - 0.5)
      }}
      onPointerLeave={() => {
        x.set(0)
        y.set(0)
      }}
    >
      {children}
    </motion.div>
  )
}
