import { Minus, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  ABILITIES,
  POINT_BUY_BUDGET,
  POINT_BUY_COSTS,
  POINT_BUY_MAX,
  POINT_BUY_MIN,
} from "@/lib/character-templates/srd-5-2-1"
import type { AbilityId } from "@/lib/character-templates/srd-5-2-1"
import type { AbilityFacts } from "./ability-facts"
import type { Scores } from "./ability-scores"
import { AbilityRow } from "./AbilityRow"

type Props = { base: Scores; facts: AbilityFacts; onBase: (next: Scores) => void }

// Spend the 27 points on scores from 8 to 15, at the costs the SRD gives. Each ability shows
// what its score has cost and what one more would, and the points left are counted at the top.
export function AbilityPointBuy({ base, facts, onBase }: Props) {
  const score = (id: AbilityId) => base[id] ?? POINT_BUY_MIN
  const spent = ABILITIES.reduce((sum, [id]) => sum + (POINT_BUY_COSTS[score(id)] ?? 0), 0)
  const left = POINT_BUY_BUDGET - spent
  const change = (id: AbilityId, by: number) => onBase({ ...base, [id]: score(id) + by })

  return (
    <div className="grid gap-3">
      <div className="flex items-baseline justify-between">
        <span className="text-sm font-medium">Points remaining</span>
        <span className="text-3xl font-semibold tabular-nums" aria-live="polite">
          {left}
        </span>
      </div>
      <div className="grid gap-1">
        {ABILITIES.map(([id, label]) => {
          const current = score(id)
          const next = current < POINT_BUY_MAX ? POINT_BUY_COSTS[current + 1] - POINT_BUY_COSTS[current] : null
          return (
            <AbilityRow key={id} id={id} label={label} facts={facts}>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground w-28 text-right text-xs tabular-nums">
                  {POINT_BUY_COSTS[current]} spent · {next === null ? "max" : `+1 costs ${next}`}
                </span>
                <Button variant="outline" size="icon" className="size-7" aria-label={`Lower ${label}`} disabled={current <= POINT_BUY_MIN} onClick={() => change(id, -1)}>
                  <Minus />
                </Button>
                <span className="w-6 text-center text-sm font-medium tabular-nums">{current}</span>
                <Button variant="outline" size="icon" className="size-7" aria-label={`Raise ${label}`} disabled={next === null || next > left} onClick={() => change(id, 1)}>
                  <Plus />
                </Button>
              </div>
            </AbilityRow>
          )
        })}
      </div>
    </div>
  )
}
