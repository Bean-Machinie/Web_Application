import { useState } from "react"
import type { WorldEntry } from "@/lib/world-entries"
import type { WorldEntryKind } from "@/lib/world-kinds"
import { viewEntries } from "@/lib/world-list"

// The kind and the search a library window is looking at, and the entries
// that match them. Shared by the window on the Library page and the one that
// adds from the library.
export function useLibraryView(entries: WorldEntry[] | null) {
  const [kind, setKind] = useState<WorldEntryKind | null>(null)
  const [query, setQuery] = useState("")
  const shown =
    entries && viewEntries(entries, { kind, query, visibility: "all", sort: null, searchText: null })

  return { kind, setKind, query, setQuery, shown }
}
