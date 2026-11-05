import { useEffect } from "react"
import { useMatch } from "react-router-dom"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"
import { BreadcrumbContext } from "@/components/dashboard/BreadcrumbContext"
import { describeTab, tabExists } from "@/components/dashboard/journal-tab-kinds"
import { JournalSide } from "@/components/dashboard/JournalSide"
import { JournalWorkspace } from "@/components/dashboard/JournalWorkspace"
import { PlainBackground } from "@/components/dashboard/PlainBackground"
import { useCurrentCampaign } from "@/components/dashboard/useCurrentCampaign"
import { useJournalTabContext } from "@/components/dashboard/useJournalTabContext"
import { usePageTrail } from "@/components/dashboard/usePageTrail"
import { RAIL_PX, TREE_MAX_PX, TREE_MIN_PX, useJournalSide } from "@/hooks/use-journal-side"
import { useJournalShortcuts } from "@/hooks/use-journal-shortcuts"
import { useJournalTree } from "@/hooks/use-journal-tree"
import { useJournalUrlSync } from "@/hooks/use-journal-url-sync"
import { useJournalWorkspace } from "@/hooks/use-journal-workspace"
import { campaignPath } from "@/lib/campaign-paths"
import { activeTab } from "@/lib/journal-workspace"
import { interceptPalette } from "@/lib/palette-intercept"
import { cn } from "@/lib/utils"

// What the views in the panes see in place of the header's trail: they may ask for
// their own (an entry's path in the World), and it is not shown. The journal's
// trail is the one above.
const OWN_TRAIL = { trail: null, setTrail: () => {} }

// The journal: the tree of pages on the left, and beside it the tabs of the pages
// and entries that are open, in one pane or two. It fills the window under the
// header; each pane scrolls on its own.
export function Journal() {
  const { current, can } = useCurrentCampaign()
  const canManage = can("manage_world")
  const tree = useJournalTree(current.id)
  const space = useJournalWorkspace(current.id)
  const ctx = useJournalTabContext(current.id, tree.nodes)
  const pageId = useMatch(campaignPath(current.id, "journal/:pageId"))?.params.pageId
  const side = useJournalSide()
  const { prune, open } = space

  useJournalUrlSync(current.id, pageId, space)
  useJournalShortcuts(space)

  // Always "Journal", then the tab in focus; never the path an entry has in the World.
  const focused = activeTab(space.workspace)
  // Until the name is known the trail is just "Journal", rather than a name that then changes.
  const focusedLabel = focused ? describeTab(ctx, focused) : null
  usePageTrail([{ label: "Journal" }, ...(focusedLabel && !focusedLabel.loading ? [{ label: focusedLabel.title }] : [])])

  // Pages and entries that are gone, or not for this person, leave their tabs.
  useEffect(() => prune((tab) => tabExists(ctx, tab) ?? true), [prune, ctx])

  // A result chosen in the search palette opens as a tab here, not as a page change.
  useEffect(
    () =>
      interceptPalette((path) => {
        const found = path.match(new RegExp(`^/app/c/${current.id}/(world|journal)/([^/?#]+)$`))
        if (!found) return false
        open({ kind: found[1] === "world" ? "entry" : "page", id: found[2] }, { kind: "newTab" })
        return true
      }),
    [current.id, open]
  )

  return (
    <div className="-m-4 h-[calc(100svh-var(--header-height))] min-w-0 flex-none md:-m-6">
      <PlainBackground />
      {/* The tree is a panel of its own width, 200 to 320 px, that narrows to a rail
          the way the sidebar does. The workspace is always the second panel, so
          narrowing or widening the tree does not reload it. */}
      {/* A panel's width is the flex-grow of the element around the one that takes a
          className, so the easing is set from the group, on both panels at once. */}
      <ResizablePanelGroup
        orientation="horizontal"
        onLayoutChanged={side.saveWidth}
        className={cn(side.easing && "[&>[data-panel]]:transition-[flex-grow] [&>[data-panel]]:duration-200 [&>[data-panel]]:ease-linear motion-reduce:[&>[data-panel]]:transition-none")}
      >
        <ResizablePanel
          id="journal-tree"
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
          <JournalSide
            tree={tree}
            space={space}
            campaignId={current.id}
            canManage={canManage}
            open={side.open}
            onToggle={side.toggle}
          />
        </ResizablePanel>
        <ResizableHandle disabled={!side.open} />
        <ResizablePanel id="journal-main" minSize="30%">
          <BreadcrumbContext.Provider value={OWN_TRAIL}>
            <JournalWorkspace space={space} tree={tree} ctx={ctx} canManage={canManage} />
          </BreadcrumbContext.Provider>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  )
}
