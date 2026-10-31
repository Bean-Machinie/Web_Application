import type { ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { QuickSwap } from "./QuickSwap"

type Props = {
  // What to say while the builder has no suggestion to compare with.
  text: string
  // How many things differ from the suggestion (a score, the increase); null while there is none to compare.
  changed: number | null
  onUseSuggested: () => void
  // At the right of the line: the points left, or the button that rolls.
  aside?: ReactNode
}

// Above the grid, one line: whether the scores are the suggested ones, with the way back when
// they are not ("2 changed · Use suggested"), and at the far end what the method has to say.
export function QuickAbilitiesHeader({ text, changed, onUseSuggested, aside }: Props) {
  return (
    <div className="text-muted-foreground flex min-h-8 items-center justify-between gap-3 text-sm">
      <div className="flex items-center gap-1">
        <QuickSwap text={changed === null ? text : changed === 0 ? "Using suggested scores" : `${changed} changed ·`} className="px-0" />
        {changed !== null && changed > 0 && <Button variant="link" size="sm" className="h-auto px-0 py-0" onClick={onUseSuggested}>Use suggested</Button>}
      </div>
      {aside}
    </div>
  )
}
