import { ACTIONS } from "./shortcut-actions"
import type { ActionId } from "./shortcut-actions"
import type { Binding } from "./shortcut-keys"

export type BindingTable = Record<ActionId, Binding[]>

// The keys of every action as they are now. The table is replaced, never changed,
// so that anything watching it (useSyncExternalStore) sees a new one.
let table = Object.fromEntries(ACTIONS.map(({ id, defaults }) => [id, defaults])) as BindingTable
const watchers = new Set<() => void>()

export const getTable = () => table

export function watch(watcher: () => void) {
  watchers.add(watcher)
  return () => {
    watchers.delete(watcher)
  }
}
