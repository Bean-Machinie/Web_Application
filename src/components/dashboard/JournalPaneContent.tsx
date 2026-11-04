import type { JournalTreeState } from "@/hooks/use-journal-tree"
import type { Tab } from "@/lib/journal-workspace"
import { JournalEmpty } from "./JournalEmpty"
import { TAB_KINDS } from "./journal-tab-kinds"

type Props = { tab: Tab | undefined; tree: JournalTreeState; canManage: boolean }

// What a tab shows: whatever its kind registered, with the views that already exist.
export function JournalPaneContent({ tab, tree, canManage }: Props) {
  if (!tab) return <JournalEmpty canManage={canManage} hasPages={(tree.nodes?.length ?? 0) > 0} />

  const Content = TAB_KINDS[tab.kind]?.Content
  return Content ? <Content id={tab.id} tree={tree} canManage={canManage} /> : null
}
