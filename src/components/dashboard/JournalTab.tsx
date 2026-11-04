import { useSortable } from "@dnd-kit/sortable"
import { X } from "lucide-react"
import { tabKey } from "@/lib/journal-workspace"
import type { Tab } from "@/lib/journal-workspace"
import { cn } from "@/lib/utils"
import type { TabLabel } from "./useJournalTabLabels"

type Props = { tab: Tab; label: TabLabel; active: boolean; onShow: () => void; onClose: () => void }

// One tab: its kind's icon, its name and a close button; the one showing is lifted
// to the page's colour. Drag it to reorder, or to the other pane. A middle click
// closes it.
export function JournalTab({ tab, label, active, onShow, onClose }: Props) {
  const { setNodeRef, attributes, listeners, transform, transition, isDragging } = useSortable({
    id: tabKey(tab),
  })
  const Icon = label.icon

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      role="tab"
      aria-selected={active}
      // Along the strip only.
      style={{ transform: transform ? `translate3d(${transform.x}px, 0, 0)` : undefined, transition }}
      onClick={onShow}
      onMouseDown={(event) => event.button === 1 && event.preventDefault()}
      onAuxClick={(event) => {
        if (event.button !== 1) return
        event.preventDefault()
        onClose()
      }}
      className={cn(
        "group/tab flex max-w-52 min-w-24 shrink-0 cursor-default items-center gap-1.5 border-r px-2.5 text-sm outline-none select-none",
        active ? "bg-background text-foreground" : "text-muted-foreground hover:bg-accent/50",
        isDragging && "opacity-40"
      )}
    >
      <Icon className="size-3.5 shrink-0" />
      <span className="min-w-0 flex-1 truncate">{label.title}</span>
      <button
        type="button"
        aria-label={`Close ${label.title}`}
        // Pressing it must not start a drag of the tab.
        onPointerDown={(event) => event.stopPropagation()}
        onClick={(event) => {
          event.stopPropagation()
          onClose()
        }}
        className={cn(
          "hover:bg-muted flex size-4 shrink-0 items-center justify-center rounded-sm",
          !active && "opacity-0 group-hover/tab:opacity-100 pointer-coarse:opacity-100"
        )}
      >
        <X className="size-3" />
      </button>
    </div>
  )
}
