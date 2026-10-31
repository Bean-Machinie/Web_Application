import { ABILITIES } from "@/lib/character-templates/srd-5-2-1"
import type { AbilityId } from "@/lib/character-templates/srd-5-2-1"
import type { AbilityMethod } from "@/lib/character-templates/srd-5-2-1-quick"
import { rollScores } from "@/lib/quick-abilities"
import { ROLLED_FIELD } from "@/lib/quick-state"
import type { QuickRules } from "@/lib/quick-state"
import type { SheetActions } from "./character-actions"
import { changeCharacter } from "./character-change"

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
