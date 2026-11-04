import { Skeleton } from "@/components/ui/skeleton"
import { JournalEmpty } from "@/components/dashboard/JournalEmpty"
import { JournalPageView } from "@/components/dashboard/JournalPageView"
import type { JournalTreeState } from "@/hooks/use-journal-tree"

type Props = { pageId: string; tree: JournalTreeState; canManage: boolean }

// A page can only be opened if it is in the tree, which holds exactly the pages
// this person may read.
export function JournalPageTab({ pageId, tree, canManage }: Props) {
  const node = tree.nodes?.find((candidate) => candidate.id === pageId)

  if (!tree.nodes) return <Skeleton className="m-8 h-40" />
  if (!node) return <JournalEmpty canManage={canManage} hasPages={tree.nodes.length > 0} />

  return <JournalPageView key={node.id} node={node} tree={tree} canManage={canManage} />
}
