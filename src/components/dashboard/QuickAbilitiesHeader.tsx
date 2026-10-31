import { Dices } from "lucide-react"
import { Button } from "@/components/ui/button"
import { POINT_BUY_BUDGET } from "@/lib/character-templates/srd-5-2-1"
import type { AbilityMethod } from "@/lib/character-templates/srd-5-2-1-quick"
import { QuickSwap } from "./QuickSwap"

type Props = {
  method: AbilityMethod
  // Point buy: the points still to spend. The others: the numbers still to hand out.
  left: number
  free: number[]
  rolled: boolean
  onRoll: () => void
}

const list = (values: number[]) => values.join(", ")

// Above the cards: what is left to spend or hand out, and for Roll the button that rolls.
export function QuickAbilitiesHeader({ method, left, free, rolled, onRoll }: Props) {
  const text =
    method === "point-buy" ? `${left} of ${POINT_BUY_BUDGET} points left`
    : method === "own" && !rolled ? "Roll six scores to assign"
    : free.length === 0 ? "Every score is assigned"
    : `To assign: ${list(free)}`

  return (
    <div className="flex h-9 items-center justify-between gap-3">
      <p className="text-muted-foreground text-sm"><QuickSwap text={text} className="px-0" /></p>
      {method === "own" && (
        <Button variant="secondary" size="sm" onClick={onRoll}>
          <Dices />
          {rolled ? "Roll again" : "Roll"}
        </Button>
      )}
    </div>
  )
}
