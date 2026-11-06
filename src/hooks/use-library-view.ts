import { useState } from "react"
import { SRD_PICK_SECTION, findSection } from "@/lib/library-sections"
import type { WorldEntry } from "@/lib/world-entries"
import { viewEntries } from "@/lib/world-list"

// The section and the search a library window is looking at, and the entries
// that match them. Shared by the library page and the dialog that adds from it, which also
// offers `srd`, the SRD creatures, as a section.
export function useLibraryView(entries: WorldEntry[] | null, srd: WorldEntry[] = []) {
  const [section, setSection] = useState("all")
  const [query, setQuery] = useState("")
  const inSection = findSection(section).matches
  const inSource = section === SRD_PICK_SECTION.id ? srd : entries && entries.filter(inSection)
  const shown =
    inSource &&
    viewEntries(inSource, {
      kind: null,
      query,
      visibility: "all",
      sort: null,
      searchText: null,
    })

  return { section, setSection, query, setQuery, shown }
}
