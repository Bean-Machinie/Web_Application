import { deriveAll, isEdited } from "@/lib/character-derive"
import { ABILITIES } from "@/lib/character-templates/srd-5-2-1"
import { ruleStateOf } from "@/lib/character-rules-state"
import { buyScore, pointsLeft, poolFor, readScores, suggestedAbilities, unassigned } from "@/lib/quick-abilities"
import type { QuickRules } from "@/lib/quick-state"
import { cn } from "@/lib/utils"
import { abilityFacts, bonusFor } from "./ability-facts"
import type { SheetActions } from "./character-actions"
import { calculatedText } from "./character-calculated"
import { resetPicks } from "./character-reset"
import { resetAbilities, resetScore, rollAll, setScore } from "./quick-ability-changes"
import { QuickAbilitiesHeader } from "./QuickAbilitiesHeader"
import { QuickAbilityCard } from "./QuickAbilityCard"

type Props = {
  actions: SheetActions
  rules: QuickRules
  // The left panel is open, over the left of the centre.
  inset: boolean
}

// The centre of the Abilities workspace: the six abilities as cards, three across.
export function QuickAbilitiesCentre({ actions, rules, inset }: Props) {
  const scores = readScores(actions.values)
  const facts = abilityFacts(actions)
  const pool = poolFor(rules.method, actions.values)
  // What differs from the suggestion: each score, and the increase as one.
  const state = ruleStateOf(actions)
  const suggestion = suggestedAbilities(state)
  const off = suggestion ? ABILITIES.filter(([id]) => scores[id] !== suggestion.scores[id]).length : 0
  // The total and modifier of each score are the sheet's own (the template's formulas). Point buy
  // shows every score at its lowest at least, so those are worked out for the scores as shown.
  const derived = rules.method === "point-buy"
    ? deriveAll([...actions.byId.values()], { ...actions.values, ...Object.fromEntries(ABILITIES.map(([id]) => [id, { pinned: actions.values[id]?.pinned ?? null, value: buyScore(scores[id]) }])) })
    : actions.derived
  const changed = suggestion ? off + ((state.picks["ability-increase"] ?? null) !== suggestion.increase ? 1 : 0) : null

  return (
    <main className={cn("min-w-0 flex-1 overflow-y-auto transition-[padding-left] duration-200 ease-linear [scrollbar-color:var(--border)_transparent] [scrollbar-gutter:stable_both-edges] [scrollbar-width:thin] motion-reduce:transition-none", inset && "pl-[14.75rem]")}>
      <div className="mx-auto flex max-w-4xl flex-col gap-4 p-4 min-[1000px]:p-8">
        <QuickAbilitiesHeader method={rules.method} left={pointsLeft(scores)} free={unassigned(pool, scores)} rolled={pool.length > 0} onRoll={() => rollAll(actions)} changed={changed} onUseSuggested={() => resetAbilities(actions)} />
        <ul aria-label="Ability scores" className="grid grid-cols-2 gap-4 min-[700px]:grid-cols-3">
          {ABILITIES.map(([id, label]) => {
            // What the player typed over on the sheet, the total or the modifier.
            const typed = [`${id}.total`, `${id}.mod`].flatMap((fieldId) => {
              const field = actions.byId.get(fieldId)
              return field && isEdited(field, actions.values) ? [field] : []
            })
            return (
            <QuickAbilityCard
              key={id}
              label={label}
              method={rules.method}
              base={scores[id]}
              bonus={bonusFor(facts, id)}
              total={derived[`${id}.total`] ?? null}
              mod={derived[`${id}.mod`] ?? null}
              options={unassigned(pool, scores, id)}
              left={pointsLeft(scores)}
              onScore={(score) => setScore(actions, id, score)}
              suggested={suggestion?.scores[id] ?? null}
              onReset={() => resetScore(actions, id, label, suggestion!.scores[id]!, changed === 1)}
              edited={typed.length > 0 ? { calculated: calculatedText(actions, typed[0]), onReset: () => resetPicks(actions, typed.map((field) => field.id), label) } : null}
            />
            )
          })}
        </ul>
      </div>
    </main>
  )
}
