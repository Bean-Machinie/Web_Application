import { motion } from "motion/react"

// Character Creator: a small d20 tumbles into the top-right corner and settles on a number.
export function DiceEffect({ active, roll }: { active: boolean; roll: number }) {
  return (
    <motion.div
      aria-hidden
      className="pointer-events-none absolute top-3 right-3 size-11"
      initial={false}
      animate={active ? { x: 0, y: 0, rotate: 360, scale: 1, opacity: 1 } : { x: -60, y: 70, rotate: 0, scale: 0.4, opacity: 0 }}
      transition={active ? { duration: 0.4, ease: "easeOut" } : { duration: 0.12 }}
    >
      <svg viewBox="0 0 48 48" className="size-full drop-shadow-md">
        <polygon points="24,3 43,14 43,34 24,45 5,34 5,14" fill="var(--primary)" stroke="white" strokeWidth={1.5} strokeLinejoin="round" />
        <path d="M24 3v13L5 34M24 16l19 18M5 14l19 2 19-2M5 34h38" fill="none" stroke="white" strokeOpacity={0.35} strokeWidth={1} />
        <text x="24" y="29" textAnchor="middle" fontSize="13" fontWeight="700" fill="var(--primary-foreground)">
          {roll}
        </text>
      </svg>
    </motion.div>
  )
}
