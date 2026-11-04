import { useOutletContext, useParams } from "react-router-dom"
import { Skeleton } from "@/components/ui/skeleton"
import { JournalEmpty } from "@/components/dashboard/JournalEmpty"
import { JournalPageView } from "@/components/dashboard/JournalPageView"
import type { JournalContext } from "@/components/dashboard/journal-context"

// A page can only be opened if it is in the tree, which holds exactly the pages
// this person may read.
export function JournalPage() {
  const { pageId = "" } = useParams()
  const { tree, canManage } = useOutletContext<JournalContext>()
  const node = tree.nodes?.find((candidate) => candidate.id === pageId)

  if (!tree.nodes) return <Skeleton className="m-8 h-40" />
  if (!node) return <JournalEmpty canManage={canManage} hasPages={tree.nodes.length > 0} />

  return <JournalPageView key={node.id} node={node} tree={tree} canManage={canManage} />
}
