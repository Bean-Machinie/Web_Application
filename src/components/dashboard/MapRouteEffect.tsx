import { motion } from "motion/react"

const ROUTE = "M14 74 C 30 40, 44 86, 58 56 S 78 34, 84 30"

// Map Maker: a dashed route draws across the tile and a pin drops at its end.
export function MapRouteEffect({ active }: { active: boolean }) {
  return (
    <svg aria-hidden viewBox="0 0 100 100" className="pointer-events-none absolute inset-0 size-full">
      <defs>
        <mask id="route-reveal">
          <motion.path
            d={ROUTE}
            fill="none"
            stroke="white"
            strokeWidth={6}
            initial={false}
            animate={{ pathLength: active ? 1 : 0 }}
            transition={{ duration: active ? 0.4 : 0.15, ease: "easeOut" }}
          />
        </mask>
      </defs>
      <path d={ROUTE} fill="none" stroke="white" strokeWidth={1.6} strokeDasharray="3 3" strokeLinecap="round" mask="url(#route-reveal)" />
      <motion.g
        initial={false}
        animate={active ? { y: 0, opacity: 1 } : { y: -14, opacity: 0 }}
        transition={active ? { delay: 0.3, type: "spring", stiffness: 500, damping: 18 } : { duration: 0.1 }}
      >
        <path d="M84 30 c-3 -4 -4.5 -6 -4.5 -8.5 a4.5 4.5 0 1 1 9 0 c0 2.5 -1.5 4.5 -4.5 8.5z" fill="var(--primary)" stroke="white" strokeWidth={1} />
        <circle cx={84} cy={21.5} r={1.6} fill="white" />
      </motion.g>
    </svg>
  )
}
