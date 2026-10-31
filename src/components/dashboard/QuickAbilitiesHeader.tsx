import { Eraser, RotateCcw } from "lucide-react"
import { QuickAbilityRules } from "./QuickAbilityRules"
import { QuickHeaderButton } from "./QuickHeaderButton"
import { QuickSwap } from "./QuickSwap"

type Props = {
  // What to say while the builder has no suggestion to compare with.
  text: string
  // How many things differ from the suggestion (a score, the increase); null while there is none to compare.
  changed: number | null
  onUseSuggested: () => void
  onClear: () => void
  canClear: boolean
  // Point buy only: the points still to spend, and all there are.
  points?: { left: number; budget: number }
}

// Above the grid, a toolbar as the app's lists have: on the left whether the scores are the suggested
// ones, on the right the points left (point buy), the way back to the suggestion, clearing, and the rules.
export function QuickAbilitiesHeader({ text, changed, onUseSuggested, onClear, canClear, points }: Props) {
  const status = changed === null ? text : changed === 0 ? "Suggested scores" : `${changed} changed from suggested`

  return (
    // One line always: the status gives way (and is cut) before the buttons move.
    <div className="flex items-center justify-between gap-4">
      <div className="text-muted-foreground flex min-h-9 min-w-0 items-center gap-2 overflow-hidden text-sm whitespace-nowrap">
        {changed === 0 && <span aria-hidden className="bg-foreground/60 size-1.5 shrink-0 rounded-full" />}
        <QuickSwap text={status} className="min-w-0 truncate px-0" />
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {points && (
          <span className="bg-muted/50 text-muted-foreground flex h-9 items-center rounded-md border px-3 text-sm whitespace-nowrap tabular-nums">
            <QuickSwap text={`${points.left} of ${points.budget} points left`} className="px-0" />
          </span>
        )}
        <QuickHeaderButton icon={Eraser} text="Clear" tip="Clear all scores" disabled={!canClear} onClick={onClear} />
        <QuickHeaderButton icon={RotateCcw} text="Use suggested" tip="Use the suggested scores and increase" disabled={changed === null || changed === 0} onClick={onUseSuggested} />
        <QuickAbilityRules />
      </div>
    </div>
  )
}
