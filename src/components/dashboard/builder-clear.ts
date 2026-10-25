import type { SheetActions } from "./character-actions"

// Empties the fields that hold something, so changing a class, background or species
// does not leave behind what the old one asked for.
export function clearFields(actions: SheetActions, fields: string[]) {
  for (const field of fields) if (actions.values[field]?.value != null) actions.onValue(field, null)
}
