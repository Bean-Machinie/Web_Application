import { choiceState } from "./character-choices"
import type { Derived } from "./character-derive"
import type { SheetField } from "./character-sheet"
import { ABILITIES } from "./character-templates/srd-5-2-1"
import { readStat } from "./character-values"
import { UNTITLED_CHARACTER } from "./characters"
import type { Character, StoredValue } from "./characters"

export type BuilderStep = "class" | "background" | "species" | "abilities" | "details"

export const BUILDER_STEPS: { id: BuilderStep; label: string }[] = [
  { id: "class", label: "Class" },
  { id: "background", label: "Background" },
  { id: "species", label: "Species" },
  { id: "abilities", label: "Abilities" },
  { id: "details", label: "Details" },
]

export type StepProgress = { done: boolean; choice: string | null }

type Sheet = { character: Character; fields: SheetField[]; values: Record<string, StoredValue>; derived: Derived }

// What each step has so far: whether it is finished, and the choice to show in the stepper.
export function builderProgress({ character, fields, values, derived }: Sheet): Record<BuilderStep, StepProgress> {
  const byId = new Map(fields.map((field) => [field.id, field]))
  const label = (id: string) => {
    const field = byId.get(id)
    return field ? (choiceState(field, byId, derived).selected?.label ?? null) : null
  }
  const scores = ABILITIES.filter(([id]) => readStat(values[id]?.value) !== null).length
  const named = character.name !== UNTITLED_CHARACTER

  return {
    class: { done: label("character-class") !== null, choice: label("character-class") },
    background: { done: label("background-choice") !== null, choice: label("background-choice") },
    species: { done: label("species-choice") !== null, choice: label("species-choice") },
    abilities: { done: scores === ABILITIES.length, choice: scores > 0 ? `${scores} of ${ABILITIES.length} set` : null },
    details: { done: named, choice: named ? character.name : null },
  }
}

// The first step that must be finished for the sheet to work: the details are optional.
export function firstUnfinished(progress: Record<BuilderStep, StepProgress>) {
  return BUILDER_STEPS.slice(0, 4).find((step) => !progress[step.id].done) ?? null
}
