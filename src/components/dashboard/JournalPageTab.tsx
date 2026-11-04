import { Skeleton } from "@/components/ui/skeleton"
import { JournalEmpty } from "./JournalEmpty"
import { JournalPageView } from "./JournalPageView"
import type { TabContentProps } from "./journal-tab-kinds"

// A page can only be opened if it is in the tree, which holds exactly the pages
// this person may read.
export function JournalPageTab({ id, tree, canManage }: TabContentProps) {
  const node = tree.nodes?.find((candidate) => candidate.id === id)

  if (!tree.nodes) return <Skeleton className="m-8 h-40" />
  if (!node) return <JournalEmpty canManage={canManage} hasPages={tree.nodes.length > 0} />

  return <JournalPageView key={node.id} node={node} tree={tree} canManage={canManage} />
}
