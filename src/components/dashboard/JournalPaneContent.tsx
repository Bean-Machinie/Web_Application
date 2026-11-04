import type { JournalTreeState } from "@/hooks/use-journal-tree"
import type { Tab } from "@/lib/journal-workspace"
import { JournalEmpty } from "./JournalEmpty"
import { JournalPageTab } from "./JournalPageTab"
import { WorldEntryView } from "./WorldEntryView"

type Props = { tab: Tab | undefined; tree: JournalTreeState; canManage: boolean }

// What a tab shows, with the views that already exist: a page's editor, or an
// entry's page as it is in the World.
export function JournalPaneContent({ tab, tree, canManage }: Props) {
  if (!tab) return <JournalEmpty canManage={canManage} hasPages={(tree.nodes?.length ?? 0) > 0} />
  if (tab.kind === "page") return <JournalPageTab pageId={tab.id} tree={tree} canManage={canManage} />

  return (
    <div className="flex min-h-full flex-col gap-4 p-4 md:p-6">
      <WorldEntryView key={tab.id} entryId={tab.id} />
    </div>
  )
}
