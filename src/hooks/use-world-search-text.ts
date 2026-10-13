import { useEffect, useState } from "react"
import type { SearchText } from "@/lib/world-search"
import type { WorldScope } from "@/lib/world-scope"

// Loads every entry's text the first time a search starts, not with the list,
// since most visits never search. Null until it arrives. Use with
// key={scope.key}.
export function useWorldSearchText(scope: WorldScope, wanted: boolean) {
  const [text, setText] = useState<SearchText | null>(null)
  const [started, setStarted] = useState(false)

  useEffect(() => {
    if (!wanted || started) return
    setStarted(true)
    scope
      .fetchSearchText()
      .then(setText)
      // The search still works on names and facts without it.
      .catch(() => {})
  }, [scope, wanted, started])

  return text
}
