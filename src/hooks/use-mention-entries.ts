import { useEffect, useState } from "react"
import { loadMentionEntries, onMentionEntriesForgotten } from "@/lib/mention-entries"
import type { WorldEntry } from "@/lib/world-entries"
import type { WorldScope } from "@/lib/world-scope"

// The entries a mention can name or link to: the ones of the scope, which for a
// player are only the revealed ones. Null while they load, or without a scope.
// They are fetched again whenever an entry is changed.
export function useMentionEntries(scope: WorldScope | null) {
  const [entries, setEntries] = useState<WorldEntry[] | null>(null)
  const [version, setVersion] = useState(0)

  useEffect(() => onMentionEntriesForgotten(() => setVersion((current) => current + 1)), [])

  useEffect(() => {
    if (!scope) return
    let current = true
    loadMentionEntries(scope)
      .then((list) => current && setEntries(list))
      .catch(() => {})
    return () => {
      current = false
    }
  }, [scope, version])

  return entries
}
