import { useState } from "react"
import { Minus, Plus } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import {
  ABILITIES,
  POINT_BUY_BUDGET,
  POINT_BUY_COSTS,
  POINT_BUY_MAX,
  POINT_BUY_MIN,
  STANDARD_ARRAY_BY_CLASS,
} from "@/lib/character-templates/srd-5-2-1"
import type { AbilityId } from "@/lib/character-templates/srd-5-2-1"
import { readStat, toWhole } from "@/lib/character-values"
import { abilityFacts } from "./ability-facts"
import { BuilderLabel } from "./BuilderLabel"
import type { SheetActions } from "./character-actions"

type Scores = Record<AbilityId, number>

// Part 1 of the Abilities step: the point buy, saved as it is made (the first change saves all
// six), with the SRD’s suggestion for the class, and a way to type scores rolled elsewhere.
export function BuilderPointBuy({ actions }: { actions: SheetActions }) {
  const facts = abilityFacts(actions)
  const [typing, setTyping] = useState(false)
  const stored = (id: AbilityId) => readStat(actions.values[id]?.value)
  const score = (id: AbilityId) => Math.min(Math.max(stored(id) ?? POINT_BUY_MIN, POINT_BUY_MIN), POINT_BUY_MAX)
  const scores = Object.fromEntries(ABILITIES.map(([id]) => [id, score(id)])) as Scores
  const left = POINT_BUY_BUDGET - ABILITIES.reduce((sum, [id]) => sum + POINT_BUY_COSTS[scores[id]], 0)
  const suggestion = facts.cls ? STANDARD_ARRAY_BY_CLASS[facts.cls.id] : null

  function commit(next: Scores) {
    for (const [id] of ABILITIES) if (stored(id) !== next[id]) actions.onValue(id, next[id])
  }

  const suggest = (
    <Button variant="outline" size="sm" disabled={!suggestion} onClick={() => suggestion && commit(suggestion)}>
      Use {facts.cls ? facts.cls.label : "class"} suggestion
    </Button>
  )

  return (
    <section aria-label="Base scores" className="bg-card min-w-0 flex-[3_1_420px] rounded-lg border p-6 shadow-xs">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <span className="text-muted-foreground text-xs">Part 1</span>
          <h2 className="text-xl font-semibold">Base scores</h2>
          <p className="text-muted-foreground text-sm">
            Spend {POINT_BUY_BUDGET} points. Every score starts at {POINT_BUY_MIN} and can go up to {POINT_BUY_MAX}.
          </p>
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

      {typing ? (
        <div className="mt-5 grid gap-1">
          {ABILITIES.map(([id, label]) => (
            <label key={id} className="flex h-11 items-center justify-between gap-3 border-b text-sm last:border-b-0">
              {label}
              <Input
                aria-label={label}
                inputMode="numeric"
                maxLength={2}
                defaultValue={stored(id)?.toString() ?? ""}
                onBlur={(event) => {
                  const typed = toWhole(event.target.value)
                  if (typed !== null) actions.onValue(id, Math.min(Math.max(typed, 1), 20))
                }}
                className="h-8 w-20 text-center tabular-nums"
              />
            </label>
          ))}
        </div>
      ) : (
        <>
          <div className="mt-5 flex items-baseline justify-between">
            <span className="text-muted-foreground text-xs">Points left</span>
            <span className="text-2xl font-semibold tabular-nums" aria-live="polite">
              {left} <span className="text-muted-foreground text-sm font-normal">/ {POINT_BUY_BUDGET}</span>
            </span>
          </div>
          <div className="bg-muted mt-2 mb-3 h-1.5 overflow-hidden rounded-full">
            <div className="bg-foreground h-full rounded-full" style={{ width: `${((POINT_BUY_BUDGET - left) / POINT_BUY_BUDGET) * 100}%` }} />
          </div>
          {ABILITIES.map(([id, label]) => {
            const current = scores[id]
            const next = current < POINT_BUY_MAX ? POINT_BUY_COSTS[current + 1] - POINT_BUY_COSTS[current] : null
            const change = (by: number) => commit({ ...scores, [id]: current + by })
            return (
              <div key={id} className="flex h-12 items-center justify-between gap-3 border-t">
                <span className="flex flex-col">
                  <span className="flex items-center gap-2 text-sm">
                    <BuilderLabel glossaryKey={`ability.${id}`} actions={actions}>{label}</BuilderLabel>
                    {facts.primary.has(id) && <Badge variant="secondary" className="h-4 px-1.5 text-[10px]">Primary</Badge>}
                  </span>
                  <span className="text-muted-foreground text-xs">Costs {POINT_BUY_COSTS[current]}</span>
                </span>
                <span className="flex items-center gap-2">
                  <Button variant="outline" size="icon" className="size-8" aria-label={`Lower ${label}`} disabled={current <= POINT_BUY_MIN} onClick={() => change(-1)}>
                    <Minus />
                  </Button>
                  <span className="w-7 text-center text-sm font-semibold tabular-nums">{current}</span>
                  <Button variant="outline" size="icon" className="size-8" aria-label={`Raise ${label}`} disabled={next === null || next > left} onClick={() => change(1)}>
                    <Plus />
                  </Button>
                </span>
                <span className="text-muted-foreground w-20 text-right text-xs">{next === null ? "Max" : `+1 costs ${next}`}</span>
              </div>
            )
          })}
        </>
      )}
      <p className="text-muted-foreground mt-3 text-xs">
        {typing ? "Typing scores skips the point limit." : "Rolled your scores at the table?"}{" "}
        <button type="button" onClick={() => setTyping(!typing)} className="text-foreground underline underline-offset-4">
          {typing ? "Back to point buy" : "Enter them instead"}
        </button>
      </p>
    </section>
  )
}
