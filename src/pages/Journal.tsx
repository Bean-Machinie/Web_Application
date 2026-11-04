import { useEffect, useMemo } from "react"
import { useMatch } from "react-router-dom"
import { PanelLeftOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import { JournalTree } from "@/components/dashboard/JournalTree"
import { JournalWorkspace } from "@/components/dashboard/JournalWorkspace"
import { PlainBackground } from "@/components/dashboard/PlainBackground"
import { useCurrentCampaign } from "@/components/dashboard/useCurrentCampaign"
import { useMentionScope } from "@/components/dashboard/useMentionScope"
import { useJournalShortcuts } from "@/hooks/use-journal-shortcuts"
import { useJournalTree } from "@/hooks/use-journal-tree"
import { useJournalUrlSync } from "@/hooks/use-journal-url-sync"
import { useJournalWorkspace } from "@/hooks/use-journal-workspace"
import { useMentionEntries } from "@/hooks/use-mention-entries"
import { useStoredValue } from "@/hooks/use-stored-value"
import { campaignPath } from "@/lib/campaign-paths"
import { interceptPalette } from "@/lib/palette-intercept"

const readOpen = (text: string | null) => text !== "false"

// The journal: the tree of pages on the left, and beside it the tabs of the pages
// and entries that are open, in one pane or two. It fills the window under the
// header; each pane scrolls on its own.
export function Journal() {
  const { current, can } = useCurrentCampaign()
  const canManage = can("manage_world")
  const tree = useJournalTree(current.id)
  const space = useJournalWorkspace(current.id)
  const pageId = useMatch(campaignPath(current.id, "journal/:pageId"))?.params.pageId
  const [treeOpen, setTreeOpen] = useStoredValue("journal-tree-open", readOpen)
  const entries = useMentionEntries(useMentionScope())
  const { prune, open } = space

  useJournalUrlSync(current.id, pageId, space)
  useJournalShortcuts(space)

  // Pages and entries that are gone, or not for this person, leave their tabs.
  const pageIds = useMemo(() => tree.nodes && new Set(tree.nodes.map((node) => node.id)), [tree.nodes])
  const entryIds = useMemo(() => entries && new Set(entries.map((entry) => entry.id)), [entries])
  useEffect(() => prune(pageIds, entryIds), [prune, pageIds, entryIds])

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
      <aside
        className={
          treeOpen
            ? "bg-background flex max-h-60 shrink-0 flex-col border-b md:max-h-none md:w-64 md:border-r md:border-b-0"
            : "bg-background flex shrink-0 flex-row border-b p-1 md:flex-col md:border-r md:border-b-0"
        }
      >
        {treeOpen ? (
          <JournalTree
            tree={tree}
            space={space}
            campaignId={current.id}
            canManage={canManage}
            onCollapse={() => setTreeOpen(false)}
          />
        ) : (
          <Button variant="ghost" size="icon-sm" aria-label="Show pages" onClick={() => setTreeOpen(true)}>
            <PanelLeftOpen />
          </Button>
        )}
      </aside>
      <div className="min-h-0 min-w-0 flex-1">
        <JournalWorkspace space={space} tree={tree} canManage={canManage} />
      </div>
    </div>
  )
}
