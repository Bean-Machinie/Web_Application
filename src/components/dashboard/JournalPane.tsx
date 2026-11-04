import { useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { ArrowUpRight, PanelRight, X, XCircle } from "lucide-react"
import { usePaneScroll } from "@/hooks/use-pane-scroll"
import type { JournalWorkspaceState } from "@/hooks/use-journal-workspace"
import type { JournalTreeState } from "@/hooks/use-journal-tree"
import { MAX_PANES, tabKey } from "@/lib/journal-workspace"
import { JournalPaneContent } from "./JournalPaneContent"
import { JournalPaneEdge } from "./JournalPaneEdge"
import { JournalTabStrip } from "./JournalTabStrip"
import { MentionOpenContext } from "./MentionOpenContext"
import type { MemberAction } from "./MemberMenu"
import { describeTab, tabFullPage } from "./journal-tab-kinds"
import type { TabContext } from "./journal-tab-kinds"

type Props = {
  index: number
  space: JournalWorkspaceState
  tree: JournalTreeState
  ctx: TabContext
  canManage: boolean
  // A tab is being dragged, so the edge to drop it on shows.
  dragging: boolean
  // Room being made in this pane's tabs for one carried over from the other pane.
  slot: { index: number; width: number } | null
}

// One pane: its tabs on top, the tab showing below, scrolling on its own. Anything
// pressed in it puts the pane in focus. A mention clicked in it opens its entry in
// the other pane, or with Ctrl or Cmd in a new tab here; the pane in focus stays.
export function JournalPane({ index, space, tree, ctx, canManage, dragging, slot }: Props) {
  const navigate = useNavigate()
  const { workspace, open, focus, show, close, closeOthers, move, split } = space
  const pane = workspace.panes[index]
  const panes = workspace.panes.length
  const showing = pane.tabs[pane.active]
  const fullPage = showing ? tabFullPage(ctx, showing) : null
  const scroll = usePaneScroll(showing ? `${ctx.campaignId}:${tabKey(showing)}` : null)

  const openMention = useCallback(
    (entryId: string, where: "other" | "tab") =>
      open(
        { kind: "entry", id: entryId },
        where === "tab" ? { kind: "newTab", pane: index } : { kind: "other", from: index },
        false
      ),
    [open, index]
  )

  // The menu of a tab. A tab with no page of its own does not offer one, and the
  // only tab of the only pane has nowhere to go.
  function actionsFor(tab: number): MemberAction[] {
    const target = pane.tabs[tab]
    const href = tabFullPage(ctx, target)
    return [
      ...(href ? [{ label: "Open full page", icon: ArrowUpRight, onSelect: () => navigate(href) }] : []),
      {
        label: "Move to other pane",
        icon: PanelRight,
        disabled: panes === 1 && pane.tabs.length === 1,
        onSelect: () => move(tabKey(target), panes > 1 ? { pane: index === 0 ? 1 : 0 } : "newPane"),
      },
      { label: "Close", icon: X, onSelect: () => close(index, tab) },
      { label: "Close others", icon: XCircle, disabled: pane.tabs.length === 1, onSelect: () => closeOthers(index, tab) },
    ]
  }

  return (
    <MentionOpenContext.Provider value={openMention}>
      <div className="relative flex h-full min-w-0 flex-col" onPointerDownCapture={() => focus(index)}>
        <JournalTabStrip
          index={index}
          pane={pane}
          marked={panes > 1 && workspace.focused === index}
          label={(tab) => describeTab(ctx, tab)}
          actionsFor={actionsFor}
          canSplit={panes < MAX_PANES}
          slot={slot}
          fullPage={fullPage}
          onShow={(tab) => show(index, tab)}
          onClose={(tab) => close(index, tab)}
          onSplit={split}
          onOpenFullPage={() => fullPage && navigate(fullPage)}
        />
        <div ref={scroll.box} onScroll={scroll.onScroll} className="bg-background min-h-0 flex-1 overflow-y-auto">
          <JournalPaneContent tab={showing} tree={tree} canManage={canManage} />
        </div>
        {dragging && (panes < MAX_PANES || index < panes - 1) && <JournalPaneEdge index={index} />}
      </div>
    </MentionOpenContext.Provider>
  )
}
