import type { ReactNode } from "react"
import { FormAlert } from "@/components/auth/FormAlert"
import { LoadingGate } from "@/components/LoadingGate"
import type { WorldViewMode } from "@/hooks/use-world-view-mode"
import { LIBRARY_GROUPS, hasGraph } from "@/lib/library-sections"
import { nodeLabel } from "@/lib/library-tree"
import type { Recency } from "@/lib/library-recency"
import { cn } from "@/lib/utils"
import type { FilterGroup } from "./FilterPopover"
import { CollectionPage } from "./CollectionPage"
import { LibraryAllView } from "./LibraryAllView"
import { LibraryNodeMenu } from "./LibraryNodeMenu"
import { LibrarySearch } from "./LibrarySearch"
import { LibraryToolbar } from "./LibraryToolbar"
import type { LibraryPageState } from "./useLibraryPage"
import { WorldEntryResults } from "./WorldEntryResults"
import { WorldGridSkeleton } from "./WorldGridSkeleton"

type Props = {
  page: LibraryPageState
  // The panel of tabs at the right, once something is open.
  detail: ReactNode
}

const RECENCY: FilterGroup = {
  label: "Last changed",
  value: "any",
  options: [
    { value: "any", label: "Any time" },
    { value: "week", label: "7 days" },
    { value: "month", label: "30 days" },
  ],
  onChange: () => {},
}

// What the open node shows, for every node alike, on the collection page the world has: the menu of
// nodes and a toolbar (the search scoped to the node, the filter, size, list or grid, and New)
// above the cards or the list, which scroll, and at the right the panel of tabs.
export function LibraryContent({ page, detail }: Props) {
  const { section, nodeId, selection, mode } = page
  const searching = page.query.trim() !== "" || page.recency !== "any"
  const problem = page.error ?? page.actionError
  const grouped = section.id === "all" && mode === "grid" && !searching
  // A table starts right under the toolbar so its header is fixed there; cards have space above them.
  const flush = mode === "list"
  const modes: WorldViewMode[] = hasGraph(section) ? ["list", "grid", "graph"] : ["list", "grid"]
  const filters = [{ ...RECENCY, value: page.recency, onChange: (value: string) => page.setRecency(value as Recency) }]

  return (
    <CollectionPage
      flush={flush}
      detail={detail}
      tabs={<LibraryNodeMenu groups={LIBRARY_GROUPS} active={nodeId} count={page.count} onSelect={page.setSection} />}
      actions={
        <>
          <LibrarySearch query={page.query} onQuery={page.setQuery} label={`Search ${nodeLabel(nodeId).toLowerCase()}`} />
          <LibraryToolbar filters={filters} mode={mode} onMode={page.setMode} modes={modes} makes={section.makes} onNew={page.make} />
        </>
      }
    >
    {problem && <FormAlert tone="error">{problem}</FormAlert>}
    <LoadingGate loading={!page.entries && !page.error} className="flex min-h-0 flex-1 flex-col" skeleton={<WorldGridSkeleton />}>
      {() =>
        page.shown && (
          <div className={cn("flex flex-1 flex-col", mode === "graph" && "min-h-[28rem] overflow-hidden rounded-lg border")}>
            {grouped && page.shown.length > 0 ? (
              <LibraryAllView entries={page.shown} manage={page.manage} selection={selection} onSee={page.setSection} />
            ) : (
              <WorldEntryResults
                entries={page.shown}
                mode={mode}
                kind={null}
                filtered={searching}
                canManage
                manage={page.manage}
                selection={selection}
                sort={page.sort}
                onSort={page.setSort}
                connections={null}
                wide={section.id === "maps"}
                reachMargins
              />
            )}
          </div>
        )
      }
    </LoadingGate>
    </CollectionPage>
  )
}
