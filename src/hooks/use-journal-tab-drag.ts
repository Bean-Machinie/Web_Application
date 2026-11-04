import { useState } from "react"
import { closestCenter, PointerSensor, pointerWithin, useSensor, useSensors } from "@dnd-kit/core"
import type { CollisionDetection, DragEndEvent, Modifier } from "@dnd-kit/core"
import { locate, MAX_PANES } from "@/lib/journal-workspace"
import type { Place, Workspace } from "@/lib/journal-workspace"

// Tabs slide along the strip and never up or down. Where one lands is decided by
// the pointer and the nearest tab, which this does not move.
export const restrictToHorizontalAxis: Modifier = ({ transform }) => ({ ...transform, y: 0 })

// A pane's right edge wins while the pointer is on it; otherwise the nearest tab.
export const tabCollision: CollisionDetection = (args) => {
  const edge = pointerWithin(args).find((hit) => String(hit.id).startsWith("edge:"))
  return edge ? [edge] : closestCenter(args)
}

// Where a dropped tab goes: onto another tab (its place), onto a strip (the end),
// or onto the right edge of a pane (a pane on its right, made if there is none).
function placeFor(workspace: Workspace, over: string): Place | null {
  const [kind, value] = over.split(":")
  const panes = workspace.panes.length
  if (kind === "strip") return { pane: Number(value) }
  if (kind === "edge") {
    const pane = Number(value)
    if (pane < panes - 1) return { pane: pane + 1 }
    return panes < MAX_PANES ? "newPane" : null
  }
  const found = locate(workspace, over)
  return found ? { pane: found.pane, index: found.index } : null
}

// Dragging a tab by its title: to reorder, to the other pane, or to a new one.
export function useJournalTabDrag(workspace: Workspace, move: (key: string, place: Place) => void) {
  const [dragged, setDragged] = useState<string | null>(null)
  // Not before a few pixels of movement, so that a click is still a click.
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }))

  function end(event: DragEndEvent) {
    setDragged(null)
    if (!event.over) return
    const place = placeFor(workspace, String(event.over.id))
    if (place) move(String(event.active.id), place)
  }

  return {
    sensors,
    dragged,
    onDragStart: (event: { active: { id: string | number } }) => setDragged(String(event.active.id)),
    onDragEnd: end,
    onDragCancel: () => setDragged(null),
  }
}
