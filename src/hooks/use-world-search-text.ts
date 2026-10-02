import { useEffect, useState } from "react"
import { fetchSearchText } from "@/lib/world-search"
import type { SearchText } from "@/lib/world-search"

// Loads every entry's text the first time a search starts, not with the list,
// since most visits never search. Null until it arrives. Use with
// key={campaignId}.
export function useWorldSearchText(campaignId: string, wanted: boolean) {
  const [text, setText] = useState<SearchText | null>(null)
  const [started, setStarted] = useState(false)

  useEffect(() => {
    if (!wanted || started) return
    setStarted(true)
    fetchSearchText(campaignId)
      .then(setText)
      // The search still works on names and facts without it.
      .catch(() => {})
  }, [campaignId, wanted, started])

  return text
}
