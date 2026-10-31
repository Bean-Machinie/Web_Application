import { Dices } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { deriveAll } from "@/lib/character-derive"
import { signed } from "@/lib/character-format"
import { explain } from "@/lib/character-glossary"
import { ruleStateOf } from "@/lib/character-rules-state"
import { ABILITIES, POINT_BUY_BUDGET } from "@/lib/character-templates/srd-5-2-1"
import type { AbilityId } from "@/lib/character-templates/srd-5-2-1"
import type { AbilityMethod } from "@/lib/character-templates/srd-5-2-1-quick"
import { buyScore, pointsLeft, poolFor, readScores, suggestedAbilities, unassigned } from "@/lib/quick-abilities"
import type { QuickRules } from "@/lib/quick-state"
import { cn } from "@/lib/utils"
import { abilityFacts, bonusFor } from "./ability-facts"
import type { SheetActions } from "./character-actions"
import { FieldEditedMarker } from "./FieldEditedMarker"
import { resetAbilities, resetScore, rollAll, setScore } from "./quick-ability-changes"
import { QuickAbilitiesHeader } from "./QuickAbilitiesHeader"
import { QuickAbilityControl } from "./QuickAbilityControl"
import { QuickScoreReset } from "./QuickScoreReset"
import { QuickSwap } from "./QuickSwap"
import { StatGrid } from "./StatGrid"

type Props = {
  actions: SheetActions
  rules: QuickRules
  // The left panel is open, over the left of the centre.
  inset: boolean
  // An ability to scroll to and light up for a moment, and the call that says it was done.
  focus: { ability: AbilityId; at: number } | null
  onFocused: () => void
}

const HINT: Record<AbilityMethod, string> = {
  standard: "Give each ability one of the numbers.",
  "point-buy": "Spend your points with − and +.",
  own: "Roll six scores, then give each ability one.",
}

// The centre of the Abilities workspace: the six abilities in one grid, each with its modifier large,
// its score and the working of it ("Score 17 = 15 + 2 Soldier"), and what sets its base score. The background's
// increase is chosen in the left panel, and always named by its source.
export function QuickAbilitiesCentre({ actions, rules, inset, focus, onFocused }: Props) {
  const [lit, setLit] = useState<AbilityId | null>(null)
  const timer = useRef<number | undefined>(undefined)
  useEffect(() => () => window.clearTimeout(timer.current), [])
  useEffect(() => {
    if (!focus) return
    document.getElementById(`ability-${focus.ability}`)?.scrollIntoView({ block: "center", behavior: "smooth" })
    setLit(focus.ability)
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setLit(null), 1400)
    onFocused()
  }, [focus, onFocused])

  const scores = readScores(actions.values)
  const pool = poolFor(rules.method, actions.values)
  const facts = abilityFacts(actions)
  const left = pointsLeft(scores)
  // What differs from the suggestion: each score, and the increase as one.
  const state = ruleStateOf(actions)
  const suggestion = suggestedAbilities(state)
  const off = suggestion ? ABILITIES.filter(([id]) => scores[id] !== suggestion.scores[id]).length : 0
  const changed = suggestion ? off + ((state.picks["ability-increase"] ?? null) !== suggestion.increase ? 1 : 0) : null
  // The modifiers are the sheet's own. Point buy shows every score at its lowest at least, so those
  // are worked out for the scores as shown.
  const derived = rules.method === "point-buy"
    ? deriveAll([...actions.byId.values()], { ...actions.values, ...Object.fromEntries(ABILITIES.map(([id]) => [id, { pinned: actions.values[id]?.pinned ?? null, value: buyScore(scores[id]) }])) })
    : actions.derived

  const aside =
    rules.method === "point-buy" ? (
      <span className="tabular-nums"><QuickSwap text={`${left} of ${POINT_BUY_BUDGET} points left`} className="px-0" /></span>
    ) : rules.method === "own" ? (
      <Button variant="secondary" size="sm" onClick={() => rollAll(actions)}>
        <Dices />
        {pool.length > 0 ? "Roll again" : "Roll"}
      </Button>
    ) : null

  return (
    <main className={cn("min-w-0 flex-1 overflow-y-auto transition-[padding-left] duration-200 ease-linear [scrollbar-color:var(--border)_transparent] [scrollbar-gutter:stable_both-edges] [scrollbar-width:thin] motion-reduce:transition-none", inset && "pl-[14.75rem]")}>
      <div className="mx-auto flex max-w-[720px] flex-col gap-4 p-4 min-[1000px]:p-8">
        <QuickAbilitiesHeader text={HINT[rules.method]} changed={changed} onUseSuggested={() => resetAbilities(actions)} aside={aside} />
        <StatGrid
          large
          label="Ability scores"
          cells={ABILITIES.map(([id, label]) => {
            const bonus = bonusFor(facts, id)
            const base = rules.method === "point-buy" ? buyScore(scores[id]) : scores[id]
            const total = derived[`${id}.total`]
            const field = actions.byId.get(id)
            return {
              key: id,
              id: `ability-${id}`,
              highlighted: lit === id,
              label,
              explanation: field ? explain(field, actions) : null,
              // The modifier is what is added to a roll, so it is the large number, captioned; under it
              // the score and how it comes about.
              value: signed(derived[`${id}.mod`]),
              changed: false,
              detail: "Modifier",
              note: total === null || total === undefined || base === null ? "—" : bonus > 0 && facts.background ? `Score ${total} = ${base} + ${bonus} ${facts.background.label}` : `Score ${total}`,
              control: <QuickAbilityControl label={label} method={rules.method} base={scores[id]} options={unassigned(pool, scores, id)} left={left} onScore={(score) => setScore(actions, id, score)} />,
              extra: <FieldEditedMarker actions={actions} fields={[`${id}.total`, `${id}.mod`]} label={label} />,
              corner: !suggestion ? null : scores[id] === suggestion.scores[id] ? (
                <span role="img" aria-label="Suggested" title="Suggested" className="bg-foreground/60 m-1.5 block size-1.5 rounded-full" />
              ) : (
                <QuickScoreReset label={label} suggested={suggestion.scores[id]!} onReset={() => resetScore(actions, id, label, suggestion.scores[id]!, changed === 1)} />
              ),
            }
          })}
        />
      </div>
    </main>
  )
}
