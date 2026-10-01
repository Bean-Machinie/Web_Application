import type { WorldEntry } from "./world-entries"
import type { WorldEntryKind } from "./world-kinds"

export type VisibilityFilter = "all" | "hidden" | "revealed"

type View = {
  kind: WorldEntryKind | null
  query: string
  visibility: VisibilityFilter
}

// In the order the GM arranged them.
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
    .sort((a, b) => a.sortOrder - b.sortOrder)
}

// Puts the visible entries, now in a new order, back into the slots they
// held, so entries a filter hides keep their place.
export function reorderEntries(entries: WorldEntry[], visibleIds: string[]) {
  const visible = new Set(visibleIds)
  const byId = new Map(entries.map((entry) => [entry.id, entry]))
  let next = 0

  return entries.map((entry, position) => {
    const placed = visible.has(entry.id) ? byId.get(visibleIds[next++])! : entry
    return { ...placed, sortOrder: position }
  })
}
