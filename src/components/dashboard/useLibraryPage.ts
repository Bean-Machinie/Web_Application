import { useEffect, useMemo, useRef, useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { useCreateEntry } from "@/hooks/use-create-entry"
import { useEntrySelection } from "@/hooks/use-entry-selection"
import { useLibraryScenes } from "@/hooks/use-library-scenes"
import { useWorldBulk } from "@/hooks/use-world-bulk"
import { useWorldCardSize } from "@/hooks/use-world-card-size"
import { useWorldEntries } from "@/hooks/use-world-entries"
import { useWorldEntryDelete } from "@/hooks/use-world-entry-delete"
import { useWorldSearchText } from "@/hooks/use-world-search-text"
import { useWorldViewMode } from "@/hooks/use-world-view-mode"
import { changedWithin } from "@/lib/library-recency"
import type { Recency } from "@/lib/library-recency"
import { findSection, hasGraph } from "@/lib/library-sections"
import type { WorldEntry } from "@/lib/world-entries"
import type { WorldEntryKind } from "@/lib/world-kinds"
import { viewEntries } from "@/lib/world-list"
import type { Sort } from "@/lib/world-list"
import { useAddToCampaign } from "./useAddToCampaign"
import { useWorldScope } from "./useWorldScope"
import { createWorldManage } from "./world-manage"

// Everything the library page keeps track of: the section (in the address, so the
// back button and links work), the search and filters, the entries they leave, what
// is picked, and the dialogs. The page itself only lays it out.
export function useLibraryPage() {
  const scope = useWorldScope()
  const { entries, error, reload, setRevealed, reorder } = useWorldEntries(scope)
  const [params, setParams] = useSearchParams()
  const section = findSection(params.get("section") ?? "all")
  const [query, setQuery] = useState("")
  const [recency, setRecency] = useState<Recency>("any")
  const [chosenMode, setMode] = useWorldViewMode()
  const [cardSize, setCardSize] = useWorldCardSize()
  const [sort, setSort] = useState<Sort>(null)
  const createEntry = useCreateEntry(scope)
  const [making, setMaking] = useState(false)
  const [renaming, setRenaming] = useState<WorldEntry | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const removal = useWorldEntryDelete(reload, setActionError)
  const addTo = useAddToCampaign()
  const navigate = useNavigate()
  const scenes = useLibraryScenes(entries)

  // The graph is only for world entries; elsewhere the cards are shown instead.
  const mode = chosenMode === "graph" && !hasGraph(section) ? "grid" : chosenMode
  const searchText = useWorldSearchText(scope, query.trim() !== "")
  const sortBy = mode === "list" ? sort : null
  const shown = useMemo(
    () =>
      entries &&
      viewEntries(changedWithin(entries.filter(section.matches), recency), {
        kind: null,
        query,
        visibility: "all",
        sort: sortBy,
        searchText,
      }),
    [entries, section, recency, query, sortBy, searchText]
  )

  const selection = useEntrySelection({
    visibleIds: shown?.map((entry) => entry.id) ?? [],
    allIds: entries?.map((entry) => entry.id) ?? [],
    viewKey: `${section.id}|${query}|${recency}`,
  })
  const bulk = useWorldBulk({ entries, selection, reload, setError: setActionError })
  const manage = createWorldManage({
    setRevealed,
    reorder,
    onRename: setRenaming,
    onDelete: removal.setDeleting,
    onAddToCampaign: (entry) => addTo.open([entry]),
    isBuilt: (entry) => scenes?.has(entry.id) ?? false,
    onOpenBuilder: (entry) => navigate(`${scope.basePath}/${entry.id}/build`, { state: { fromMap: true } }),
    setError: setActionError,
  })

  const make = (kind: WorldEntryKind) => (kind === "map" ? setMaking(true) : createEntry(kind))
  // The command palette's "New ..." actions arrive as ?create=<kind>.
  const wanted = scope.kinds.find((option) => option === params.get("create")) ?? null
  const asked = useRef(false)
  useEffect(() => {
    if (!wanted) asked.current = false
    // Once per link: a development double run must not make two.
    if (!wanted || asked.current) return
    asked.current = true
    make(wanted)
    setParams(
      (current) => {
        current.delete("create")
        return current
      },
      { replace: true }
    )
    // make only sets state.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wanted, setParams])

  return {
    entries, error, reload, section, mode, setMode, cardSize, setCardSize, sort, setSort,
    query, setQuery, recency, setRecency, shown, selection, bulk, manage, addTo, removal,
    making, setMaking, renaming, setRenaming, actionError, make,
    setSection: (id: string) => setParams(id === "all" ? {} : { section: id }, { replace: true }),
  }
}
