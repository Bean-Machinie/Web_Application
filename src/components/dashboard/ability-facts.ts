import { chosenOption, origins } from "@/lib/character-grants"
import { INCREASE_TO } from "@/lib/character-templates/dnd-5e-2024-tables"
import { ABILITY_CAP } from "@/lib/character-templates/srd-5-2-1"
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

export function abilityFacts(actions: SheetActions): AbilityFacts {
  const { cls, background } = origins(actions)
  return {
    cls,
    background,
    increaseId: chosenOption(actions, "ability-increase")?.id ?? null,
    primary: new Set(cls?.primary),
    saves: new Set(cls?.saves),
  }
}

// What the background's increase adds to an ability, by the way it was chosen.
export const bonusFor = (facts: AbilityFacts, ability: AbilityId) =>
  facts.background && facts.increaseId ? (INCREASE_TO(ability)[facts.increaseId] ?? 0) : 0

// "15 + 2 from Soldier", for the tooltip of a score the increase applies to. `total` is what the
// sheet works out for the score, null if it was typed over: it is lower than the two added when the cap held it.
export function increaseNote(facts: AbilityFacts, ability: AbilityId, base: number | null, total: number | null) {
  const bonus = bonusFor(facts, ability)
  if (!bonus || base === null || !facts.background) return null
  const capped = total !== null && total < base + bonus
  return `${base} + ${bonus} from ${facts.background.label}${capped ? `, capped at ${ABILITY_CAP}` : ""}`
}
