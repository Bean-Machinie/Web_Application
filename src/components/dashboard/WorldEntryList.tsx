import { useEffect, useState } from "react"
import { useSearchParams } from "react-router-dom"
import { LoadingGate } from "@/components/LoadingGate"
import { useEntrySelection } from "@/hooks/use-entry-selection"
import { useSaveToLibrary } from "@/hooks/use-save-to-library"
import { useWorldBulk } from "@/hooks/use-world-bulk"
import { useWorldEntries } from "@/hooks/use-world-entries"
import { useWorldEntryDelete } from "@/hooks/use-world-entry-delete"
import { useIsMobile } from "@/hooks/use-mobile"
import { useWorldListMemory } from "@/hooks/use-world-list-memory"
import { useWorldSearchText } from "@/hooks/use-world-search-text"
import { useWorldViewMode } from "@/hooks/use-world-view-mode"
import type { WorldEntry } from "@/lib/world-entries"
import type { WorldEntryKind } from "@/lib/world-kinds"
import { viewEntries } from "@/lib/world-list"
import { rememberWorldKind } from "@/lib/world-tab"
import type { Sort, VisibilityFilter } from "@/lib/world-list"
import { useWorldScope } from "./useWorldScope"
import { WorldBulkBar } from "./WorldBulkBar"
import { WorldEntryDialogs } from "./WorldEntryDialogs"
import { WorldEntryNotices } from "./WorldEntryNotices"
import { WorldEntryResults } from "./WorldEntryResults"
import { WorldGridSkeleton } from "./WorldGridSkeleton"
import { WorldListSkeleton } from "./WorldListSkeleton"
import { WorldTabs } from "./WorldTabs"
import { WorldToolbar } from "./WorldToolbar"
import { createWorldManage } from "./world-manage"

// Render with key={scope.key} so switching scope starts from scratch.
export function WorldEntryList() {
  const scope = useWorldScope()
  const { canManage } = scope
  const { entries, error, reload, setRevealed, reorder } = useWorldEntries(scope)
  const library = useSaveToLibrary()
  const [params, setParams] = useSearchParams()
  const [chosenMode, setMode] = useWorldViewMode()
  // Phones only get the grid; the saved choice is kept for larger screens.
  const mode = useIsMobile() ? "grid" : chosenMode
  const [visibility, setVisibility] = useState<VisibilityFilter>("all")
  const [sort, setSort] = useState<Sort>(null)
  const [creating, setCreating] = useState<WorldEntryKind | null>(null)
  const [renaming, setRenaming] = useState<WorldEntry | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const removal = useWorldEntryDelete(reload, setActionError)

  // An unknown ?kind= falls back to All.
  const kind = scope.kinds.find((option) => option === params.get("kind")) ?? null
  // The command palette's "New ..." actions arrive as ?create=<kind>.
  const wanted = scope.kinds.find((option) => option === params.get("create")) ?? null
  useEffect(() => {
    if (!wanted || !canManage) return
    setCreating(wanted)
    setParams(
      (current) => {
        current.delete("create")
        return current
      },
      { replace: true }
    )
  }, [wanted, canManage, setParams])
  const { query, setQuery, wrapper } = useWorldListMemory(scope.key, kind, mode, entries !== null)
  useEffect(() => rememberWorldKind(scope.basePath, kind), [scope.basePath, kind])

  const searchText = useWorldSearchText(scope, query.trim() !== "")
  const shown = entries && viewEntries(entries, {
      kind,
      query,
      visibility,
      // Only the list has column headers to sort by.
      sort: mode === "list" ? sort : null,
      searchText,
    })

  const selection = useEntrySelection({
    visibleIds: shown?.map((entry) => entry.id) ?? [],
    allIds: entries?.map((entry) => entry.id) ?? [],
    viewKey: `${kind}|${query}|${visibility}`,
    enabled: canManage,
  })
  const bulk = useWorldBulk({ entries, selection, reload, setError: setActionError })

  const manage = canManage
    ? createWorldManage({
        setRevealed,
        reorder,
        onRename: setRenaming,
        onDelete: removal.setDeleting,
        onSaveToLibrary: scope.canSaveToLibrary ? library.save : undefined,
        setError: setActionError,
      })
    : null

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      <WorldTabs entries={entries} active={kind} />
      <div ref={wrapper} className="flex min-h-0 flex-1 flex-col gap-3">
        <WorldToolbar
          query={query}
          onQuery={setQuery}
          visibility={canManage && scope.hasVisibility ? visibility : null}
          onVisibility={setVisibility}
          onCreate={canManage ? setCreating : null}
          onLibraryAdded={canManage ? reload : null}
          mode={mode}
          onMode={setMode}
        />

        <WorldEntryNotices
          problem={error || actionError || library.error}
          savedName={library.savedName}
        />
        <LoadingGate
          loading={!entries && !error}
          className="bg-card flex min-h-0 flex-1 flex-col overflow-hidden rounded-t-lg border border-b-0"
          skeleton={
            mode === "grid" ? (
              <WorldGridSkeleton />
            ) : (
              <WorldListSkeleton canManage={canManage} />
            )
          }
        >
          {() =>
            shown && (
              <WorldEntryResults
                entries={shown}
                mode={mode}
                kind={kind}
                filtered={query.trim() !== "" || visibility !== "all"}
                canManage={canManage}
                manage={manage}
                selection={canManage ? selection : null}
                sort={sort}
                onSort={setSort}
              />
            )
          }
        </LoadingGate>
      </div>

      {canManage && <WorldBulkBar selection={selection} bulk={bulk} />}
      <WorldEntryDialogs
        creating={creating}
        renaming={renaming}
        deleting={removal.deleting}
        busy={removal.busy}
        reload={reload}
        onDelete={removal.confirm}
        onCloseCreate={() => setCreating(null)}
        onCloseRename={() => setRenaming(null)}
        onCloseDelete={() => removal.setDeleting(null)}
      />
    </div>
  )
}
