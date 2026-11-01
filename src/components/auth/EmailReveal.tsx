import { useState } from "react"
import type { ReactNode } from "react"
import { motion, useReducedMotion } from "motion/react"

// Grows open to its content. Overflow is only clipped while it moves, so the
// focus rings of the fields inside are not cut off afterwards.
export function EmailReveal({ children }: { children: ReactNode }) {
  const [settled, setSettled] = useState(false)
  const reduced = useReducedMotion()

  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: "auto", opacity: 1 }}
      transition={{ duration: reduced ? 0 : 0.15, ease: "easeOut" }}
      onAnimationComplete={() => setSettled(true)}
      style={{ overflow: settled ? "visible" : "hidden" }}
      className="-m-1"
    >
      {children}
    </motion.div>
  )
}
