import { choiceState } from "@/lib/character-choices"
import { INCREASE_TO } from "@/lib/character-templates/dnd-5e-2024-tables"
import { ABILITY_CAP, BACKGROUNDS, CLASSES } from "@/lib/character-templates/srd-5-2-1"
import type { AbilityId, SrdBackground, SrdClass } from "@/lib/character-templates/srd-5-2-1"
import type { SheetActions } from "./character-actions"

// What the SRD says about the class and background chosen, for the badges, the tooltip and
// the Set scores dialog.
export type AbilityFacts = {
  cls: SrdClass | null
  background: SrdBackground | null
  increaseId: string | null
  primary: ReadonlySet<AbilityId>
  saves: ReadonlySet<AbilityId>
}

export function chosenId(actions: SheetActions, fieldId: string) {
  const field = actions.byId.get(fieldId)
  return field ? (choiceState(field, actions.byId, actions.derived).selected?.id ?? null) : null
}

export function abilityFacts(actions: SheetActions): AbilityFacts {
  const cls = CLASSES.find((candidate) => candidate.id === chosenId(actions, "character-class")) ?? null
  const background = BACKGROUNDS.find((candidate) => candidate.id === chosenId(actions, "background-choice")) ?? null
  return {
    cls,
    background,
    increaseId: chosenId(actions, "ability-increase"),
    primary: new Set(cls?.primary),
    saves: new Set(cls?.saves),
  }
}

// A score with an increase added, never taking it above 20 (a score already above stays).
export const totalWith = (base: number, bonus: number) => (base >= ABILITY_CAP ? base : Math.min(ABILITY_CAP, base + bonus))

// What the background's increase adds to an ability, by the way it was chosen.
export const bonusFor = (facts: AbilityFacts, ability: AbilityId) =>
  facts.background && facts.increaseId ? (INCREASE_TO(ability)[facts.increaseId] ?? 0) : 0

// "15 + 2 from Soldier", for the tooltip of a score the increase applies to.
export function increaseNote(facts: AbilityFacts, ability: AbilityId, base: number | null) {
  const bonus = bonusFor(facts, ability)
  if (!bonus || base === null || !facts.background) return null
  const capped = totalWith(base, bonus) < base + bonus
  return `${base} + ${bonus} from ${facts.background.label}${capped ? `, capped at ${ABILITY_CAP}` : ""}`
}
