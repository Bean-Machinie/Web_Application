import type { Derived } from "./character-derive"
import type { SheetField } from "./character-sheet"
import { readPicks } from "./character-values"
import type { StoredValue } from "./characters"
import type { ChoiceOption, Condition } from "./character-templates/types"

// The options a choice field offers now. `chosenOf` says which option another choice field
// has, for the fields whose options depend on one (a background's ability increases).
export function optionsFor(field: SheetField, chosenOf: (id: string) => string | null): ChoiceOption[] {
  const list = field.choices
  if (!list) return []
  if ("by" in list) {
    const by = chosenOf(list.by)
    return by ? (list.options[by] ?? []) : []
  }
  return list.options
}

// The options of a choice field and the one it has, once the numbers are worked out: the
// player's pick, or what the template calculates. Derived holds the option's number.
export function choiceState(
  field: SheetField,
  byId: Map<string, SheetField>,
  derived: Derived
): { options: ChoiceOption[]; selected: ChoiceOption | null } {
  const chosenOf = (id: string): string | null => {
    const other = byId.get(id)
    return other ? choiceState(other, byId, derived).selected?.id ?? null : null
  }
  const options = optionsFor(field, chosenOf)
  const number = derived[field.id]
  return { options, selected: number ? (options[number - 1] ?? null) : null }
}

// Whether every condition holds: each names a field and the option (or any of the options)
// it must have, for a choice, or among the ones picked, for a field of picks.
export function conditionsHold(
  conditions: Condition[],
  byId: Map<string, SheetField>,
  derived: Derived,
  values: Record<string, StoredValue> = {}
) {
  return conditions.every((condition) => {
    const field = byId.get(condition.field)
    if (!field) return false
    const wanted = [condition.is].flat()
    if (field.type === "picks") return readPicks(values[field.id]?.value).some((id) => wanted.includes(id))
    const chosen = choiceState(field, byId, derived).selected?.id
    return chosen !== undefined && wanted.includes(chosen)
  })
}
