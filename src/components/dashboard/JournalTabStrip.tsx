import { useDroppable } from "@dnd-kit/core"
import { horizontalListSortingStrategy, SortableContext } from "@dnd-kit/sortable"
import { Columns2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { tabKey } from "@/lib/journal-workspace"
import type { Pane, Tab } from "@/lib/journal-workspace"
import { cn } from "@/lib/utils"
import { JournalTab } from "./JournalTab"
import type { TabLabel } from "./useJournalTabLabels"

type Props = {
  index: number
  pane: Pane
  // The pane the keyboard and the address follow, drawn only when there are two.
  marked: boolean
  label: (tab: Tab) => TabLabel
  canSplit: boolean
  onShow: (tab: number) => void
  onClose: (tab: number) => void
  onSplit: () => void
}

// The tabs of one pane. Dropping a tab on the strip puts it last; the button at
// the end splits the pane in two.
export function JournalTabStrip({ index, pane, marked, label, canSplit, onShow, onClose, onSplit }: Props) {
  const { setNodeRef } = useDroppable({ id: `strip:${index}` })

  return (
    <div className={cn("bg-muted/40 flex h-9 shrink-0 items-stretch border-t-2 border-b", marked ? "border-t-primary" : "border-t-transparent")}>
      <SortableContext items={pane.tabs.map(tabKey)} strategy={horizontalListSortingStrategy}>
        <div ref={setNodeRef} role="tablist" className="flex min-w-0 flex-1 items-stretch overflow-x-auto [scrollbar-width:none]">
          {pane.tabs.map((tab, i) => (
            <JournalTab
              key={tabKey(tab)}
              tab={tab}
              label={label(tab)}
              active={i === pane.active}
              onShow={() => onShow(i)}
              onClose={() => onClose(i)}
            />
          ))}
        </div>
      </SortableContext>
      {canSplit && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon-sm" className="m-1 shrink-0" aria-label="Split right" onClick={onSplit}>
              <Columns2 />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Split right</TooltipContent>
        </Tooltip>
      )}
    </div>
  )
}
