import { Minus, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { formatNumber } from "@/lib/character-derive"
import {
  ABILITIES,
  POINT_BUY_BUDGET,
  POINT_BUY_COSTS,
  POINT_BUY_MAX,
  POINT_BUY_MIN,
  STANDARD_ARRAY_BY_CLASS,
} from "@/lib/character-templates/srd-5-2-1"
import type { AbilityId } from "@/lib/character-templates/srd-5-2-1"
import { readStat } from "@/lib/character-values"
import { abilityFacts, bonusFor } from "./ability-facts"
import { BuilderDetail } from "./BuilderDetail"
import { BuilderLabel } from "./BuilderLabel"
import type { BuilderProps } from "./builder-types"

type Scores = Record<AbilityId, number>

const COLUMNS = "grid grid-cols-[minmax(0,1fr)_11rem_3rem_3rem_3rem] items-center gap-2"

// Step 4: the point buy, in place. Each change is saved as it is made (the first one saves
// all six), and every row shows the background’s increase and the total and modifier that
// come of it, which are only read here.
export function BuilderAbilitiesStep({ actions }: BuilderProps) {
  const facts = abilityFacts(actions)
  const stored = (id: AbilityId) => readStat(actions.values[id]?.value)
  const score = (id: AbilityId) => Math.min(Math.max(stored(id) ?? POINT_BUY_MIN, POINT_BUY_MIN), POINT_BUY_MAX)
  const scores = Object.fromEntries(ABILITIES.map(([id]) => [id, score(id)])) as Scores
  const left = POINT_BUY_BUDGET - ABILITIES.reduce((sum, [id]) => sum + POINT_BUY_COSTS[scores[id]], 0)
  const suggestion = facts.cls ? STANDARD_ARRAY_BY_CLASS[facts.cls.id] : null

  // Writes every score that is not yet as it should be.
  function commit(next: Scores) {
    for (const [id] of ABILITIES) if (stored(id) !== next[id]) actions.onValue(id, next[id])
  }

  const suggest = (
    <Button variant="outline" size="sm" disabled={!suggestion} onClick={() => suggestion && commit(suggestion)}>
      Use {facts.cls ? facts.cls.label : "class"} suggestion
    </Button>
  )

  return (
    <BuilderDetail title="Ability scores" intro={`Spend ${POINT_BUY_BUDGET} points on scores from ${POINT_BUY_MIN} to ${POINT_BUY_MAX}. Your background’s increase is added on top.`} page={21}>
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-muted-foreground text-xs">Points remaining</p>
          <p className="text-4xl leading-none font-semibold tabular-nums" aria-live="polite">{left}</p>
        </div>
        {suggestion ? (
          suggest
        ) : (
          <Tooltip>
            <TooltipTrigger asChild>
              <span tabIndex={0}>{suggest}</span>
            </TooltipTrigger>
            <TooltipContent>Choose a class to use its suggestion.</TooltipContent>
          </Tooltip>
        )}
      </div>
      <div className="grid">
        <div className={`${COLUMNS} text-muted-foreground border-b pb-1 text-xs`}>
          <span>Ability</span>
          <span className="text-center">Base score</span>
          <span className="text-center">Increase</span>
          <span className="text-center">Total</span>
          <span className="text-center">Modifier</span>
        </div>
        {ABILITIES.map(([id, label]) => {
          const current = scores[id]
          const next = current < POINT_BUY_MAX ? POINT_BUY_COSTS[current + 1] - POINT_BUY_COSTS[current] : null
          const bonus = bonusFor(facts, id)
          const change = (by: number) => commit({ ...scores, [id]: current + by })
          return (
            <div key={id} className={`${COLUMNS} h-12 border-b last:border-b-0`}>
              <span className="flex min-w-0 flex-col">
                <span className="text-sm">
                  <BuilderLabel glossaryKey={`ability.${id}`} actions={actions}>{label}</BuilderLabel>
                </span>
                <span className="text-muted-foreground truncate text-xs">
                  {facts.primary.has(id) ? `Primary for ${facts.cls!.label}` : next === null ? "max" : `+1 costs ${next}`}
                </span>
              </span>
              <span className="flex items-center justify-center gap-2">
                <Button variant="outline" size="icon" className="size-7" aria-label={`Lower ${label}`} disabled={current <= POINT_BUY_MIN} onClick={() => change(-1)}>
                  <Minus />
                </Button>
                <span className="w-6 text-center text-sm font-medium tabular-nums">{current}</span>
                <Button variant="outline" size="icon" className="size-7" aria-label={`Raise ${label}`} disabled={next === null || next > left} onClick={() => change(1)}>
                  <Plus />
                </Button>
              </span>
              <span className="text-muted-foreground text-center text-sm tabular-nums">{bonus ? `+${bonus}` : "—"}</span>
              <span className="text-center text-sm font-medium tabular-nums">{stored(id) === null ? "—" : (actions.derived[`${id}.total`] ?? "—")}</span>
              <span className="text-center text-sm tabular-nums">{stored(id) === null ? "—" : formatNumber(actions.derived[`${id}.mod`], "signed")}</span>
            </div>
          )
        })}
      </div>
    </BuilderDetail>
  )
}
