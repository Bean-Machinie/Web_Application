import { DICE } from "@/lib/dice"
import type { Sides } from "@/lib/dice"
import { DieIcon } from "./DieIcon"

// One tile per die; a click rolls it at once.
export function DiceTray({ onRoll }: { onRoll: (sides: Sides) => void }) {
  return (
    <div className="grid grid-cols-4 gap-2">
      {DICE.map((sides) => (
        <button
          key={sides}
          type="button"
          onClick={() => onRoll(sides)}
          className="hover:bg-muted focus-visible:ring-ring flex flex-col items-center gap-1.5 rounded-lg border px-1 py-2.5 outline-none transition-colors focus-visible:ring-2"
        >
          <DieIcon sides={sides} className="size-7" />
          <span className="text-muted-foreground text-xs font-medium">d{sides}</span>
        </button>
      ))}
    </div>
  )
}
