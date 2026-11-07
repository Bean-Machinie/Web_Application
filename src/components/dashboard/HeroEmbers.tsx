import { motion, useReducedMotion } from "motion/react"

// Each ember: how far right of the origin it starts, its size, how long it rises and when it starts.
const EMBERS = [
  { dx: -18, size: 3, duration: 4.2, delay: 0 },
  { dx: 6, size: 4, duration: 5, delay: 0.8 },
  { dx: 24, size: 3, duration: 4.6, delay: 1.6 },
  { dx: -4, size: 2, duration: 3.8, delay: 2.2 },
  { dx: 14, size: 4, duration: 5.4, delay: 0.4 },
  { dx: -26, size: 2, duration: 4.4, delay: 2.9 },
  { dx: 32, size: 3, duration: 5.2, delay: 1.2 },
  { dx: 0, size: 3, duration: 4.8, delay: 3.4 },
]

// Small embers rising slowly from the fire in the picture and fading out, looping. Where the fire
// is comes from the CSS variables --ember-x and --ember-y on the card or an ancestor, by default the
// right third.
export function HeroEmbers() {
  const reduced = useReducedMotion()
  if (reduced) return null

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {EMBERS.map(({ dx, size, duration, delay }, index) => (
        <motion.span
          key={index}
          className="absolute rounded-full bg-orange-300 shadow-[0_0_6px_2px_rgb(251_146_60/0.6)]"
          style={{ left: `calc(var(--ember-x, 78%) + ${dx}px)`, top: "var(--ember-y, 80%)", width: size, height: size }}
          initial={{ opacity: 0 }}
          animate={{ y: [0, -110], x: [0, dx > 0 ? 10 : -10], opacity: [0, 0.9, 0], scale: [1, 0.4] }}
          transition={{ duration, delay, repeat: Infinity, ease: "easeOut" }}
        />
      ))}
    </div>
  )
}
