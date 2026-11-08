import { useState } from "react"
import type { CSSProperties, FocusEvent, ReactNode } from "react"
import { motion } from "motion/react"
import { useReducedMotion } from "@/hooks/use-reduced-motion"
import { cn } from "@/lib/utils"
import { FlickeringGrid } from "./FlickeringGrid"
import { TileHotContext } from "./tile-hot"

type Props = {
  // Two columns wide; the text then keeps to the left 40% and the art fades only at its left edge.
  wide?: boolean
  // Its picture, drawn over the faint flickering grid in the art area, the right 60% of the tile; given
  // as a function it is told whether the tile is hot.
  art?: ReactNode | ((hot: boolean) => ReactNode)
  children: ReactNode
}

const FROM_LEFT = "linear-gradient(to right, transparent, black 40%)"
// A narrow tile's text runs the full width at the bottom, so there the art also fades out above it.
const FROM_BOTTOM = "linear-gradient(to top, transparent 45%, black 85%)"

const fade = (wide: boolean): CSSProperties =>
  wide
    ? { maskImage: FROM_LEFT, WebkitMaskImage: FROM_LEFT }
    : { maskImage: `${FROM_LEFT}, ${FROM_BOTTOM}`, WebkitMaskImage: `${FROM_LEFT}, ${FROM_BOTTOM}`, maskComposite: "intersect", WebkitMaskComposite: "source-in" }

// A tile of the Home bento: its art at the right, fading toward the text, and its text at the bottom left.
// Pointed at, or holding the keyboard focus, it rises a little and its border firms up, and what is inside
// can play its own hover through useTileHot.
export function BentoTile({ wide = false, art, children }: Props) {
  const reduced = useReducedMotion()
  const [hot, setHot] = useState(false)
  const onBlur = (event: FocusEvent<HTMLDivElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget)) setHot(false)
  }

  return (
    <TileHotContext.Provider value={hot}>
      <motion.div
        initial={false}
        animate={reduced ? undefined : { y: hot ? -2 : 0, scale: hot ? 1.01 : 1 }}
        transition={{ duration: 0.15, ease: "easeOut" }}
        onPointerEnter={() => setHot(true)}
        onPointerLeave={() => setHot(false)}
        onFocus={() => setHot(true)}
        onBlur={onBlur}
        className={cn("bg-background relative min-h-[180px] overflow-hidden rounded-xl border transition-colors duration-150", wide && "md:col-span-2", hot && "border-border-strong")}
      >
        {/* A solid base under the card colour, which is see-through in places. */}
        <div aria-hidden className="bg-card absolute inset-0" />
        <div aria-hidden className="pointer-events-none absolute inset-y-0 right-0 w-3/5" style={fade(wide)}>
          <FlickeringGrid className="absolute inset-0 size-full" />
          {typeof art === "function" ? art(hot) : art}
        </div>
        <div className={cn("relative z-10 h-full", wide && "md:max-w-[40%]")}>{children}</div>
      </motion.div>
    </TileHotContext.Provider>
  )
}
