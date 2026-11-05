import { useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { ArrowUpRight, PanelRight, X, XCircle } from "lucide-react"
import { usePaneScroll } from "@/hooks/use-pane-scroll"
import type { JournalWorkspaceState } from "@/hooks/use-journal-workspace"
import type { JournalTreeState } from "@/hooks/use-journal-tree"
import { MAX_PANES, tabKey } from "@/lib/journal-workspace"
import { requestRuleScroll, RULES_TAB } from "@/lib/rules-focus"
import { cn } from "@/lib/utils"
import { JournalPaneContent } from "./JournalPaneContent"
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
  // The key of the tab being dragged, if any: the panel of that tab, if it is here, is
  // dimmed while its copy is carried.
  carrying: string | null
}

// One pane: its tabs on top, the tab showing below, scrolling on its own. Anything
// pressed in it puts the pane in focus. A mention clicked in it opens its entry in
// the other pane, or with Ctrl or Cmd in a new tab here; the pane in focus stays.
export function JournalPane({ index, space, tree, ctx, canManage, carrying }: Props) {
  const navigate = useNavigate()
  const { workspace, open, focus, show, close, closeOthers, move, split } = space
  const pane = workspace.panes[index]
  const panes = workspace.panes.length
  const showing = pane.tabs[pane.active]
  const fullPage = showing ? tabFullPage(ctx, showing) : null
  // The rules tab is not given back its old place: it opens at the term that was asked for.
  const scroll = usePaneScroll(showing && showing.kind !== "rule" ? `${ctx.campaignId}:${tabKey(showing)}` : null)

  const openMention = useCallback(
    (id: string, where: "other" | "tab", kind: "entry" | "rule" = "entry") => {
      // A term is a place in the one rules tab: that tab opens, and scrolls to it.
      if (kind === "rule") requestRuleScroll(id)
      open(
        kind === "rule" ? { kind, id: RULES_TAB } : { kind, id },
        where === "tab" ? { kind: "newTab", pane: index } : { kind: "other", from: index },
        false
      )
    },
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

  async function newPage() {
    const id = await tree.create(null)
    if (id) open({ kind: "page", id }, { kind: "newTab", pane: index })
  }

  return (
    <MentionOpenContext.Provider value={openMention}>
      <div data-journal-pane={index} className="relative flex h-full min-w-0 flex-col" onPointerDownCapture={() => focus(index)}>
        <JournalTabStrip
          pane={pane}
          focused={panes === 1 || workspace.focused === index}
          scrolled={scroll.scrolled}
          label={(tab) => describeTab(ctx, tab)}
          actionsFor={actionsFor}
          canSplit={panes < MAX_PANES}
          fullPage={fullPage}
          onShow={(tab) => show(index, tab)}
          onClose={(tab) => close(index, tab)}
          onSplit={split}
          onNew={canManage ? newPage : null}
          onOpenFullPage={() => fullPage && navigate(fullPage)}
        />
        <div className="bg-background relative min-h-0 flex-1">
          <div
            ref={scroll.box}
            data-journal-panel={index}
            onScroll={scroll.onScroll}
            className={cn(
              "h-full overflow-y-auto transition-opacity duration-150",
              carrying && showing && tabKey(showing) === carrying && "opacity-40"
            )}
          >
            <JournalPaneContent tab={showing} tree={tree} canManage={canManage} />
          </div>
          {/* The shadow that falls from under the tabs once the page has gone up, as under
              the recent rolls. */}
          <div
            aria-hidden
            className={cn(
              "pointer-events-none absolute inset-x-0 top-0 h-4 bg-gradient-to-b from-black/30 to-transparent transition-opacity duration-150",
              scroll.scrolled ? "opacity-100" : "opacity-0"
            )}
          />
        </div>
      </div>
    </MentionOpenContext.Provider>
  )
}
