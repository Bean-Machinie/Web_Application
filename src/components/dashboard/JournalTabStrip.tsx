import { ArrowUpRight, Columns2, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { tabKey } from "@/lib/journal-workspace"
import type { Pane, Tab } from "@/lib/journal-workspace"
import { cn } from "@/lib/utils"
import { JournalTab } from "./JournalTab"
import { PanelHeader } from "./PanelHeader"
import type { MemberAction } from "./MemberMenu"
import type { TabLabel } from "./journal-tab-kinds"

type Props = {
  pane: Pane
  // The pane the keyboard and the address follow, or the only one.
  focused: boolean
  // The panel below has been scrolled: the line under the strip shows then, and not
  // before, so strip and panel are one piece at the top.
  scrolled: boolean
  label: (tab: Tab) => TabLabel
  actionsFor: (tab: number) => MemberAction[]
  canSplit: boolean
  // Where the tab showing has a page of its own; null if it has none.
  fullPage: string | null
  onShow: (tab: number) => void
  onClose: (tab: number) => void
  onSplit: () => void
  // Makes a new page at the top of the tree and opens it here; null for who cannot.
  onNew: (() => void) | null
  onOpenFullPage: () => void
}

// The header of one pane: its tabs, with a button after them for a new page, and at the end the buttons that open the tab
// showing as a page of its own (only when it has one) and that split the pane in
// two.
export function JournalTabStrip(props: Props) {
  const { pane, focused, scrolled, label, actionsFor, canSplit, fullPage } = props

  return (
    <PanelHeader
      data-journal-strip=""
      className={cn(
        // In the dark theme the strip is chrome, and the tab showing sits right over the panel.
        "bg-muted/50 items-stretch gap-0 px-0 transition-colors duration-150 dark:bg-sidebar dark:border-b-0",
        !scrolled && "border-b-transparent"
      )}
    >
      <div role="tablist" className="flex min-w-0 flex-1 items-stretch overflow-x-auto [scrollbar-width:none]">
        {pane.tabs.map((tab, i) => (
          <JournalTab
            key={tabKey(tab)}
            tab={tab}
            label={label(tab)}
            active={i === pane.active}
            focused={focused}
            actions={actionsFor(i)}
            onShow={() => props.onShow(i)}
            onClose={() => props.onClose(i)}
          />
        ))}
        {props.onNew && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon-sm" className="my-1 ml-1 shrink-0 self-center" aria-label="New page" onClick={props.onNew}>
                <Plus />
              </Button>
            </TooltipTrigger>
            <TooltipContent>New page</TooltipContent>
          </Tooltip>
        )}
      </div>
      {fullPage && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon-sm" className="m-1 shrink-0" aria-label="Open full page" onClick={props.onOpenFullPage}>
              <ArrowUpRight />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Open full page</TooltipContent>
        </Tooltip>
      )}
      {canSplit && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon-sm" className="my-1 mr-1 shrink-0" aria-label="Split right" onClick={props.onSplit}>
              <Columns2 />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Split right</TooltipContent>
        </Tooltip>
      )}
    </PanelHeader>
  )
}
