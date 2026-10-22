import { useState } from "react"
import { findSection } from "@/lib/library-sections"
import type { WorldEntry } from "@/lib/world-entries"
import { viewEntries } from "@/lib/world-list"

// The section and the search a library window is looking at, and the entries
// that match them. Shared by the library page and the dialog that adds from it.
export function useLibraryView(entries: WorldEntry[] | null) {
  const [section, setSection] = useState("all")
  const [query, setQuery] = useState("")
  const inSection = findSection(section).matches
  const shown =
    entries &&
    viewEntries(entries.filter(inSection), {
      kind: null,
      query,
      visibility: "all",
      sort: null,
      searchText: null,
    })

  return { section, setSection, query, setQuery, shown }
}
