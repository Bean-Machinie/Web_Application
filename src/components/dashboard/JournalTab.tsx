import { useDraggable } from "@dnd-kit/core"
import { X } from "lucide-react"
import { tabKey } from "@/lib/journal-workspace"
import type { Tab } from "@/lib/journal-workspace"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { ActionContextMenu } from "./ActionContextMenu"
import type { MemberAction } from "./MemberMenu"
import type { TabLabel } from "./journal-tab-kinds"

type Props = {
  tab: Tab
  label: TabLabel
  active: boolean
  // In the pane in focus (or the only one): the bar on the tab showing is drawn only there.
  focused: boolean
  // The right-click menu.
  actions: MemberAction[]
  onShow: () => void
  onClose: () => void
}

// One tab: its kind's icon, its name and a close button; the one showing joins the panel. Drag it to reorder, or to the other pane; it stays put until let go. A
// middle click closes it.
export function JournalTab({ tab, label, active, focused, actions, onShow, onClose }: Props) {
  const { setNodeRef, attributes, listeners, isDragging } = useDraggable({ id: tabKey(tab) })
  const Icon = label.icon

  return (
    <ActionContextMenu actions={actions}>
      <div
        ref={setNodeRef}
        {...attributes}
        {...listeners}
        role="tab"
        data-journal-tab=""
        aria-selected={active}
        onClick={onShow}
        onMouseDown={(event) => event.button === 1 && event.preventDefault()}
        onAuxClick={(event) => {
          if (event.button !== 1) return
          event.preventDefault()
          onClose()
        }}
        className={cn(
          // Flat, as the tabs of the map maker are: no pill. The one showing has the
          // page's own colour, so it joins the panel under it, and a bar across its top
          // (only in the pane in focus).
          "group/tab relative flex h-full max-w-52 min-w-24 shrink-0 cursor-default items-center gap-1.5 border-r px-3 text-xs outline-none select-none",
          "after:bg-primary after:absolute after:inset-x-0 after:top-0 after:h-0.5 after:opacity-0 after:transition-opacity",
          active ? "bg-background text-foreground" : "text-muted-foreground hover:text-foreground",
          active && focused && "after:opacity-100",
          isDragging && "opacity-40"
        )}
      >
        <Icon className="size-3.5 shrink-0" />
        {label.loading ? (
          <Skeleton className="h-3 w-20 max-w-full" />
        ) : (
          <span className="min-w-0 flex-1 truncate">{label.title}</span>
        )}
        <button
          type="button"
          aria-label={label.loading ? "Close tab" : `Close ${label.title}`}
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
    </ActionContextMenu>
  )
}
