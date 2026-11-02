import { DICE_SLOTS, layerId } from "@/lib/dice-box"
import { cn } from "@/lib/utils"
import type { ShownTotal } from "@/hooks/use-dice-roller"

type Props = { layers: boolean[]; totals: ShownTotal[] }

// Above everything and out of the way of the mouse. Each roll has a layer of its own for the 3D
// engine to draw into, and its total beside the panel; they fade one by one.
export function DiceOverlay({ layers, totals }: Props) {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[100]">
      {Array.from({ length: DICE_SLOTS }, (_, slot) => (
        <div
          key={slot}
          id={layerId(slot)}
          className={cn("absolute inset-0 transition-opacity duration-500", layers[slot] ? "opacity-100" : "opacity-0")}
        />
      ))}
      <div className="fixed top-24 right-[25rem] flex flex-col items-end gap-1 max-md:right-1/2 max-md:translate-x-1/2">
        {totals.map(({ roll, visible }) => (
          <span key={roll.id} className={cn("text-7xl font-semibold tabular-nums drop-shadow-lg transition-opacity duration-500", visible ? "opacity-100" : "opacity-0")}>
            {roll.total}
          </span>
        ))}
      </div>
    </div>
  )
}
