import { DICE_LAYER_ID } from "@/lib/dice-box"
import { cn } from "@/lib/utils"
import type { Roll } from "@/lib/dice"

// Above everything and out of the way of the mouse. The 3D engine draws its canvas into the
// layer; the total sits beside the panel.
export function DiceOverlay({ shown, visible }: { shown: Roll | null; visible: boolean }) {
  return (
    <div
      aria-hidden
      className={cn("pointer-events-none fixed inset-0 z-[100] transition-opacity duration-500", visible ? "opacity-100" : "opacity-0")}
    >
      <div id={DICE_LAYER_ID} className="absolute inset-0" />
      {shown && (
        <span className="fixed top-24 right-[25rem] text-7xl font-semibold tabular-nums drop-shadow-lg max-md:right-1/2 max-md:translate-x-1/2">
          {shown.total}
        </span>
      )}
    </div>
  )
}
