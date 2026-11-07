import type { ReactNode } from "react"
import { Dices } from "lucide-react"
import { rollExpression } from "@/lib/dice-roll-store"
import { chipTitle } from "./rules-decorations"

type Props = { expression: string; children: ReactNode }

// Dice in running text (a stat block, the rules): no box, just accent text with a small dice icon
// that underlines on hover. Click rolls; Shift for advantage, Alt for disadvantage. A die standing
// alone, as in the journal, is the chip instead.
export function InlineDice({ expression, children }: Props) {
  return (
    <button
      type="button"
      title={chipTitle(expression)}
      onClick={(event) => rollExpression(expression, { mode: event.shiftKey ? "advantage" : event.altKey ? "disadvantage" : "normal" })}
      className="text-primary focus-visible:ring-ring inline-flex cursor-pointer items-baseline gap-0.5 rounded-sm font-medium outline-none hover:underline focus-visible:ring-2"
    >
      <Dices className="size-3 shrink-0 self-center" aria-hidden />
      {children}
    </button>
  )
}
