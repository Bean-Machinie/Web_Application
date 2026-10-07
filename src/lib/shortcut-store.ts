import { ACTIONS } from "./shortcut-actions"
import type { ActionId } from "./shortcut-actions"
import { normalise, sameBinding } from "./shortcut-keys"
import type { Binding } from "./shortcut-keys"

// An action has at most this many keys.
export const MAX_BINDINGS = 2
const STORAGE_KEY = "map-builder:shortcuts"

export type BindingTable = Record<ActionId, Binding[]>
// Only what was changed from the defaults is kept, so a default that is changed
// later reaches everyone who never changed that action.
type Overrides = Partial<Record<ActionId, Binding[]>>

const FIXED = ACTIONS.filter(({ fixed }) => fixed).flatMap(({ defaults }) => defaults)
const EDITABLE = new Set(ACTIONS.filter(({ fixed }) => !fixed).map(({ id }) => id))

const isBinding = (value: unknown): value is Binding =>
  typeof value === "object" && value !== null && typeof (value as Binding).key === "string" && (value as Binding).key !== ""

// What was saved, as far as it is still good: known actions that can be changed,
// at most two keys each, none that a fixed action has or that another has taken.
function load(): Overrides {
  try {
    const saved: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}")
    if (typeof saved !== "object" || saved === null) return {}
    const taken = [...FIXED]
    const kept: Overrides = {}
    for (const { id } of ACTIONS) {
      const list = (saved as Record<string, unknown>)[id]
      if (!EDITABLE.has(id) || !Array.isArray(list)) continue
      kept[id] = list
        .filter(isBinding)
        .map(normalise)
        .filter((binding) => !taken.some((other) => sameBinding(other, binding)))
        .slice(0, MAX_BINDINGS)
      // A list with nothing good left in it is not "cleared": it is the defaults.
      if (kept[id].length === 0 && list.length > 0) delete kept[id]
      else taken.push(...kept[id])
    }
    return kept
  } catch {
    return {}
  }
}

function save() {
  try {
    if (Object.keys(overrides).length === 0) localStorage.removeItem(STORAGE_KEY)
    else localStorage.setItem(STORAGE_KEY, JSON.stringify(overrides))
  } catch {
    // The changes just will not be remembered.
  }
}

// A default that another action has since been given is dropped, so no key is
// ever two actions'.
function build(): BindingTable {
  const claimed = Object.values(overrides).flat()
  return Object.fromEntries(
    ACTIONS.map(({ id, defaults }) => [
      id,
      overrides[id] ?? defaults.filter((binding) => !claimed.some((other) => sameBinding(other, binding))),
    ])
  ) as BindingTable
}

let overrides = load()
let table = build()
const watchers = new Set<() => void>()

// The table is replaced, never changed, so that anything watching it
// (useSyncExternalStore) sees a new one.
function commit(next: Overrides) {
  overrides = next
  table = build()
  save()
  watchers.forEach((watcher) => watcher())
}

export const getTable = () => table

export function watch(watcher: () => void) {
  watchers.add(watcher)
  return () => {
    watchers.delete(watcher)
  }
}

export const isChanged = (id: ActionId) => id in overrides
export const anyChanged = () => Object.keys(overrides).length > 0

// Another action that has the binding, or null if it is free.
export function ownerOf(binding: Binding, except: ActionId): ActionId | null {
  return ACTIONS.find(({ id }) => id !== except && table[id].some((other) => sameBinding(other, binding)))?.id ?? null
}

export function setBindings(id: ActionId, bindings: Binding[]) {
  if (!EDITABLE.has(id)) return
  const { defaults } = ACTIONS.find((action) => action.id === id)!
  const next = { ...overrides }
  const same = bindings.length === defaults.length && bindings.every((binding, i) => sameBinding(binding, defaults[i]))
  if (same) delete next[id]
  else next[id] = bindings.slice(0, MAX_BINDINGS)
  commit(next)
}

export function resetAction(id: ActionId) {
  const next = { ...overrides }
  delete next[id]
  commit(next)
}

export const resetAll = () => commit({})
