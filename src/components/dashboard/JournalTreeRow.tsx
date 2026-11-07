import { useSortable } from "@dnd-kit/sortable"
import { ChevronRight, Eye, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { INDENT_PX } from "@/lib/journal-drop"
import type { Guide, TreeRow } from "@/lib/journal-tree"
import { cn } from "@/lib/utils"
import { ActionContextMenu } from "./ActionContextMenu"
import { pageActions } from "./journal-page-actions"
import { IndentGuides } from "./IndentGuides"
import { JournalRowTitle, UNTITLED } from "./JournalRowTitle"
import { MemberMenu } from "./MemberMenu"

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
  renaming: boolean
  // What to draw in the indent for the row's own place in the tree.
  guides: Guide[]
  // The page was carried out of the tree: no row moves, whatever the drag still says.
  frozen: boolean
  // How far in the row is drawn; differs from its own depth while it is dragged.
  depth: number
  onOpen: (mode: OpenMode) => void
  onToggle: () => void
  onAdd: () => void
  onRenameStart: () => void
  onRenameEnd: () => void
  onRename: (title: string) => void
  onDelete: () => void
}

// One page in the tree. The whole row is the handle for dragging it, and a few pixels
// of movement start that, so a click is still a click. The eye marks a page players can
// read. Right-click or the three dots for the menu.
export function JournalTreeRow(props: Props) {
  const { row, to, active, inTab, open, hasChildren, canManage, canDrag, renaming, frozen, guides, depth } = props
  const { node } = row
  // While the name is being typed, pressing in the box must select text, not drag.
  const { setNodeRef, setActivatorNodeRef, attributes, listeners, transform, transition, isDragging } =
    useSortable({ id: node.id, disabled: !canDrag || renaming })

  const actions = pageActions({
    canManage,
    onNewTab: () => props.onOpen("tab"),
    onRight: () => props.onOpen("right"),
    onAdd: props.onAdd,
    onRename: props.onRenameStart,
    onDelete: props.onDelete,
  })

  return (
    <li
      ref={setNodeRef}
      // Only up and down: the sideways pull shows as the row's indent.
      style={{ transform: transform && !frozen ? `translate3d(0, ${transform.y}px, 0)` : undefined, transition }}
      className={cn("relative", isDragging && !frozen && "z-10 opacity-70")}
    >
      <ActionContextMenu actions={actions}>
        <div
          ref={setActivatorNodeRef}
          {...attributes}
          {...listeners}
          style={{ paddingLeft: depth * INDENT_PX }}
          className="relative flex outline-none"
        >
          <IndentGuides guides={Array.from({ length: depth }, (_, level) => guides[level] ?? "none")} reach={hasChildren ? 0 : 14} />
          <div
            className={cn(
              // --row-bg is the row's colour as an opaque one, for the buttons that cover the end
              // of the name when they show: the panel's own colour, then the row's tint over it.
              "group/row hover:bg-sidebar-accent/50 relative flex h-7 min-w-0 flex-1 items-center gap-0.5 rounded-md pr-1",
              "[--row-base:var(--background)] dark:[--row-base:var(--sidebar)] [--row-bg:var(--row-base)] hover:[--row-bg:color-mix(in_oklab,var(--sidebar-accent)_50%,var(--row-base))]",
              active
                ? "bg-sidebar-accent text-sidebar-accent-foreground hover:bg-sidebar-accent [--row-bg:var(--sidebar-accent)] hover:[--row-bg:var(--sidebar-accent)]"
                : inTab && "bg-sidebar-accent/30 [--row-bg:color-mix(in_oklab,var(--sidebar-accent)_30%,var(--row-base))]"
            )}
          >
            <button
              type="button"
              aria-label={open ? "Collapse" : "Expand"}
              aria-expanded={hasChildren ? open : undefined}
              disabled={!hasChildren}
              onClick={props.onToggle}
              className={cn(
                "text-muted-foreground flex size-4 shrink-0 items-center justify-center rounded-md outline-none",
                !hasChildren && "invisible"
              )}
            >
              <ChevronRight className={cn("size-3.5 transition-transform duration-150 ease-in-out", open && "rotate-90")} />
            </button>
            <JournalRowTitle
              key={renaming ? "edit" : "view"}
              title={node.title}
              to={to}
              active={active}
              nested={depth > 0}
              onOpen={props.onOpen}
              renaming={renaming}
              onRename={props.onRename}
              onDoneRenaming={props.onRenameEnd}
            />
            {canManage && node.revealed && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Eye aria-label="Visible to players" className="text-muted-foreground size-3.5 shrink-0 opacity-60" />
                </TooltipTrigger>
                <TooltipContent>Visible to players</TooltipContent>
              </Tooltip>
            )}
            {canManage && (
              // Laid over the end of the name, not beside it, so the name has the whole row; the
              // row's colour behind them hides what is under, fading in from the left.
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center rounded-r-md bg-gradient-to-l from-(--row-bg) from-75% to-transparent pr-1 pl-5 opacity-0 group-hover/row:pointer-events-auto group-hover/row:opacity-100 has-[[data-state=open]]:pointer-events-auto has-[[data-state=open]]:opacity-100 pointer-coarse:pointer-events-auto pointer-coarse:opacity-100">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon-xs" aria-label="Add page inside" onClick={props.onAdd}>
                      <Plus />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Add page inside</TooltipContent>
                </Tooltip>
                <MemberMenu name={node.title || UNTITLED} actions={actions} />
              </div>
            )}
          </div>
        </div>
      </ActionContextMenu>
    </li>
  )
}
