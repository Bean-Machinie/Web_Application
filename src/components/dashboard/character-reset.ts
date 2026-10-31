import { toast } from "sonner"
import { isEdited } from "@/lib/character-derive"
import { resetToSuggested } from "@/lib/character-rules"
import { markerOfField } from "@/lib/quick-state"
import type { SheetActions } from "./character-actions"
import { changeCharacter } from "./character-change"

// Clears something and says so in a toast with Undo, which puts it back.
export function resetWithUndo(title: string, reset: () => void, undo: () => void) {
  reset()
  toast(title, { action: { label: "Undo", onClick: undo } })
}

// A value the player typed over a calculated one goes back to the calculation: it is cleared. It
// does not go through the character rules, which have nothing to say about it and, on a character
// the builder did not make, would fill in picks that were left empty.
function resetTyped(actions: SheetActions, fields: string[], label: string) {
  const before = fields.map((field) => [field, actions.values[field]?.value ?? null] as const)
  resetWithUndo(
    `Reset ${label} to calculated`,
    () => fields.forEach((field) => actions.onValue(field, null)),
    () => before.forEach(([field, value]) => actions.onValue(field, value))
  )
}

// Gives back what the player took over, for these fields: a pick to the suggestion, through the
// character rules like any other change; a value typed over a calculated one to the calculation.
// Either says so in a toast with Undo. `label` is what was reset: "Fighting Style".
export function resetPicks(actions: SheetActions, fields: string[], label: string) {
  const typed = fields.filter((id) => {
    const field = actions.byId.get(id)
    return field !== undefined && markerOfField(id) === null && isEdited(field, actions.values)
  })
  const picks = fields.filter((id) => !typed.includes(id))
  if (picks.length > 0) changeCharacter(actions, resetToSuggested(picks), `Reset ${label} to suggested`, true)
  if (typed.length > 0) resetTyped(actions, typed, label)
}
