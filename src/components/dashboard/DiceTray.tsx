import { useRef } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { useDicePreview } from "@/hooks/use-dice-preview"
import { rollLabel } from "@/lib/dice"
import { cn } from "@/lib/utils"
import { DiceOptions } from "./DiceOptions"
import type { D20Mode, Sides } from "@/lib/dice"

// The d20 first, large on the left; the rest fill the three columns beside it, row by row.
const LAYOUT: Sides[] = [20, 4, 6, 8, 10, 12, 100]

type TileProps = {
  sides: Sides
  label: string
  loading: boolean
  area: (element: HTMLElement | null) => void
  onRoll: () => void
  onHover: (hovered: boolean) => void
}

// The die is the button. It is drawn on the canvas over the grid, into this cell; the cell only
// holds the soft shadow under it and the focus ring.
function DieCell({ sides, label, loading, area, onRoll, onHover }: TileProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          ref={area}
          type="button"
          aria-label={label}
          onClick={onRoll}
          onPointerEnter={() => onHover(true)}
          onPointerLeave={() => onHover(false)}
          onFocus={() => onHover(true)}
          onBlur={() => onHover(false)}
          className={cn(
            "group focus-visible:ring-ring relative flex aspect-square items-center justify-center rounded-lg outline-none focus-visible:ring-2",
            sides === 20 && "col-span-2 row-span-2"
          )}
        >
          <span
            aria-hidden
            className="absolute bottom-[9%] left-1/2 h-[10%] w-3/5 -translate-x-1/2 rounded-full bg-black/50 opacity-0 blur-md transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100"
          />
          {loading && <Skeleton className="size-3/5 rounded-lg" />}
        </button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  )
}

type Props = {
  modifier: number
  onModifier: (value: number) => void
  mode: D20Mode
  onMode: (mode: D20Mode) => void
  onRoll: (sides: Sides) => void
}

// The dice on a very soft glow, with the roll options in a plain row under them.
export function DiceTray({ modifier, onModifier, mode, onMode, onRoll }: Props) {
  const host = useRef<HTMLDivElement>(null)
  const areas = useRef<Partial<Record<Sides, HTMLElement | null>>>({})
  const preview = useDicePreview(host, areas)

  return (
    <div className="grid gap-3">
      <div className="relative">
        {/* A dark, blurred rectangle where a tray would be, with no edge to it, and a faint lighter glow over it. */}
        <div aria-hidden className="pointer-events-none absolute inset-x-2 inset-y-1 rounded-2xl bg-black/35 blur-xl" />
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(closest-side,rgb(255_255_255/0.04),transparent)]" />
        <div className="relative grid grid-cols-5 gap-1 p-3">
          {LAYOUT.map((sides) => (
            <DieCell
              key={sides}
              sides={sides}
              label={rollLabel(sides, modifier, mode)}
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
        {/* Covers the dice, with the padding as room for a die that grows; out of the way of the pointer. */}
        <div ref={host} aria-hidden className="pointer-events-none absolute inset-0 [&_canvas]:block" />
      </div>
      <DiceOptions modifier={modifier} onModifier={onModifier} mode={mode} onMode={onMode} />
    </div>
  )
}
