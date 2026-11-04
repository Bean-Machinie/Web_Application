import { useEffect } from "react"
import { useMatch } from "react-router-dom"
import { PanelLeftOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import { BreadcrumbContext } from "@/components/dashboard/BreadcrumbContext"
import { describeTab, tabExists } from "@/components/dashboard/journal-tab-kinds"
import { JournalTree } from "@/components/dashboard/JournalTree"
import { JournalWorkspace } from "@/components/dashboard/JournalWorkspace"
import { PlainBackground } from "@/components/dashboard/PlainBackground"
import { useCurrentCampaign } from "@/components/dashboard/useCurrentCampaign"
import { useJournalTabContext } from "@/components/dashboard/useJournalTabContext"
import { usePageTrail } from "@/components/dashboard/usePageTrail"
import { useJournalShortcuts } from "@/hooks/use-journal-shortcuts"
import { useJournalTree } from "@/hooks/use-journal-tree"
import { useJournalUrlSync } from "@/hooks/use-journal-url-sync"
import { useJournalWorkspace } from "@/hooks/use-journal-workspace"
import { useStoredValue } from "@/hooks/use-stored-value"
import { campaignPath } from "@/lib/campaign-paths"
import { activeTab } from "@/lib/journal-workspace"
import { interceptPalette } from "@/lib/palette-intercept"
import { cn } from "@/lib/utils"

const readOpen = (text: string | null) => text !== "false"

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
  const [treeOpen, setTreeOpen] = useStoredValue("journal-tree-open", readOpen)
  const { prune, open } = space

  useJournalUrlSync(current.id, pageId, space)
  useJournalShortcuts(space)

  // Always "Journal", then the tab in focus; never the path an entry has in the World.
  const focused = activeTab(space.workspace)
  usePageTrail([{ label: "Journal" }, ...(focused ? [{ label: describeTab(ctx, focused).title }] : [])])

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
    <div className="-m-4 flex h-[calc(100svh-var(--header-height))] min-w-0 flex-none flex-col md:-m-6 md:flex-row">
      <PlainBackground />
      {/* Narrows to a strip the way the sidebar does. The tree keeps its width and is
          clipped, so it does not rewrap as the panel moves. */}
      <aside
        className={cn(
          "bg-background relative shrink-0 overflow-hidden border-b transition-[width] duration-200 ease-linear motion-reduce:transition-none md:max-h-none md:border-r md:border-b-0",
          treeOpen ? "max-h-60 md:w-64" : "max-h-10 md:w-10"
        )}
      >
        <div
          inert={!treeOpen}
          className={cn("flex h-full w-full flex-col transition-opacity duration-200 md:w-64", !treeOpen && "opacity-0")}
        >
          <JournalTree
            tree={tree}
            space={space}
            campaignId={current.id}
            canManage={canManage}
            onCollapse={() => setTreeOpen(false)}
          />
        </div>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Show pages"
          inert={treeOpen}
          onClick={() => setTreeOpen(true)}
          className={cn("absolute top-1 left-1 transition-opacity duration-200", treeOpen && "opacity-0")}
        >
          <PanelLeftOpen />
        </Button>
      </aside>
      <div className="min-h-0 min-w-0 flex-1">
        <BreadcrumbContext.Provider value={OWN_TRAIL}>
          <JournalWorkspace space={space} tree={tree} ctx={ctx} canManage={canManage} />
        </BreadcrumbContext.Provider>
      </div>
    </div>
  )
}
