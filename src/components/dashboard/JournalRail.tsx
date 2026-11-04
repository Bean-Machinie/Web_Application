import { useMemo } from "react"
import { PanelLeftOpen } from "lucide-react"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import type { JournalNode } from "@/lib/journal"
import { visibleRows } from "@/lib/journal-tree"
import type { TreeRow } from "@/lib/journal-tree"
import { JournalRailButton } from "./JournalRailButton"
import { JournalRailItem } from "./JournalRailItem"
import type { OpenMode } from "./JournalTreeRow"

type Props = {
  nodes: JournalNode[]
  activeId: string | null
  canManage: boolean
  onOpen: (id: string, mode: OpenMode) => void
  onAdd: (id: string) => void
  onRename: (id: string) => void
  onDelete: (page: JournalNode) => void
  onExpand: () => void
}

// Each top-level page with the pages inside it, flat and in tree order.
function groupsOf(nodes: JournalNode[]) {
  const groups: { page: JournalNode; inside: TreeRow[] }[] = []
  for (const row of visibleRows(nodes, new Set())) {
    if (row.depth === 0) groups.push({ page: row.node, inside: [] })
    else groups.at(-1)?.inside.push(row)
  }
  return groups
}

// The tree when it is narrowed: a column of buttons, the one that widens it on top.
export function JournalRail({ nodes, activeId, canManage, onExpand, ...handlers }: Props) {
  const groups = useMemo(() => groupsOf(nodes), [nodes])

  return (
    <div className="flex h-full flex-col items-center gap-1 p-2">
      <Tooltip>
        <TooltipTrigger asChild>
          <JournalRailButton aria-label="Show pages" onClick={onExpand}>
            <PanelLeftOpen />
          </JournalRailButton>
        </TooltipTrigger>
        <TooltipContent side="right">Show pages</TooltipContent>
      </Tooltip>
      <div className="bg-border my-1 h-px w-6 shrink-0" />
      <div className="flex min-h-0 flex-1 flex-col items-center gap-1 overflow-y-auto">
        {groups.map(({ page, inside }) => (
          <JournalRailItem
            key={page.id}
            page={page}
            inside={inside}
            active={activeId === page.id || inside.some((row) => row.node.id === activeId)}
            activeId={activeId}
            canManage={canManage}
            {...handlers}
          />
        ))}
      </div>
    </div>
  )
}
