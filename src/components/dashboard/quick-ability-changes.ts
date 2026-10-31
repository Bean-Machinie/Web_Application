import { ABILITIES } from "@/lib/character-templates/srd-5-2-1"
import type { AbilityId } from "@/lib/character-templates/srd-5-2-1"
import type { AbilityMethod } from "@/lib/character-templates/srd-5-2-1-quick"
import { ABILITY_FIELDS, rollScores } from "@/lib/quick-abilities"
import { ROLLED_FIELD } from "@/lib/quick-state"
import type { QuickRules } from "@/lib/quick-state"
import type { SheetActions } from "./character-actions"
import { changeCharacter } from "./character-change"
import { resetPicks } from "./quick-reset"

// Every change to the ability scores goes through the character rules (reconcile), like the
// other picks: what is the player's own is kept, and what was suggested is recalculated.

const noScores = () => Object.fromEntries(ABILITIES.map(([id]) => [id, null]))

export const setScore = (actions: SheetActions, id: AbilityId, value: number | null) =>
  changeCharacter(actions, { pick: { values: { [id]: value } } }, "Changed ability score")

// A new method starts the scores again, from the class's suggestion (none for Roll).
export const setMethod = (actions: SheetActions, rules: QuickRules, method: AbilityMethod) =>
  changeCharacter(actions, { rules: { ...rules, method }, pick: { values: noScores(), reset: true } }, "Changed ability method")

// Six new numbers, which no ability holds yet.
export const rollAll = (actions: SheetActions) =>
  changeCharacter(actions, { pick: { values: { ...noScores(), [ROLLED_FIELD]: rollScores() } } }, "Rolled ability scores")

export const setIncrease = (actions: SheetActions, id: string) =>
  changeCharacter(actions, { pick: { values: { "ability-increase": id } } }, "Changed ability increase")

// Every score and the increase back to the suggestion.
export const resetAbilities = (actions: SheetActions) => resetPicks(actions, ABILITY_FIELDS, "ability scores")

// One score back to its suggestion. The scores and the increase are suggested as one, so a reset
// of one alone sets that score to the number suggested; when it is the last to differ, everything
// is reset instead, which hands the whole back to the suggestion.
export function resetScore(actions: SheetActions, id: AbilityId, label: string, suggested: number, last: boolean) {
  if (last) resetAbilities(actions)
  else changeCharacter(actions, { pick: { values: { [id]: suggested } } }, `Reset ${label} to suggested`, true)
}
