import type { LucideIcon } from "lucide-react"
import type { WorldEntry } from "./world-entries"
import type { WorldScope } from "./world-scope"

// Unfinished work from any tool, as the Create page lists it. A tool adds its own by
// writing a DraftSource and putting it in DRAFT_SOURCES (draft-sources.ts); the list and
// its rows need no other change.
export type Draft = {
  id: string
  // What kind of thing it is, as the small label says: "Map".
  label: string
  icon: LucideIcon
  name: string
  imageUrl: string | null
  updatedAt: string
  // Where "Open" goes: the tool, on this work.
  to: string
}

// What a source may look at. The library's entries are loaded once for the page.
export type DraftContext = { scope: WorldScope; entries: WorldEntry[] }

export type DraftSource = (context: DraftContext) => Promise<Draft[]>

export async function loadDrafts(sources: DraftSource[], context: DraftContext) {
  const lists = await Promise.all(sources.map((source) => source(context).catch(() => [] as Draft[])))
  return lists.flat().sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt))
}
