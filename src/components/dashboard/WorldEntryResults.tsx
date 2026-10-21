import type { EntrySelection } from "@/hooks/use-entry-selection"
import type { WorldViewMode } from "@/hooks/use-world-view-mode"
import type { WorldEntry } from "@/lib/world-entries"
import type { WorldEntryKind } from "@/lib/world-kinds"
import type { Sort } from "@/lib/world-list"
import { WorldEmptyState } from "./WorldEmptyState"
import { WorldEntryGraph } from "./WorldEntryGraph"
import { WorldEntryGrid } from "./WorldEntryGrid"
import { WorldEntryTable } from "./WorldEntryTable"
import type { WorldManage } from "./world-manage"

type Props = {
  entries: WorldEntry[]
  mode: WorldViewMode
  kind: WorldEntryKind | null
  // True when the search or filter is narrowing the list.
  filtered: boolean
  canManage: boolean
  manage: WorldManage | null
  selection: EntrySelection | null
  sort: Sort
  onSort: (sort: Sort) => void
}

export function WorldEntryResults({ entries, mode, kind, filtered, canManage, manage, selection, sort, onSort }: Props) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {entries.length === 0 ? (
        <WorldEmptyState kind={kind} filtered={filtered} canManage={canManage} />
      ) : mode === "graph" ? (
        <WorldEntryGraph entries={entries} />
      ) : mode === "grid" ? (
        <WorldEntryGrid entries={entries} manage={manage} selection={selection} />
      ) : (
        <WorldEntryTable
          entries={entries}
          manage={manage}
          selection={selection}
          sort={sort}
          onSort={onSort}
        />
      )}
    </div>
  )
}
