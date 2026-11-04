import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import type { JournalNode } from "@/lib/journal"
import type { TreeRow } from "@/lib/journal-tree"
import { cn } from "@/lib/utils"
import { ActionContextMenu } from "./ActionContextMenu"
import { pageActions } from "./journal-page-actions"
import { JournalRailButton } from "./JournalRailButton"
import { JournalRailFlyout } from "./JournalRailFlyout"
import { UNTITLED } from "./JournalRowTitle"
import type { OpenMode } from "./JournalTreeRow"

type Props = {
  page: JournalNode
  // Everything inside the page, in tree order.
  inside: TreeRow[]
  // The page is showing, or is inside the one that is.
  active: boolean
  activeId: string | null
  canManage: boolean
  onOpen: (id: string, mode: OpenMode) => void
  onAdd: (id: string) => void
  onRename: (id: string) => void
  onDelete: (page: JournalNode) => void
}

// One top-level page in the rail. Pages have no icon of their own, so a page is its
// first letter. One with pages inside opens a card at its side listing them; one
// without shows its title. Right-click for the same menu as in the tree.
export function JournalRailItem({ page, inside, active, activeId, canManage, onOpen, onAdd, onRename, onDelete }: Props) {
  const title = page.title || UNTITLED
  const actions = pageActions({
    canManage,
    onNewTab: () => onOpen(page.id, "tab"),
    onRight: () => onOpen(page.id, "right"),
    onAdd: () => onAdd(page.id),
    onRename: () => onRename(page.id),
    onDelete: () => onDelete(page),
  })

  const button = (
    <JournalRailButton aria-label={title} aria-current={active ? "page" : undefined} active={active} onClick={() => onOpen(page.id, "current")}>
      <span className={cn("uppercase", !active && "text-muted-foreground")}>{title.trim().charAt(0)}</span>
    </JournalRailButton>
  )

  const flyout = (
    <HoverCard openDelay={150} closeDelay={150}>
      <HoverCardTrigger asChild>{button}</HoverCardTrigger>
      <HoverCardContent side="right" align="start" sideOffset={8} className="w-64 gap-0.5 p-1.5">
        <JournalRailFlyout
          rows={[{ node: page, depth: 0 }, ...inside]}
          activeId={activeId}
          onOpen={(id) => onOpen(id, "current")}
        />
      </HoverCardContent>
    </HoverCard>
  )

  const labelled = (
    <Tooltip>
      <TooltipTrigger asChild>{button}</TooltipTrigger>
      <TooltipContent side="right">{title}</TooltipContent>
    </Tooltip>
  )

  // The wrapper takes the right-click, wherever it lands inside it.
  return (
    <ActionContextMenu actions={actions}>
      <div className="flex">{inside.length > 0 ? flyout : labelled}</div>
    </ActionContextMenu>
  )
}
