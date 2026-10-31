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
  // How many things differ from the suggestion (a score, the increase); null while there is none to compare.
  changed: number | null
  onUseSuggested: () => void
}

const list = (values: number[]) => values.join(", ")

// Above the cards: whether the scores are the suggested ones, with the way back when they are not;
// at the right what is left to spend or hand out, and for Roll the button that rolls.
export function QuickAbilitiesHeader({ method, left, free, rolled, onRoll, changed, onUseSuggested }: Props) {
  const aside =
    method === "point-buy" ? `${left} of ${POINT_BUY_BUDGET} points left`
    : method === "standard" && free.length > 0 ? `To assign: ${list(free)}`
    : ""
  const status =
    changed === null
      ? method === "point-buy" ? `${left} of ${POINT_BUY_BUDGET} points left`
        : method === "own" && !rolled ? "Roll six scores to assign"
        : free.length === 0 ? "Every score is assigned"
        : `To assign: ${list(free)}`
      : changed === 0 ? "Using suggested scores"
      : `${changed} changed from suggested`

  return (
    <div className="flex min-h-9 items-center justify-between gap-3">
      <div className="text-muted-foreground flex items-center gap-1 text-sm">
        <QuickSwap text={status} className="px-0" />
        {changed !== null && changed > 0 && <Button variant="link" size="sm" className="h-auto px-1 py-0" onClick={onUseSuggested}>Use suggested</Button>}
      </div>
      {method === "own" ? (
        <Button variant="secondary" size="sm" onClick={onRoll}>
          <Dices />
          {rolled ? "Roll again" : "Roll"}
        </Button>
      ) : (
        changed !== null && aside && <p className="text-muted-foreground text-sm"><QuickSwap text={aside} className="px-0" /></p>
      )}
    </div>
  )
}
