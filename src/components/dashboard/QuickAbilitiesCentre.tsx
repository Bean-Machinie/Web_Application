import { ABILITIES } from "@/lib/character-templates/srd-5-2-1"
import { pointsLeft, poolFor, readScores, unassigned } from "@/lib/quick-abilities"
import type { QuickRules } from "@/lib/quick-state"
import { cn } from "@/lib/utils"
import { abilityFacts, bonusFor } from "./ability-facts"
import type { SheetActions } from "./character-actions"
import { rollAll, setScore } from "./quick-ability-changes"
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

  return (
    <main className={cn("min-w-0 flex-1 overflow-y-auto transition-[padding-left] duration-200 ease-linear [scrollbar-color:var(--border)_transparent] [scrollbar-gutter:stable_both-edges] [scrollbar-width:thin] motion-reduce:transition-none", inset && "pl-[14.75rem]")}>
      <div className="mx-auto flex max-w-4xl flex-col gap-4 p-4 min-[1000px]:p-8">
        <QuickAbilitiesHeader method={rules.method} left={pointsLeft(scores)} free={unassigned(pool, scores)} rolled={pool.length > 0} onRoll={() => rollAll(actions)} />
        <ul aria-label="Ability scores" className="grid grid-cols-2 gap-4 min-[700px]:grid-cols-3">
          {ABILITIES.map(([id, label]) => (
            <QuickAbilityCard
              key={id}
              label={label}
              method={rules.method}
              base={scores[id]}
              bonus={bonusFor(facts, id)}
              options={unassigned(pool, scores, id)}
              left={pointsLeft(scores)}
              onScore={(score) => setScore(actions, id, score)}
            />
          ))}
        </ul>
      </div>
    </main>
  )
}
