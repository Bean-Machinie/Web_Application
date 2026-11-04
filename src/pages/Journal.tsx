import { Outlet, useMatch } from "react-router-dom"
import { JournalTree } from "@/components/dashboard/JournalTree"
import { PlainBackground } from "@/components/dashboard/PlainBackground"
import { useCurrentCampaign } from "@/components/dashboard/useCurrentCampaign"
import type { JournalContext } from "@/components/dashboard/journal-context"
import { useJournalTree } from "@/hooks/use-journal-tree"
import { campaignPath } from "@/lib/campaign-paths"

// The journal: the tree of pages on the left, the open page on the right. It
// takes the whole width beside the sidebar, and the tree stays in view while the
// page scrolls.
export function Journal() {
  const { current, can } = useCurrentCampaign()
  const canManage = can("manage_world")
  const tree = useJournalTree(current.id)
  const openId = useMatch(campaignPath(current.id, "journal/:pageId"))?.params.pageId
  const context: JournalContext = { tree, canManage }

  return (
    <div className="-m-4 flex min-w-0 flex-1 flex-col md:-m-6 md:flex-row">
      <PlainBackground />
      <aside className="bg-background flex max-h-72 shrink-0 flex-col border-b md:sticky md:top-(--header-height) md:h-[calc(100svh-var(--header-height))] md:max-h-none md:w-64 md:border-r md:border-b-0">
        <JournalTree tree={tree} campaignId={current.id} canManage={canManage} openId={openId} />
      </aside>
      <div className="bg-background min-w-0 flex-1">
        <Outlet context={context} />
      </div>
    </div>
  )
}
