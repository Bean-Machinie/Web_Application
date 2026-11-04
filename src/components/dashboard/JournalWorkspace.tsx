import { DndContext, DragOverlay } from "@dnd-kit/core"
import { tabCollision, useJournalTabDrag } from "@/hooks/use-journal-tab-drag"
import type { JournalTreeState } from "@/hooks/use-journal-tree"
import type { JournalWorkspaceState } from "@/hooks/use-journal-workspace"
import { locate } from "@/lib/journal-workspace"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"
import { JournalPane } from "./JournalPane"
import { useJournalTabLabels } from "./useJournalTabLabels"

type Props = { space: JournalWorkspaceState; tree: JournalTreeState; canManage: boolean }

// The panes of the journal: one, or two side by side with a divider to drag. A
// tab can be dragged between them, or to the right edge of the last to make a
// second.
export function JournalWorkspace({ space, tree, canManage }: Props) {
  const { workspace } = space
  const label = useJournalTabLabels(tree.nodes)
  const drag = useJournalTabDrag(workspace, space.move)
  const lifted = drag.dragged ? locate(workspace, drag.dragged)?.tab : undefined
  const Icon = lifted && label(lifted).icon

  const pane = (index: number) => (
    <JournalPane
      index={index}
      space={space}
      tree={tree}
      canManage={canManage}
      label={label}
      dragging={drag.dragged !== null}
    />
  )

  return (
    <DndContext
      sensors={drag.sensors}
      collisionDetection={tabCollision}
      onDragStart={drag.onDragStart}
      onDragEnd={drag.onDragEnd}
      onDragCancel={drag.onDragCancel}
    >
      {/* The first pane is always the same panel, so splitting does not reload it. */}
      <ResizablePanelGroup orientation="horizontal" className="h-full">
        <ResizablePanel id="journal-left" minSize="25%">
          {pane(0)}
        </ResizablePanel>
        {workspace.panes.length > 1 && (
          <>
            <ResizableHandle withHandle />
            <ResizablePanel id="journal-right" minSize="25%">
              {pane(1)}
            </ResizablePanel>
          </>
        )}
      </ResizablePanelGroup>
      <DragOverlay dropAnimation={null}>
        {lifted && Icon && (
          <div className="bg-background flex h-9 max-w-52 items-center gap-1.5 rounded-md border px-2.5 text-sm shadow-md">
            <Icon className="size-3.5 shrink-0" />
            <span className="truncate">{label(lifted).title}</span>
          </div>
        )}
      </DragOverlay>
    </DndContext>
  )
}
