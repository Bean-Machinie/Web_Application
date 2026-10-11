import { useSyncExternalStore } from "react"
import type { ActionId } from "@/lib/shortcut-actions"
import { bindingParts } from "@/lib/shortcut-keys"
import { getTable, watch } from "@/lib/shortcut-store"

// The keys of an action as chips show them, "Shift+H" being ["Shift", "H"]: the first it
// has, or none if it has none. Follows the keys as they are changed, so a tooltip or a
// help card is right for the keys the person has chosen.
export function useShortcutKeys() {
  const table = useSyncExternalStore(watch, getTable)
  return (action: ActionId): string[] => (table[action][0] ? bindingParts(table[action][0]) : [])
}
