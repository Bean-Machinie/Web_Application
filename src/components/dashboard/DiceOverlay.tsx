import { createPortal } from "react-dom"
import { DICE_SLOTS, layerId } from "@/lib/dice-box"
import { cn } from "@/lib/utils"

type Props = { layers: boolean[] }

// Above everything and out of the way of the mouse. It is drawn into the page body, because inside the sticky
// header it would be stacked with the header and fall under the page's own sticky bars. Each roll has a layer of its own for the 3D
// engine to draw into; they fade one by one.
export function DiceOverlay({ layers }: Props) {
  return createPortal(
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[100]">
      {Array.from({ length: DICE_SLOTS }, (_, slot) => (
        <div
          key={slot}
          id={layerId(slot)}
          className={cn("absolute inset-0 transition-opacity duration-500", layers[slot] ? "opacity-100" : "opacity-0")}
        />
      ))}
    </div>,
    document.body
  )
}
