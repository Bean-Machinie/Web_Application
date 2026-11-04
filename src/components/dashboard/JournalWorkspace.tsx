import { useRef } from "react"
import { DndContext, DragOverlay } from "@dnd-kit/core"
import { useStoredValue } from "@/hooks/use-stored-value"
import { useJournalTabDrag } from "@/hooks/use-journal-tab-drag"
import type { JournalTreeState } from "@/hooks/use-journal-tree"
import type { JournalWorkspaceState } from "@/hooks/use-journal-workspace"
import { locate } from "@/lib/journal-workspace"
import type { Workspace } from "@/lib/journal-workspace"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"
import { JournalPane } from "./JournalPane"
import { JournalTabOverlay } from "./JournalTabOverlay"
import { describeTab, tabPreview } from "./journal-tab-kinds"
import type { TabContext } from "./journal-tab-kinds"

type Props = { space: JournalWorkspaceState; tree: JournalTreeState; ctx: TabContext; canManage: boolean }

// How wide the two panes were left, as percentages by panel id.
function readSplit(text: string | null): Record<string, number> | undefined {
  try {
    const stored = JSON.parse(text ?? "null") as Record<string, unknown> | null
    const left = stored?.["journal-left"]
    const right = stored?.["journal-right"]
    return typeof left === "number" && typeof right === "number" ? { "journal-left": left, "journal-right": right } : undefined
  } catch {
    return undefined
  }
}

// The panel of a tab, if it is the one its pane is showing.
function panelOf(workspace: Workspace, key: string | null) {
  const found = key ? locate(workspace, key) : null
  if (!found || workspace.panes[found.pane].active !== found.index) return null
  return document.querySelector<HTMLElement>(`[data-journal-panel="${found.pane}"]`)
}

const writeSplit =(split: Record<string, number> | undefined) => JSON.stringify(split ?? null)

// The panes of the journal: one, or two side by side with a divider to drag, whose
// place is remembered. A tab can be dragged between them, or to the right edge of
// the last to make a second.
export function JournalWorkspace({ space, tree, ctx, canManage }: Props) {
  const { workspace } = space
  const [split, saveSplit] = useStoredValue(`journal-split:${ctx.campaignId}`, readSplit, writeSplit)
  const opened = useRef(workspace.panes.length)
  const drag = useJournalTabDrag(workspace, space.move)
  const lifted = drag.dragged ? locate(workspace, drag.dragged)?.tab : undefined
  const label = lifted && describeTab(ctx, lifted)

  const pane = (index: number) => (
    <JournalPane
      index={index}
      space={space}
      tree={tree}
      ctx={ctx}
      canManage={canManage}
      carrying={drag.dragged}
    />
  )

  return (
    <DndContext
      sensors={drag.sensors}
      onDragStart={drag.onDragStart}
      onDragMove={drag.onDragMove}
      onDragEnd={drag.onDragEnd}
      onDragCancel={drag.onDragCancel}
    >
      {/* The first pane is always the same panel, so splitting does not reload it. */}
      <ResizablePanelGroup
        orientation="horizontal"
        className="h-full"
        defaultLayout={opened.current === 2 ? split : undefined}
        onLayoutChanged={(layout) => Object.keys(layout).length === 2 && saveSplit(layout)}
      >
        <ResizablePanel id="journal-left" minSize="25%">
          {pane(0)}
        </ResizablePanel>
        {workspace.panes.length > 1 && (
          <>
            <ResizableHandle />
            {/* A second pane that opens later takes the width it had last time. */}
            <ResizablePanel id="journal-right" minSize="25%" defaultSize={split ? `${split["journal-right"]}%` : undefined}>
              {pane(1)}
            </ResizablePanel>
          </>
        )}
      </ResizablePanelGroup>
      <DragOverlay dropAnimation={null}>
        {label && <JournalTabOverlay label={label} source={panelOf(workspace, drag.dragged)} preview={lifted && tabPreview(ctx, lifted)} />}
      </DragOverlay>
    </DndContext>
  )
}
