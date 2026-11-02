import { useRef } from "react"
import { motion } from "motion/react"
import { Skeleton } from "@/components/ui/skeleton"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { useDicePreview } from "@/hooks/use-dice-preview"
import { DICE, rollLabel } from "@/lib/dice"
import { PREVIEW_ID } from "@/lib/dice-preview"
import type { D20Mode, Sides } from "@/lib/dice"

const SPRING = { type: "spring", stiffness: 600, damping: 18, mass: 0.6 } as const

type TileProps = {
  sides: Sides
  modifier: number
  mode: D20Mode
  loading: boolean
  area: (element: HTMLElement | null) => void
  onRoll: () => void
  onHover: (hovered: boolean) => void
}

// Lifts on hover like the template cards. The die itself is drawn on the canvas over the row,
// into this tile's area.
function DieTile({ sides, modifier, mode, loading, area, onRoll, onHover }: TileProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <motion.button
          type="button"
          onClick={onRoll}
          onPointerEnter={() => onHover(true)}
          onPointerLeave={() => onHover(false)}
          onFocus={() => onHover(true)}
          onBlur={() => onHover(false)}
          initial="rest"
          animate="rest"
          whileHover="hover"
          whileTap={{ scale: 0.97 }}
          variants={{ rest: { y: 0 }, hover: { y: -4 } }}
          transition={SPRING}
          className="bg-card hover:bg-muted/60 focus-visible:ring-ring flex min-w-0 flex-1 flex-col items-center gap-1 rounded-lg border py-1.5 outline-none focus-visible:ring-2"
        >
          <span ref={area} className="flex h-11 w-full items-center justify-center">
            {loading && <Skeleton className="size-7 rounded-md" />}
          </span>
          <span className="text-muted-foreground text-[11px] font-medium">d{sides}</span>
        </motion.button>
      </TooltipTrigger>
      <TooltipContent>{rollLabel(sides, modifier, mode)}</TooltipContent>
    </Tooltip>
  )
}

type Props = { modifier: number; mode: D20Mode; onRoll: (sides: Sides) => void }

export function DiceTray({ modifier, mode, onRoll }: Props) {
  const host = useRef<HTMLDivElement>(null)
  const areas = useRef<Partial<Record<Sides, HTMLElement | null>>>({})
  const preview = useDicePreview(host, areas)

  return (
    <div className="relative pt-1">
      <div className="flex gap-1.5">
        {DICE.map((sides) => (
          <DieTile
            key={sides}
            sides={sides}
            modifier={modifier}
            mode={mode}
            loading={preview.state === "loading"}
            area={(element) => {
              areas.current[sides] = element
            }}
            onRoll={() => {
              preview.throwDie(sides)
              onRoll(sides)
            }}
            onHover={(hovered) => preview.hover(hovered ? sides : null)}
          />
        ))}
      </div>
      {/* Over the tiles but out of the way of the pointer; room above for the lift. */}
      <div ref={host} id={PREVIEW_ID} aria-hidden className="pointer-events-none absolute -inset-x-1 -top-2 bottom-0 [&_canvas]:block" />
    </div>
  )
}
