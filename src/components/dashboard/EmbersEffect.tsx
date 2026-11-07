import { motion } from "motion/react"

// Where each ember starts along the foot of the tile, how big it is and when it leaves.
const EMBERS = [
  { left: 14, size: 4, delay: 0 },
  { left: 30, size: 3, delay: 0.25 },
  { left: 47, size: 5, delay: 0.1 },
  { left: 63, size: 3, delay: 0.4 },
  { left: 78, size: 4, delay: 0.2 },
  { left: 90, size: 3, delay: 0.5 },
]

// New campaign: a few embers drift upward and fade, for as long as the tile is hovered.
export function EmbersEffect({ active }: { active: boolean }) {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      {EMBERS.map(({ left, size, delay }) => (
        <motion.span
          key={left}
          className="absolute bottom-16 rounded-full bg-orange-400 shadow-[0_0_6px_2px_rgb(251_146_60/0.7)]"
          style={{ left: `${left}%`, width: size, height: size }}
          initial={false}
          animate={active ? { y: [0, -110], x: [0, left % 2 ? 8 : -8], opacity: [0, 1, 0] } : { y: 0, opacity: 0 }}
          transition={active ? { duration: 1.2, delay, repeat: Infinity, ease: "easeOut" } : { duration: 0.1 }}
        />
      ))}
    </div>
  )
}
