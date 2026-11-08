import { useState } from "react"
import type { FocusEvent, ReactNode } from "react"
import { motion } from "motion/react"
import { useReducedMotion } from "@/hooks/use-reduced-motion"
import { cn } from "@/lib/utils"
import { FlickeringGrid } from "./FlickeringGrid"
import { TileHotContext } from "./tile-hot"

type Props = {
  // Its picture, drawn over the faint flickering grid in the art area.
  art?: ReactNode
  // Where the art area sits; the right half by default.
  artClassName?: string
  className?: string
  children: ReactNode
}

const FADE = "linear-gradient(to right, transparent, black 35%)"

// A tile of the Home bento. Pointed at, or holding the keyboard focus, it rises a little and its border
// firms up, and what is inside can play its own hover through useTileHot.
export function BentoTile({ art, artClassName, className, children }: Props) {
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
        className={cn("bg-background relative min-h-[200px] overflow-hidden rounded-xl border transition-colors duration-150", hot && "border-border-strong", className)}
      >
        {/* A solid base under the card colour, which is see-through in places. */}
        <div aria-hidden className="bg-card absolute inset-0" />
        <div aria-hidden className={cn("pointer-events-none absolute inset-y-0 right-0 w-1/2", artClassName)} style={{ maskImage: FADE, WebkitMaskImage: FADE }}>
          <FlickeringGrid className="absolute inset-0 size-full" />
          {art}
        </div>
        <div className="relative z-10 h-full">{children}</div>
      </motion.div>
    </TileHotContext.Provider>
  )
}
