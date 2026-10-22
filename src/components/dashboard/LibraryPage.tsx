import type { CSSProperties } from "react"
import { FormAlert } from "@/components/auth/FormAlert"
import { LoadingGate } from "@/components/LoadingGate"
import { RECENCY_TEXT } from "@/lib/library-recency"
import { hasGraph } from "@/lib/library-sections"
import { cn } from "@/lib/utils"
import { AddToCampaignDialog } from "./AddToCampaignDialog"
import { AddToCampaignNotice } from "./AddToCampaignNotice"
import { CollectionFilterPill } from "./CollectionFilterPill"
import { CopyWithLinksDialog } from "./CopyWithLinksDialog"
import { LibraryAllView } from "./LibraryAllView"
import { LibrarySections } from "./LibrarySections"
import { LibraryToolbar } from "./LibraryToolbar"
import { NewLibraryMapDialog } from "./NewLibraryMapDialog"
import { useLibraryPage } from "./useLibraryPage"
import { WorldBulkBar } from "./WorldBulkBar"
import { WorldEntryDialogs } from "./WorldEntryDialogs"
import { WorldEntryResults } from "./WorldEntryResults"
import { WorldGridSkeleton } from "./WorldGridSkeleton"

// The library as a page, unlike a campaign's World: a column of sections beside it
// (All, Maps, World entries and its kinds), a title, a toolbar for the section that is
// open, and its entries. Maps are landscape tiles. "All" is the newest of each section.
export function LibraryPage() {
  const page = useLibraryPage()
  const { section, mode, selection, addTo } = page
  const searching = page.query.trim() !== "" || page.recency !== "any"
  const problem = page.error ?? page.actionError
  const grouped = section.id === "all" && mode === "grid" && !searching

  return (
    <div
      // A table header sticks under the top bar here, as it does under a toolbar.
      style={{ "--collection-top": "var(--header-height)" } as CSSProperties}
      className="flex flex-1 flex-col gap-4 md:flex-row md:gap-8"
    >
      <aside className="md:sticky md:top-[calc(var(--header-height)+1.5rem)] md:self-start">
        <LibrarySections entries={page.entries} active={section.id} onChange={page.setSection} />
      </aside>
      <div className="flex min-w-0 flex-1 flex-col gap-5">
        <div>
          <h2 className="text-3xl font-semibold tracking-tight">Your library</h2>
          <p className="text-muted-foreground mt-1 text-sm">What you own, ready to add to any campaign.</p>
        </div>
        <LibraryToolbar
          query={page.query}
          onQuery={page.setQuery}
          recency={page.recency}
          onRecency={page.setRecency}
          mode={mode}
          onMode={page.setMode}
          graph={hasGraph(section)}
          cardSize={page.cardSize}
          onCardSize={page.setCardSize}
          makes={section.makes}
          onNew={page.make}
        />
        {problem && <FormAlert tone="error">{problem}</FormAlert>}
        <LoadingGate
          loading={!page.entries && !page.error}
          className="flex min-h-0 flex-1 flex-col"
          skeleton={<WorldGridSkeleton />}
        >
          {() =>
            page.shown && (
              <div
                className={cn(
                  "flex flex-1 flex-col",
                  mode === "graph" &&
                    "h-[calc(100svh-var(--header-height)-14rem)] min-h-[28rem] overflow-hidden rounded-lg border"
                )}
              >
                {grouped && page.shown.length > 0 ? (
                  <LibraryAllView
                    entries={page.shown}
                    manage={page.manage}
                    selection={selection}
                    size={page.cardSize}
                    onSee={page.setSection}
                  />
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
                    cardSize={page.cardSize}
                    connections={null}
                    wide={section.id === "maps"}
                  />
                )}
              </div>
            )
          }
        </LoadingGate>
      </div>

      {page.recency !== "any" && (
        <CollectionFilterPill
          text={`Showing entries ${RECENCY_TEXT[page.recency]}`}
          raised={selection.active || addTo.notice !== null}
          onClear={() => page.setRecency("any")}
        />
      )}
      <WorldBulkBar selection={selection} bulk={page.bulk} onAddToCampaign={() => addTo.open(page.bulk.chosen)} />
      {addTo.notice && <AddToCampaignNotice notice={addTo.notice} />}
      <AddToCampaignDialog target={addTo} />
      <CopyWithLinksDialog {...addTo.copyDialog} />
      <NewLibraryMapDialog open={page.making} onClose={() => page.setMaking(false)} />
      <WorldEntryDialogs
        creating={page.creating}
        renaming={page.renaming}
        deleting={page.removal.deleting}
        busy={page.removal.busy}
        reload={page.reload}
        onDelete={page.removal.confirm}
        onCloseCreate={() => page.setCreating(null)}
        onCloseRename={() => page.setRenaming(null)}
        onCloseDelete={() => page.removal.setDeleting(null)}
      />
    </div>
  )
}
