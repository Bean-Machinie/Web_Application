import type { WorldEntry } from "./world-entries"
import type { WorldEntryKind } from "./world-kinds"

export type VisibilityFilter = "all" | "hidden" | "revealed"

type View = {
  kind: WorldEntryKind | null
  query: string
  visibility: VisibilityFilter
}

// Most recently updated first.
export function viewEntries(entries: WorldEntry[], view: View) {
  const query = view.query.trim().toLowerCase()

  return entries
    .filter(
      (entry) =>
        (!view.kind || entry.kind === view.kind) &&
        (view.visibility === "all" ||
          entry.revealed === (view.visibility === "revealed")) &&
        entry.name.toLowerCase().includes(query)
    )
    .sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt))
}
