import type { WorldEntry } from "./world-entries"
import type { WorldScope } from "./world-scope"

// Many editors and chips on one page ask for the same list, so it is fetched
// once per scope and reused for a little while. Anything that changes entries
// (revealing, renaming, creating, deleting, copying) calls forgetMentionEntries,
// so what chips show is never older than the last change made here.
const FRESH_MS = 30_000
const cache = new Map<string, { at: number; entries: Promise<WorldEntry[]> }>()
const listeners = new Set<() => void>()

export function loadMentionEntries(scope: WorldScope) {
  const hit = cache.get(scope.key)
  if (hit && Date.now() - hit.at < FRESH_MS) return hit.entries

  const entries = scope.fetchEntries()
  cache.set(scope.key, { at: Date.now(), entries })
  entries.catch(() => cache.delete(scope.key))
  return entries
}

// Drops every cached list and tells the chips on screen to ask again.
export function forgetMentionEntries() {
  cache.clear()
  listeners.forEach((listener) => listener())
}

export function onMentionEntriesForgotten(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}
