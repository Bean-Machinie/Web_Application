import { useState } from "react"
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
import { abilityFacts } from "./ability-facts"
import { idFor, levelsFrom, withLevel } from "./builder-increase"
import type { Level } from "./builder-increase"
import { BuilderAbilityRow } from "./BuilderAbilityRow"
import { BuilderPointsBar } from "./BuilderPointsBar"
import type { SheetActions } from "./character-actions"

type Scores = Record<AbilityId, number>

const HEAD = "text-muted-foreground px-3 py-2 text-left text-xs font-normal"

// The Abilities step as one table: the base scores by point buy (the first change saves all six),
// what each costs, the background’s increase, and the result. Use with key={background id}, so
// the increase starts from what is stored.
export function BuilderAbilitiesCard({ actions }: { actions: SheetActions }) {
  const facts = abilityFacts(actions)
  const { background, cls } = facts
  const [typing, setTyping] = useState(false)
  const [levels, setLevels] = useState(() => (background ? levelsFrom(background, facts.increaseId) : {}))
  const stored = (id: AbilityId) => readStat(actions.values[id]?.value)
  const score = (id: AbilityId) => Math.min(Math.max(stored(id) ?? POINT_BUY_MIN, POINT_BUY_MIN), POINT_BUY_MAX)
  const scores = Object.fromEntries(ABILITIES.map(([id]) => [id, score(id)])) as Scores
  const left = POINT_BUY_BUDGET - ABILITIES.reduce((sum, [id]) => sum + POINT_BUY_COSTS[scores[id]], 0)
  const suggestion = cls ? STANDARD_ARRAY_BY_CLASS[cls.id] : null

  function commit(next: Scores) {
    for (const [id] of ABILITIES) if (stored(id) !== next[id]) actions.onValue(id, next[id])
  }

  function setLevel(ability: AbilityId, level: Level) {
    if (!background) return
    const next = withLevel(background, levels, ability, level)
    setLevels(next)
    actions.onValue("ability-increase", idFor(background, next))
  }

  return (
    <section aria-label="Ability scores" className="bg-card min-w-0 flex-1 rounded-lg border shadow-xs">
      <BuilderPointsBar
        typing={typing}
        left={left}
        className={cls?.label ?? null}
        onSuggest={suggestion ? () => commit(suggestion) : null}
        background={background}
        levels={levels}
      />
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse">
          <thead>
            <tr>
              <th scope="col" className={`${HEAD} pl-6`}>Ability</th>
              <th scope="col" className={HEAD}>Base score</th>
              <th scope="col" className={HEAD}>Cost</th>
              <th scope="col" className={HEAD}>{background ? `${background.label} increase` : "Increase"}</th>
              <th scope="col" className={HEAD}>Total</th>
              <th scope="col" className={`${HEAD} pr-6`}>Modifier</th>
            </tr>
          </thead>
          <tbody>
            {ABILITIES.map(([id, label]) => (
              <BuilderAbilityRow
                key={id}
                id={id}
                label={label}
                actions={actions}
                primary={facts.primary.has(id)}
                stored={stored(id)}
                score={scores[id]}
                left={left}
                typing={typing}
                level={background?.abilities.includes(id) ? (levels[id] ?? "0") : null}
                onScore={(next) => commit({ ...scores, [id]: next })}
                onTyped={(next) => actions.onValue(id, next)}
                onLevel={(level) => setLevel(id, level)}
              />
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-muted-foreground border-t px-6 py-3 text-xs">
        Rolled your scores at the table?{" "}
        <button type="button" onClick={() => setTyping(!typing)} className="text-foreground underline underline-offset-4">
          {typing ? "Back to point buy" : "Enter rolled scores instead"}
        </button>
      </p>
    </section>
  )
}
