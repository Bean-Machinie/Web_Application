import type { WorldViewMode } from "@/hooks/use-world-view-mode"
import type { WorldEntry } from "@/lib/world-entries"
import type { WorldEntryKind } from "@/lib/world-kinds"
import { WorldEmptyState } from "./WorldEmptyState"
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
}

export function WorldEntryResults({ entries, mode, kind, filtered, canManage, manage }: Props) {
  return (
    <div className="border-t">
      {entries.length === 0 ? (
        <WorldEmptyState kind={kind} filtered={filtered} canManage={canManage} />
      ) : mode === "grid" ? (
        <WorldEntryGrid entries={entries} manage={manage} />
      ) : (
        <WorldEntryTable entries={entries} manage={manage} />
      )}
    </div>
  )
}
