import { useEffect, useState } from "react"
import { searchEntries } from "@/lib/search-entries"
import type { SearchHit, SearchSource } from "@/lib/search-entries"

const DEBOUNCE_MS = 200
const PER_GROUP = 12

// The entries the database finds for what is typed, after a short pause. The
// last results stay until the new ones arrive, so the list does not flicker.
// A failed search (or a database without the function yet) finds nothing.
export function useEntrySearch(
  open: boolean,
  query: string,
  currentCampaign: string | null,
  sources: SearchSource[]
) {
  const [hits, setHits] = useState<SearchHit[]>([])
  const text = query.trim()
  const wanted = sources.join(",")

  useEffect(() => {
    if (!open || text.length < 2 || !wanted) return
    let current = true
    const timer = window.setTimeout(() => {
      searchEntries(text, currentCampaign, wanted.split(",") as SearchSource[], PER_GROUP).then(
        (found) => current && setHits(found),
        () => current && setHits([])
      )
    }, DEBOUNCE_MS)
    return () => {
      current = false
      window.clearTimeout(timer)
    }
  }, [open, text, currentCampaign, wanted])

  // Nothing typed, or too little to search: nothing found.
  return open && text.length >= 2 && wanted ? hits : []
}
