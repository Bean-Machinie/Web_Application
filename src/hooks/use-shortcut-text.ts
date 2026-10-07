import { useSyncExternalStore } from "react"
import type { ActionId } from "@/lib/shortcut-actions"
import { bindingText } from "@/lib/shortcut-keys"
import { getTable, watch } from "@/lib/shortcut-store"

// How an action's key is written for a tooltip: the first it has, or nothing if
// it has none. Follows the keys as they change.
export function useShortcutText() {
  const table = useSyncExternalStore(watch, getTable)
  return (action: ActionId) => (table[action][0] ? bindingText(table[action][0]) : "")
}
