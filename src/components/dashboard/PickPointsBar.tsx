import { Button } from "@/components/ui/button"
import { ABILITIES, POINT_BUY_BUDGET } from "@/lib/character-templates/srd-5-2-1"
import type { AbilityId, SrdBackground } from "@/lib/character-templates/srd-5-2-1"
import { abilitiesAt, idFor } from "./pick-increase"
import type { Levels } from "./pick-increase"

const nameOf = (id: AbilityId) => ABILITIES.find(([other]) => other === id)![1]

type Props = {
  typing: boolean
  left: number
  className: string | null
  onSuggest: (() => void) | null
  background: SrdBackground | null
  levels: Levels
}

// The top of the scores card: the points left with a bar, the class’s suggestion, and a line on
// the background’s increase that says at once whether it is complete.
export function PickPointsBar({ typing, left, className, onSuggest, background, levels }: Props) {
  const two = background ? abilitiesAt(background, levels, "2") : []
  const one = background ? abilitiesAt(background, levels, "1") : []
  const done = background !== null && idFor(background, levels) !== null
  const rule = !background
    ? "Choose a background in step 2 to see which abilities it raises. You can skip this."
    : done
      ? two.length > 0
        ? `${background.label} increase done: +2 ${nameOf(two[0])}, +1 ${nameOf(one[0])}.`
        : `${background.label} increase done: +1 to all three.`
      : `${background.label} increase: choose +2 and +1, or +1 for all three.`

  return (
    <div className="flex flex-col gap-3 p-6 pb-4">
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
        {typing ? (
          <p className="text-muted-foreground text-sm">Typing scores skips the point limit.</p>
        ) : (
          <div className="flex min-w-0 flex-1 basis-64 flex-col gap-2">
            <div className="flex items-baseline justify-between">
              <span className="text-muted-foreground text-xs">Points left</span>
              <span className="text-xl font-semibold tabular-nums" aria-live="polite">
                {left} <span className="text-muted-foreground text-sm font-normal">/ {POINT_BUY_BUDGET}</span>
              </span>
            </div>
            <div className="bg-muted h-1.5 overflow-hidden rounded-full">
              <div className="bg-foreground h-full rounded-full" style={{ width: `${((POINT_BUY_BUDGET - left) / POINT_BUY_BUDGET) * 100}%` }} />
            </div>
          </div>
        )}
        <Button variant="outline" size="sm" disabled={!onSuggest} onClick={onSuggest ?? undefined} title={onSuggest ? undefined : "Choose a class to use its suggestion."}>
          Use {className ?? "class"} suggestion
        </Button>
      </div>
      <p className={`text-sm ${done || !background ? "text-muted-foreground" : ""}`}>{rule}</p>
    </div>
  )
}
