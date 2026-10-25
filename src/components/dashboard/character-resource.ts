import { shownResource, splitResource } from "@/lib/character-values"
import type { ResourceValue } from "@/lib/character-values"
import type { SheetField } from "@/lib/character-sheet"
import type { SheetActions } from "./character-actions"

// A resource whose maximum is another field (calculated, or the player's own): the value
// its control shows, and how a change to it is stored. Only the current value is stored
// under the resource; a maximum the player changes is stored under the field it comes from.
export function calculatedResource(field: SheetField, actions: SheetActions) {
  const max = actions.derived[field.maxFrom!] ?? null
  return {
    value: shownResource(actions.values[field.id]?.value, max),
    onChange(next: ResourceValue) {
      const { stored, max: entered } = splitResource(next, max)
      actions.onValue(field.id, stored)
      if (entered !== null) actions.onValue(field.maxFrom!, entered)
    },
  }
}
