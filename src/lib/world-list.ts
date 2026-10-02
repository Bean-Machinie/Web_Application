import type { WorldEntry } from "./world-entries"
import { WORLD_KINDS } from "./world-kinds"
import type { WorldEntryKind } from "./world-kinds"
import { matchesQuery } from "./world-search"
import type { SearchText } from "./world-search"

export type VisibilityFilter = "all" | "hidden" | "revealed"

export type SortKey = "name" | "type" | "visibility"
// Null is the order the GM arranged by hand.
export type Sort = { by: SortKey; dir: "asc" | "desc" } | null

type View = {
  kind: WorldEntryKind | null
  query: string
  visibility: VisibilityFilter
  sort: Sort
  // Every entry's text, once loaded; the search then looks past the name.
  searchText: SearchText | null
}

// Clicking a column: ascending, then descending, then back to manual order.
export function nextSort(sort: Sort, by: SortKey): Sort {
  if (sort?.by !== by) return { by, dir: "asc" }
  return sort.dir === "asc" ? { by, dir: "desc" } : null
}

const COMPARE: Record<SortKey, (a: WorldEntry, b: WorldEntry) => number> = {
  name: (a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: "base" }),
  type: (a, b) => WORLD_KINDS[a.kind].label.localeCompare(WORLD_KINDS[b.kind].label),
  // Ascending puts hidden entries first.
  visibility: (a, b) => Number(a.revealed) - Number(b.revealed),
}

// In the order the GM arranged them, unless a column sort is on. Entries that
// tie keep their manual order.
export function viewEntries(entries: WorldEntry[], view: View) {
  const shown = entries
    .filter(
      (entry) =>
        (!view.kind || entry.kind === view.kind) &&
        (view.visibility === "all" ||
          entry.revealed === (view.visibility === "revealed")) &&
        matchesQuery(entry, view.query, view.searchText)
    )
    .sort((a, b) => a.sortOrder - b.sortOrder)

  const { sort } = view
  if (!sort) return shown
  const sign = sort.dir === "asc" ? 1 : -1
  return shown.sort((a, b) => sign * COMPARE[sort.by](a, b))
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
