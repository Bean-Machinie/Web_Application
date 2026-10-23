import { useEffect, useState } from "react"
import { DRAFT_SOURCES } from "@/lib/draft-sources"
import { loadDrafts } from "@/lib/drafts"
import type { Draft } from "@/lib/drafts"
import type { WorldEntry } from "@/lib/world-entries"
import type { WorldScope } from "@/lib/world-scope"

// The unfinished work of every tool, newest first; null until it has loaded. Loads again
// when the entries do.
export function useDrafts(scope: WorldScope, entries: WorldEntry[] | null) {
  const [drafts, setDrafts] = useState<Draft[] | null>(null)

  useEffect(() => {
    if (!entries) return
    let current = true
    loadDrafts(DRAFT_SOURCES, { scope, entries }).then((list) => current && setDrafts(list))
    return () => {
      current = false
    }
  }, [scope, entries])

  return drafts
}
