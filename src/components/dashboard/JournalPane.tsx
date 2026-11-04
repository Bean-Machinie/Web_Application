import { useCallback } from "react"
import type { JournalWorkspaceState } from "@/hooks/use-journal-workspace"
import type { JournalTreeState } from "@/hooks/use-journal-tree"
import { MAX_PANES } from "@/lib/journal-workspace"
import type { Tab } from "@/lib/journal-workspace"
import { JournalPaneContent } from "./JournalPaneContent"
import { JournalPaneEdge } from "./JournalPaneEdge"
import { JournalTabStrip } from "./JournalTabStrip"
import { MentionOpenContext } from "./MentionOpenContext"
import type { TabLabel } from "./useJournalTabLabels"

type Props = {
  index: number
  space: JournalWorkspaceState
  tree: JournalTreeState
  canManage: boolean
  label: (tab: Tab) => TabLabel
  // A tab is being dragged, so the edge to drop it on shows.
  dragging: boolean
}

// One pane: its tabs on top, the tab showing below, scrolling on its own. Anything
// pressed in it puts the pane in focus. A mention clicked in it opens its entry in
// the other pane, or with Ctrl or Cmd in a new tab here; the pane in focus stays.
export function JournalPane({ index, space, tree, canManage, label, dragging }: Props) {
  const { workspace, open, focus, show, close, split } = space
  const pane = workspace.panes[index]
  const panes = workspace.panes.length

  const openMention = useCallback(
    (entryId: string, where: "other" | "tab") =>
      open(
        { kind: "entry", id: entryId },
        where === "tab" ? { kind: "newTab", pane: index } : { kind: "other", from: index },
        false
      ),
    [open, index]
  )

  return (
    <MentionOpenContext.Provider value={openMention}>
      <div className="relative flex h-full min-w-0 flex-col" onPointerDownCapture={() => focus(index)}>
        <JournalTabStrip
          index={index}
          pane={pane}
          marked={panes > 1 && workspace.focused === index}
          label={label}
          canSplit={panes < MAX_PANES}
          onShow={(tab) => show(index, tab)}
          onClose={(tab) => close(index, tab)}
          onSplit={split}
        />
        <div className="bg-background min-h-0 flex-1 overflow-y-auto">
          <JournalPaneContent tab={pane.tabs[pane.active]} tree={tree} canManage={canManage} />
        </div>
        {dragging && (panes < MAX_PANES || index < panes - 1) && <JournalPaneEdge index={index} />}
      </div>
    </MentionOpenContext.Provider>
  )
}
