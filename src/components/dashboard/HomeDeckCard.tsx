import type { ReactNode } from "react"
import type { LucideIcon } from "lucide-react"
import { motion, useReducedMotion } from "motion/react"
import { liftPose, rankPose } from "@/lib/deck-pose"
import type { ArtKind } from "@/lib/pixel-art/art"
import { cn } from "@/lib/utils"
import { PixelArt } from "./PixelArt"

export type DeckCard = {
  key: string
  // What its spine says while it is behind the front card.
  label: string
  icon: LucideIcon
  art: ArtKind
  render: () => ReactNode
}

type Props = {
  card: DeckCard
  width: number
  // How far behind the front card this one is.
  rank: number
  // The pointer is on it, or it has focus.
  hot: boolean
  // Another card is coming out of the deck.
  shifted: boolean
  onPick: () => void
  onHot: (hot: boolean) => void
}

const SPRING = { type: "spring", stiffness: 260, damping: 26, mass: 0.9 } as const
const SPINE_PX = 64
const FADE = "linear-gradient(to right, transparent, black 45%)"

// One card of the deck. The outer element holds its place in the deck and is what the pointer is
// over, so it never moves under the pointer; the card inside comes out toward it and its border and
// shadow firm up, as the cards of the library's do. The card is solid, with its art over the right 60%
// of it, fading out toward the words. Behind the front card its right edge shows, with its name running
// down it like the spine of a book, and a press deals it to the front.
export function HomeDeckCard({ card, width, rank, hot, shifted, onPick, onHot }: Props) {
  const reduced = useReducedMotion()
  const Icon = card.icon
  const behind = rank > 0
  const transition = reduced ? { duration: 0 } : SPRING

  return (
    <motion.div
      initial={false}
      animate={rankPose(rank, shifted)}
      transition={transition}
      style={{ width, zIndex: 30 - rank * 10, transformOrigin: "0% 100%" }}
      className="absolute top-6 left-0 h-[240px]"
      onPointerEnter={() => onHot(true)}
      onPointerLeave={() => onHot(false)}
    >
      <motion.div initial={false} animate={liftPose(rank, hot)} transition={transition} style={{ transformOrigin: "0% 100%" }} className="h-full">
        {/* A solid base under the card colour, which is see-through in places. */}
        <div className={cn("bg-background relative h-full overflow-hidden rounded-xl border transition-[border-color,box-shadow] duration-200", behind ? "shadow-lg" : "shadow-2xl", hot && "border-border-strong shadow-2xl")}>
          <div aria-hidden className="bg-card absolute inset-0" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-[60%]" style={{ maskImage: FADE, WebkitMaskImage: FADE }}>
            <PixelArt kind={card.art} seed={card.key.length * 13 + 5} className="size-full" />
          </div>
          {/* Nothing behind the front card can be reached by the keyboard or read as if it were in front. */}
          <div inert={behind} className="relative z-10 h-full">
            {card.render()}
          </div>
          {/* The shade the card in front casts on it, which lifts as it is pointed at. */}
          <div aria-hidden className={cn("pointer-events-none absolute inset-y-0 right-0 z-20 w-[150px] bg-gradient-to-r from-black/55 via-black/20 to-transparent transition-opacity duration-300", behind && !hot ? "opacity-100" : "opacity-0")} />
          <div
            aria-hidden
            style={{ width: SPINE_PX }}
            className={cn(
              "pointer-events-none absolute inset-y-0 right-0 z-20 flex flex-col items-center gap-3 bg-gradient-to-l from-black/50 to-transparent pt-5 transition-opacity duration-200",
              behind ? "opacity-100" : "opacity-0"
            )}
          >
            <Icon className="size-5" />
            <span className="rotate-180 text-sm font-medium tracking-wide [writing-mode:vertical-rl]">{card.label}</span>
          </div>
          {behind && (
            <button
              type="button"
              aria-label={card.label}
              onClick={onPick}
              onFocus={() => onHot(true)}
              onBlur={() => onHot(false)}
              className="focus-visible:ring-ring absolute inset-0 z-30 cursor-pointer rounded-xl outline-none focus-visible:ring-2"
            />
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}
