import { useEffect, useState } from "react"
import type { WorldEntry } from "@/lib/world-entries"
import type { WorldScope } from "@/lib/world-scope"

// Many editors and chips on one page ask for the same list, so it is fetched
// once per scope and reused for a little while. A fresh page load, or the
// picker opening after a pause, asks again.
const FRESH_MS = 30_000
const cache = new Map<string, { at: number; entries: Promise<WorldEntry[]> }>()

export function loadMentionEntries(scope: WorldScope) {
  const hit = cache.get(scope.key)
  if (hit && Date.now() - hit.at < FRESH_MS) return hit.entries

  const entries = scope.fetchEntries()
  cache.set(scope.key, { at: Date.now(), entries })
  entries.catch(() => cache.delete(scope.key))
  return entries
}

// The entries a mention can name or link to: the ones of the scope, which for a
// player are only the revealed ones. Null while they load, or without a scope.
export function useMentionEntries(scope: WorldScope | null) {
  const [entries, setEntries] = useState<WorldEntry[] | null>(null)

  useEffect(() => {
    if (!scope) return
    let current = true
    loadMentionEntries(scope)
      .then((list) => current && setEntries(list))
      .catch(() => {})
    return () => {
      current = false
    }
  }, [scope])

  return entries
}
