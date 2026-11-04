import { useState } from "react"
import { useSortable } from "@dnd-kit/sortable"
import { ChevronRight, Eye, GripVertical, Pencil, PanelRight, PanelTop, Plus, Trash2 } from "lucide-react"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { INDENT_PX } from "@/lib/journal-drop"
import type { TreeRow } from "@/lib/journal-tree"
import { cn } from "@/lib/utils"
import { ActionContextMenu } from "./ActionContextMenu"
import { JournalRowTitle, UNTITLED } from "./JournalRowTitle"
import { MemberMenu } from "./MemberMenu"
import type { MemberAction } from "./MemberMenu"

export type OpenMode = "current" | "tab" | "right"

type Props = {
  row: TreeRow
  to: string
  // The page showing in the pane in focus.
  active: boolean
  // Open in some tab, which is lightly marked.
  inTab: boolean
  open: boolean
  hasChildren: boolean
  canManage: boolean
  // Dragging is off while the list is filtered, since it is not the whole tree.
  canDrag: boolean
  // How far in the row is drawn; differs from its own depth while it is dragged.
  depth: number
  onOpen: (mode: OpenMode) => void
  onDragOut: (event: PointerEvent) => void
  onToggle: () => void
  onAdd: () => void
  onRename: (title: string) => void
  onDelete: () => void
}

// One page in the tree. A GM drags it by the grip, which shows when the pointer
// is over the row; the eye marks a page players can read. Right-click or the
// three dots for the menu.
export function JournalTreeRow(props: Props) {
  const { row, to, active, inTab, open, hasChildren, canManage, canDrag, depth } = props
  const { node } = row
  const [renaming, setRenaming] = useState(false)
  const { setNodeRef, setActivatorNodeRef, attributes, listeners, transform, transition, isDragging } =
    useSortable({ id: node.id, disabled: !canDrag })

  const actions: MemberAction[] = [
    { label: "Open in new tab", icon: PanelTop, onSelect: () => props.onOpen("tab") },
    { label: "Open to the right", icon: PanelRight, onSelect: () => props.onOpen("right") },
    ...(canManage
      ? [
          { label: "Add page inside", icon: Plus, onSelect: props.onAdd },
          { label: "Rename", icon: Pencil, onSelect: () => setRenaming(true) },
          { label: "Delete", icon: Trash2, destructive: true, onSelect: props.onDelete },
        ]
      : []),
  ]

  return (
    <li
      ref={setNodeRef}
      // Only up and down: the sideways pull shows as the row's indent.
      style={{ transform: transform ? `translate3d(0, ${transform.y}px, 0)` : undefined, transition }}
      className={cn("relative", isDragging && "z-10 opacity-70")}
    >
      <ActionContextMenu actions={actions}>
        <div
          style={{ paddingLeft: depth * INDENT_PX }}
          className={cn(
            "group/row hover:bg-accent flex items-center gap-0.5 rounded-md pr-1",
            active ? "bg-accent" : inTab && "bg-accent/40"
          )}
        >
          {canDrag && (
            <button
              type="button"
              ref={setActivatorNodeRef}
              aria-label={`Move ${node.title || UNTITLED}`}
              className="text-muted-foreground flex h-7 w-4 shrink-0 cursor-grab touch-none items-center justify-center opacity-0 outline-none group-hover/row:opacity-100 focus-visible:opacity-100 pointer-coarse:opacity-100"
              {...attributes}
              {...listeners}
            >
              <GripVertical className="size-3.5" />
            </button>
          )}
          <button
            type="button"
            aria-label={open ? "Collapse" : "Expand"}
            aria-expanded={hasChildren ? open : undefined}
            disabled={!hasChildren}
            onClick={props.onToggle}
            className={cn(
              "text-muted-foreground flex size-5 shrink-0 items-center justify-center rounded-sm outline-none",
              !hasChildren && "invisible"
            )}
          >
            <ChevronRight className={cn("size-3.5 transition-transform", open && "rotate-90")} />
          </button>
          <JournalRowTitle
            key={renaming ? "edit" : "view"}
            title={node.title}
            to={to}
            active={active}
            onOpen={props.onOpen}
            onDragOut={props.onDragOut}
            renaming={renaming}
            onRename={props.onRename}
            onDoneRenaming={() => setRenaming(false)}
          />
          {canManage && node.revealed && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Eye aria-label="Visible to players" className="text-muted-foreground size-3.5 shrink-0" />
              </TooltipTrigger>
              <TooltipContent>Visible to players</TooltipContent>
            </Tooltip>
          )}
          {canManage && (
            <div className="shrink-0 opacity-0 group-hover/row:opacity-100 has-[[data-state=open]]:opacity-100 pointer-coarse:opacity-100">
              <MemberMenu name={node.title || UNTITLED} actions={actions} />
            </div>
          )}
        </div>
      </ActionContextMenu>
    </li>
  )
}
