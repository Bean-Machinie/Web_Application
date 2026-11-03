import { DICE_SLOTS, layerId } from "@/lib/dice-box"
import { cn } from "@/lib/utils"

type Props = { layers: boolean[] }

// Above everything and out of the way of the mouse. Each roll has a layer of its own for the 3D
// engine to draw into; they fade one by one.
export function DiceOverlay({ layers }: Props) {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[100]">
      {Array.from({ length: DICE_SLOTS }, (_, slot) => (
        <div
          key={slot}
          id={layerId(slot)}
          className={cn("absolute inset-0 transition-opacity duration-500", layers[slot] ? "opacity-100" : "opacity-0")}
        />
      ))}
    </div>
  )
}
