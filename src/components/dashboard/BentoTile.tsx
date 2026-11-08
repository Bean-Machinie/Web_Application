import { useState } from "react"
import type { CSSProperties, FocusEvent, ReactNode } from "react"
import { motion } from "motion/react"
import { useReducedMotion } from "@/hooks/use-reduced-motion"
import { cn } from "@/lib/utils"
import { FlickeringGrid } from "./FlickeringGrid"
import { TileHotContext } from "./tile-hot"

// Literal class names, so Tailwind finds them; the areas are laid out in HomeBento.
const AREAS = {
  lead: "md:[grid-area:lead]",
  map: "md:[grid-area:map]",
  compendium: "md:[grid-area:compendium]",
  characters: "md:[grid-area:characters]",
  play: "md:[grid-area:play]",
  world: "md:[grid-area:world]",
}

export type BentoArea = keyof typeof AREAS

type Props = {
  area: BentoArea
  // Two squares wide: the text in the left square, the art filling the right one.
  wide?: boolean
  // Its picture, drawn over the faint flickering grid; given as a function it is told whether the tile is hot.
  art?: ReactNode | ((hot: boolean) => ReactNode)
  // Over the art's square but outside the tile's clipping, for what flies past its edges.
  float?: (hot: boolean) => ReactNode
  // Told each time the tile turns hot or stops being hot.
  onHot?: (hot: boolean) => void
  children: ReactNode
}

// Only the short stretch next to the text fades, so the picture itself is seen whole.
const FROM_LEFT = "linear-gradient(to right, transparent, black 12%)"
const fade: CSSProperties = { maskImage: FROM_LEFT, WebkitMaskImage: FROM_LEFT }

// A tile of the Home bento. A square tile's art fills it, with the text at the bottom over a dark
// gradient; a wide one has its text in the left square and its art in the right. Pointed at, or holding
// the keyboard focus, it rises a little and its border firms up, and what is inside can play its own
// hover through useTileHot.
export function BentoTile({ area, wide = false, art, float, onHot, children }: Props) {
  const reduced = useReducedMotion()
  const [hot, setHot] = useState(false)
  const turn = (next: boolean) => {
    if (next === hot) return
    setHot(next)
    onHot?.(next)
  }
  const onBlur = (event: FocusEvent<HTMLDivElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget)) turn(false)
  }
  const square = wide ? "absolute inset-y-0 right-0 aspect-square max-w-[50%]" : "absolute inset-0"

  return (
    <TileHotContext.Provider value={hot}>
      <motion.div
        initial={false}
        // Raised over its neighbours while hot, and a little after, so what flies out of it is not hidden.
        animate={{ zIndex: hot ? 20 : 0, ...(reduced ? {} : { y: hot ? -2 : 0, scale: hot ? 1.01 : 1 }) }}
        transition={{ duration: 0.15, ease: "easeOut", zIndex: { duration: 0, delay: hot ? 0 : 0.6 } }}
        onPointerEnter={() => turn(true)}
        onPointerLeave={() => turn(false)}
        onFocus={() => turn(true)}
        onBlur={onBlur}
        className={cn("relative min-h-[180px]", AREAS[area], !wide && "aspect-square")}
      >
        <div className={cn("bg-background absolute inset-0 overflow-hidden rounded-xl border transition-colors duration-150", hot && "border-border-strong")}>
          {/* A solid base under the card colour, which is see-through in places. */}
          <div aria-hidden className="bg-card absolute inset-0" />
          <div aria-hidden className={cn("pointer-events-none", square)} style={wide ? fade : undefined}>
            <FlickeringGrid className="absolute inset-0 size-full" />
            {typeof art === "function" ? art(hot) : art}
          </div>
          {!wide && <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />}
        </div>
        {float && <div className={cn("pointer-events-none", square)}>{float(hot)}</div>}
        {/* Over the dark gradient a square tile's text always reads light. */}
        <div className={cn("relative z-10 h-full", wide ? "max-w-[50%]" : "dark text-foreground")}>{children}</div>
      </motion.div>
    </TileHotContext.Provider>
  )
}
