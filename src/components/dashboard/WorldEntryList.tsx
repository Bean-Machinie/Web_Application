import { useEffect, useMemo, useRef, useState } from "react"
import { useSearchParams } from "react-router-dom"
import { LoadingGate } from "@/components/LoadingGate"
import { useCreateEntry } from "@/hooks/use-create-entry"
import { useEntrySelection } from "@/hooks/use-entry-selection"
import { useSaveToLibrary } from "@/hooks/use-save-to-library"
import { useWorldBulk } from "@/hooks/use-world-bulk"
import { useWorldEntries } from "@/hooks/use-world-entries"
import { useWorldEntryDelete } from "@/hooks/use-world-entry-delete"
import { useConnectionCounts } from "@/hooks/use-connection-counts"
import { useIsMobile } from "@/hooks/use-mobile"
import { useWorldCardSize } from "@/hooks/use-world-card-size"
import { useWorldListMemory } from "@/hooks/use-world-list-memory"
import { useWorldSearchText } from "@/hooks/use-world-search-text"
import { useWorldViewMode } from "@/hooks/use-world-view-mode"
import type { WorldEntry } from "@/lib/world-entries"
import type { WorldEntryKind } from "@/lib/world-kinds"
import { viewEntries } from "@/lib/world-list"
import { rememberWorldKind } from "@/lib/world-tab"
import type { Sort, VisibilityFilter } from "@/lib/world-list"
import { CollectionPage } from "./CollectionPage"
import { CopyWithLinksDialog } from "./CopyWithLinksDialog"
import { NewMapDialog } from "./NewMapDialog"
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
  const createEntry = useCreateEntry(scope)
  const [makingMap, setMakingMap] = useState(false)
  const create = (kind: WorldEntryKind) => (kind === "map" ? setMakingMap(true) : createEntry(kind))
  const [renaming, setRenaming] = useState<WorldEntry | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const removal = useWorldEntryDelete(reload, setActionError)

  // An unknown ?kind= falls back to All.
  const kind = scope.kinds.find((option) => option === params.get("kind")) ?? null
  // The command palette's "New ..." actions arrive as ?create=<kind>.
  const wanted = scope.kinds.find((option) => option === params.get("create")) ?? null
  const asked = useRef(false)
  useEffect(() => {
    if (!wanted) asked.current = false
    // Once per link: a development double run must not make two.
    if (!wanted || !canManage || asked.current) return
    asked.current = true
    create(wanted)
    setParams(
      (current) => {
        current.delete("create")
        return current
      },
      { replace: true }
    )
    // create only starts the making.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wanted, canManage, setParams])
  const { query, setQuery } = useWorldListMemory(scope.key, kind, mode, entries !== null)
  useEffect(() => rememberWorldKind(scope.basePath, kind), [scope.basePath, kind])

  const searchText = useWorldSearchText(scope, query.trim() !== "")
  // Only the list has column headers to sort by.
  const sortBy = mode === "list" ? sort : null
  const shown = useMemo(
    () => entries && viewEntries(entries, { kind, query, visibility, sort: sortBy, searchText }),
    [entries, kind, query, visibility, sortBy, searchText]
  )

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

  const [cardSize, setCardSize] = useWorldCardSize()
  const connections = useConnectionCounts(entries, mode === "list")

  return (
    <>
      <CollectionPage
        bleed={mode === "graph"}
        tabs={<WorldTabs entries={entries} active={kind} />}
        actions={
          <WorldToolbar
            query={query}
            onQuery={setQuery}
            visibility={canManage && scope.hasVisibility ? visibility : null}
            onVisibility={setVisibility}
            onCreate={canManage ? create : null}
            onLibraryAdded={canManage ? reload : null}
            mode={mode}
            onMode={setMode}
            cardSize={cardSize}
            onCardSize={setCardSize}
          />
        }
      >
        <WorldEntryNotices
          problem={error || actionError || library.error}
          savedName={library.savedName}
          savedNote={library.note}
        />
        <CopyWithLinksDialog {...library.dialog} />
        <LoadingGate
          loading={!entries && !error}
          className="flex min-h-0 flex-1 flex-col"
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
                cardSize={cardSize}
                connections={connections}
              />
            )
          }
        </LoadingGate>
      </CollectionPage>

      {canManage && <WorldBulkBar selection={selection} bulk={bulk} />}
      <NewMapDialog open={makingMap} onClose={() => setMakingMap(false)} />
      <WorldEntryDialogs
        renaming={renaming}
        deleting={removal.deleting}
        busy={removal.busy}
        reload={reload}
        onDelete={removal.confirm}
        onCloseRename={() => setRenaming(null)}
        onCloseDelete={() => removal.setDeleting(null)}
      />
    </>
  )
}
