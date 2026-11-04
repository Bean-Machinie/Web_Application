import { useRef, useState } from "react"
import { PointerSensor, useSensor, useSensors } from "@dnd-kit/core"
import type { DragEndEvent, DragMoveEvent } from "@dnd-kit/core"
import { createDropMarker, hitAt } from "@/lib/journal-drop-target"
import type { DropTarget } from "@/lib/journal-drop-target"
import { locate } from "@/lib/journal-workspace"
import type { Place, Workspace } from "@/lib/journal-workspace"

// Where a tab dropped on a target goes. Among the tabs of its own pane, the index is
// a gap between tabs, and the tab itself leaving shifts those after it by one.
function placeFor(workspace: Workspace, key: string, target: DropTarget): Place | null {
  const from = locate(workspace, key)
  if (!from) return null
  if (target.kind === "edge") return "newPane"
  if (target.kind === "pane") return { pane: target.pane }
  const gap = target.pane === from.pane && target.index > from.index ? target.index - 1 : target.index
  return { pane: target.pane, index: gap }
}

// Dragging a tab by its title, to reorder it, to the other pane or to a new one. It
// is marked where it would land the same way a page carried out of the tree is, and
// the tabs stay where they are until it is let go.
export function useJournalTabDrag(workspace: Workspace, move: (key: string, place: Place) => void) {
  const [dragged, setDragged] = useState<string | null>(null)
  const marker = useRef<ReturnType<typeof createDropMarker> | null>(null)
  const origin = useRef({ x: 0, y: 0 })
  // Not before a few pixels of movement, so that a click is still a click.
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }))

  const hitFor = (event: DragMoveEvent | DragEndEvent) =>
    hitAt(origin.current.x + event.delta.x, origin.current.y + event.delta.y, workspace.panes.length)

  function reset() {
    marker.current?.remove()
    marker.current = null
    setDragged(null)
  }

  return {
    sensors,
    dragged,
    onDragStart: (event: { active: { id: string | number }; activatorEvent: Event }) => {
      const press = event.activatorEvent as PointerEvent
      origin.current = { x: press.clientX, y: press.clientY }
      marker.current = createDropMarker()
      setDragged(String(event.active.id))
    },
    onDragMove: (event: DragMoveEvent) => marker.current?.show(hitFor(event)),
    onDragEnd: (event: DragEndEvent) => {
      const hit = hitFor(event)
      reset()
      const place = hit && placeFor(workspace, String(event.active.id), hit.target)
      if (place) move(String(event.active.id), place)
    },
    onDragCancel: reset,
  }
}
