import { choiceState } from "@/lib/character-choices"
import { deriveAll, formatNumber } from "@/lib/character-derive"
import type { SheetField } from "@/lib/character-sheet"
import type { SheetActions } from "./character-actions"

// What the template's formulas give for a field once the player's own value is taken away, as the
// field shows it: "13", "+2", "30 ft", the option's name, or on or off for a toggle. Null when
// they cannot work it out. For a value that has been typed over, to say what a reset gives.
export function calculatedText(actions: SheetActions, field: SheetField) {
  const without = { ...actions.values, [field.id]: { pinned: actions.values[field.id]?.pinned ?? null, value: null } }
  const derived = deriveAll([...actions.byId.values()], without)
  if (field.type === "choice") return choiceState(field, actions.byId, derived).selected?.label ?? null
  if (field.type === "toggle") return (derived[field.id] ?? 0) > 0 ? "on" : "off"
  const value = derived[field.id]
  return value === null || value === undefined ? null : formatNumber(value, field.format)
}
