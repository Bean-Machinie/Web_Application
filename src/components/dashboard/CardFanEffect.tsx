import { motion } from "motion/react"
import { WORLD_KINDS } from "@/lib/world-kinds"

const CARDS = [
  { kind: "npc", x: -34, rotate: -14 },
  { kind: "location", x: 0, rotate: 0 },
  { kind: "item", x: 34, rotate: 14 },
] as const

type Props = {
  active: boolean
  // A picture for each kind's card, from the library; a kind without one shows its icon.
  thumbs?: Partial<Record<string, string>>
}

// World entry: three mini cards (NPC, Location, Item) fan up from the bottom edge.
export function CardFanEffect({ active, thumbs = {} }: Props) {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      {CARDS.map(({ kind, x, rotate }, index) => {
        const KindIcon = WORLD_KINDS[kind].icon
        const thumb = thumbs[kind]
        return (
          <motion.div
            key={kind}
            className="bg-card text-foreground absolute bottom-20 left-1/2 -ml-5 flex h-14 w-10 items-center justify-center overflow-hidden rounded-md border shadow-md"
            initial={false}
            animate={active ? { x, y: 0, rotate, opacity: 1 } : { x: 0, y: 90, rotate: 0, opacity: 0 }}
            transition={active ? { duration: 0.4, delay: index * 0.04, ease: "easeOut" } : { duration: 0.12 }}
          >
            {thumb ? <img src={thumb} alt="" className="size-full object-cover" /> : <KindIcon className="size-4" />}
          </motion.div>
        )
      })}
    </div>
  )
}
