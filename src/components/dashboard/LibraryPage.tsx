import { useMemo } from "react"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"
import { RAIL_PX, TREE_MAX_PX, TREE_MIN_PX, useJournalSide } from "@/hooks/use-journal-side"
import { RECENCY_TEXT } from "@/lib/library-recency"
import { cn } from "@/lib/utils"
import { AddToCampaignDialog } from "./AddToCampaignDialog"
import { AddToCampaignNotice } from "./AddToCampaignNotice"
import { CollectionFilterPill } from "./CollectionFilterPill"
import { CopyWithLinksDialog } from "./CopyWithLinksDialog"
import { LibraryContent } from "./LibraryContent"
import { LibraryDetail } from "./LibraryDetail"
import { LibraryTabsContext } from "./LibraryTabsContext"
import { LibrarySide } from "./LibrarySide"
import { NewMapDialog } from "./NewMapDialog"
import { useLibraryPage } from "./useLibraryPage"
import { useNewCharacter } from "./useNewCharacter"
import { WorldBulkBar } from "./WorldBulkBar"
import { WorldEntryDialogs } from "./WorldEntryDialogs"

// The library laid out like the journal: a tree of what is in it in a panel at the left, the
// cards or list of the open node in the middle, and, once something is clicked, its panel at the
// right. The tree is flush with the sides of the window as the journal's is; the detail panel is
// a journal pane, its tab and body; the cards are on the page's own background.
export function LibraryPage() {
  const page = useLibraryPage()
  const side = useJournalSide("library", false)
  const newCharacter = useNewCharacter()
  const { selection, addTo } = page
  const detail = page.tabs.tabs.length > 0
  const tabsApi = useMemo(() => ({ activeId: page.item, openNew: page.tabs.openNew }), [page.item, page.tabs.openNew])

  return (
    <LibraryTabsContext.Provider value={tabsApi}>
      <div className="-m-4 h-[calc(100svh-var(--header-height))] min-w-0 flex-none md:-m-6">
        <ResizablePanelGroup
          orientation="horizontal"
          onLayoutChanged={side.saveWidth}
          className={cn(side.easing && "[&>[data-panel]]:transition-[flex-grow] [&>[data-panel]]:duration-200 [&>[data-panel]]:ease-linear motion-reduce:[&>[data-panel]]:transition-none")}
        >
          <ResizablePanel
            id="library-tree"
            panelRef={side.panel}
            elementRef={side.element}
            collapsible
            collapsedSize={`${RAIL_PX}px`}
            minSize={`${TREE_MIN_PX}px`}
            maxSize={`${TREE_MAX_PX}px`}
            defaultSize={`${side.open ? side.width : RAIL_PX}px`}
            onResize={side.onResize}
            className="bg-background dark:bg-sidebar"
          >
            <LibrarySide active={page.nodeId} count={page.count} onSelect={page.setSection} open={side.open} onToggle={side.toggle} />
          </ResizablePanel>
          <ResizableHandle disabled={!side.open} />
          <ResizablePanel id="library-main" minSize="30%">
            <LibraryContent page={page} onNewCharacter={newCharacter.open} />
          </ResizablePanel>
          {detail && (
            <>
              <ResizableHandle />
              <ResizablePanel id="library-detail" defaultSize="40%" minSize="25%" maxSize="65%">
                <LibraryDetail page={page} />
              </ResizablePanel>
            </>
          )}
        </ResizablePanelGroup>
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
      <NewMapDialog open={page.making} onClose={() => page.setMaking(false)} />
      {newCharacter.dialog}
      <WorldEntryDialogs
        renaming={page.renaming}
        deleting={page.removal.deleting}
        busy={page.removal.busy}
        reload={page.reload}
        onDelete={page.removal.confirm}
        onCloseRename={() => page.setRenaming(null)}
        onCloseDelete={() => page.removal.setDeleting(null)}
      />
    </LibraryTabsContext.Provider>
  )
}
