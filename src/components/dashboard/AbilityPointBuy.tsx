import { useState } from "react"
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
import type { Scores } from "./ability-scores"

const START = Object.fromEntries(ABILITIES.map(([id]) => [id, POINT_BUY_MIN])) as Record<AbilityId, number>

// Spend the 27 points on scores from 8 to 15, at the costs the SRD gives, with the points
// left counted as you go.
export function AbilityPointBuy({ onApply }: { onApply: (scores: Scores) => void }) {
  const [scores, setScores] = useState(START)
  const spent = Object.values(scores).reduce((sum, score) => sum + POINT_BUY_COSTS[score], 0)
  const left = POINT_BUY_BUDGET - spent
  const change = (id: AbilityId, by: number) => setScores((old) => ({ ...old, [id]: old[id] + by }))

  return (
    <div className="grid gap-4">
      <div className="flex items-baseline justify-between">
        <span className="text-sm font-medium">Points remaining</span>
        <span className="text-2xl font-semibold tabular-nums" aria-live="polite">
          {left}
        </span>
      </div>
      <div className="grid gap-2">
        {ABILITIES.map(([id, label]) => {
          const score = scores[id]
          const stepCost = POINT_BUY_COSTS[score + 1] - POINT_BUY_COSTS[score]
          return (
            <div key={id} className="flex items-center justify-between gap-3">
              <span className="text-sm">{label}</span>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground w-12 text-right text-xs tabular-nums">{POINT_BUY_COSTS[score]} pts</span>
                <Button variant="outline" size="icon" className="size-7" aria-label={`Lower ${label}`} disabled={score <= POINT_BUY_MIN} onClick={() => change(id, -1)}>
                  <Minus />
                </Button>
                <span className="w-7 text-center text-sm font-medium tabular-nums">{score}</span>
                <Button variant="outline" size="icon" className="size-7" aria-label={`Raise ${label}`} disabled={score >= POINT_BUY_MAX || stepCost > left} onClick={() => change(id, 1)}>
                  <Plus />
                </Button>
              </div>
            </div>
          )
        })}
      </div>
      <div className="flex justify-end">
        <Button onClick={() => onApply(scores)}>Apply scores</Button>
      </div>
    </div>
  )
}
