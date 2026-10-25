import { choiceState, conditionsHold } from "@/lib/character-choices"
import { isEdited } from "@/lib/character-derive"
import type { SheetField } from "@/lib/character-sheet"
import type { SheetActions } from "./character-actions"

// What a row shows beyond the field's value: a note beside the name ("from Human"), and, for
// a fixed field the template lets be changed, the menu item that changes it. Changing it
// stores the current option as the player's own, so the field then shows as edited.
export function rowExtras(field: SheetField, actions: SheetActions) {
  const note = field.note && conditionsHold(field.note.when, actions.byId, actions.derived, actions.values) ? field.note.text : null
  const current = field.locked && field.overrideLabel && !isEdited(field, actions.values)
    ? choiceState(field, actions.byId, actions.derived).selected
    : null
  const unlock = current && field.overrideLabel ? { label: field.overrideLabel, run: () => actions.onValue(field.id, current.id) } : undefined
  return { note, unlock }
}
