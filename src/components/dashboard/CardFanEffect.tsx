import { motion } from "motion/react"
import { WORLD_KINDS } from "@/lib/world-kinds"

const CARDS = [
  { kind: "npc", x: -34, rotate: -14 },
  { kind: "location", x: 0, rotate: 0 },
  { kind: "item", x: 34, rotate: 14 },
] as const

// World entry: three mini cards (NPC, Location, Item) fan up from the bottom edge.
export function CardFanEffect({ active }: { active: boolean }) {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      {CARDS.map(({ kind, x, rotate }, index) => {
        const KindIcon = WORLD_KINDS[kind].icon
        return (
          <motion.div
            key={kind}
            className="bg-card text-foreground absolute bottom-20 left-1/2 -ml-5 flex h-14 w-10 items-center justify-center rounded-md border shadow-md"
            initial={false}
            animate={active ? { x, y: 0, rotate, opacity: 1 } : { x: 0, y: 90, rotate: 0, opacity: 0 }}
            transition={active ? { duration: 0.4, delay: index * 0.04, ease: "easeOut" } : { duration: 0.12 }}
          >
            <KindIcon className="size-4" />
          </motion.div>
        )
      })}
    </div>
  )
}
