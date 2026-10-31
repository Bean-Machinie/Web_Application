import { Eraser, RotateCcw } from "lucide-react"
import { HoverIcon } from "@/components/icons/HoverIcon"
import { Button } from "@/components/ui/button"
import { QuickAbilityRules } from "./QuickAbilityRules"
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
    <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
      <div className="text-muted-foreground flex min-h-9 items-center gap-2 text-sm">
        {changed === 0 && <span aria-hidden className="bg-foreground/60 size-1.5 rounded-full" />}
        <QuickSwap text={status} className="px-0" />
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {points && (
          <span className="bg-muted/50 text-muted-foreground flex h-9 items-center rounded-md border px-3 text-sm tabular-nums">
            <QuickSwap text={`${points.left} of ${points.budget} points left`} className="px-0" />
          </span>
        )}
        <Button variant="outline" disabled={changed === null || changed === 0} onClick={onUseSuggested}>
          <HoverIcon icon={RotateCcw} />
          Use suggested
        </Button>
        <Button variant="outline" disabled={!canClear} onClick={onClear}>
          <HoverIcon icon={Eraser} />
          Clear
        </Button>
        <QuickAbilityRules />
      </div>
    </div>
  )
}
