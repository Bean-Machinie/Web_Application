import { motion } from "motion/react"
import { useReducedMotion } from "@/hooks/use-reduced-motion"

const AMBER = "#f5b544"

// Where a spark winks, as fractions of the box, and how big it is in pixels.
export type Spark = { x: number; y: number; size: number }

// Small four-pointed sparks that wink once, one after another, each time `hot` turns on; none with
// reduced motion.
export function Sparks({ hot, sparks, delay = 0.25 }: { hot: boolean; sparks: Spark[]; delay?: number }) {
  const reduced = useReducedMotion()
  if (reduced) return null
  return sparks.map((spark, index) => (
    <motion.svg
      key={index}
      aria-hidden
      viewBox="0 0 10 10"
      className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2"
      style={{ left: `${spark.x * 100}%`, top: `${spark.y * 100}%`, width: spark.size, height: spark.size, color: AMBER }}
      initial={false}
      animate={hot ? { scale: [0, 1.2, 0], rotate: [0, 90], opacity: [0, 1, 0] } : { scale: 0, opacity: 0 }}
      transition={hot ? { duration: 0.8, delay: delay + index * 0.09, ease: "easeOut" } : { duration: 0 }}
    >
      <path d="M5 0 Q5.6 4.4 10 5 Q5.6 5.6 5 10 Q4.4 5.6 0 5 Q4.4 4.4 5 0Z" fill="currentColor" />
    </motion.svg>
  ))
}
