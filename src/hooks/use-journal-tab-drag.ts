import { useState } from "react"
import { closestCenter, PointerSensor, pointerWithin, useSensor, useSensors } from "@dnd-kit/core"
import type { CollisionDetection, DragEndEvent, DragMoveEvent } from "@dnd-kit/core"
import { locate, MAX_PANES } from "@/lib/journal-workspace"
import type { Place, Workspace } from "@/lib/journal-workspace"

// A pane's right edge wins while the pointer is on it; otherwise the nearest tab.
export const tabCollision: CollisionDetection = (args) => {
  const edge = pointerWithin(args).find((hit) => String(hit.id).startsWith("edge:"))
  return edge ? [edge] : closestCenter(args)
}

// Where in another pane a tab being carried would go, and how much room it takes:
// the pane's tabs make way for it there.
export type DropSlot = { pane: number; index: number; width: number }

const middle = (box: { left: number; width: number }) => box.left + box.width / 2

// Over a tab of another pane, before it or after it, by which side of that tab the
// carried one is on. Over the strip, last. Null over a pane's edge, or in the pane
// the tab came from, where the tabs already make way as it passes.
function slotFor(workspace: Workspace, event: DragMoveEvent | DragEndEvent): DropSlot | null {
  const over = event.over
  const carried = event.active.rect.current.translated
  const origin = locate(workspace, String(event.active.id))
  if (!over || !carried || !origin) return null

  const [kind, value] = String(over.id).split(":")
  const width = carried.width
  if (kind === "strip") {
    const pane = Number(value)
    return pane === origin.pane ? null : { pane, index: workspace.panes[pane].tabs.length, width }
  }
  const target = kind === "edge" ? null : locate(workspace, String(over.id))
  if (!target || target.pane === origin.pane) return null
  return { pane: target.pane, index: target.index + (middle(carried) < middle(over.rect) ? 0 : 1), width }
}

// Where a dropped tab goes: into the slot it was shown, onto another tab of its own
// pane (that tab's place), onto a strip (the end), or onto the right edge of a pane
// (a pane on its right, made if there is none).
function placeFor(workspace: Workspace, event: DragEndEvent): Place | null {
  const slot = slotFor(workspace, event)
  if (slot) return { pane: slot.pane, index: slot.index }

  const [kind, value] = String(event.over?.id ?? "").split(":")
  const panes = workspace.panes.length
  if (kind === "strip") return { pane: Number(value) }
  if (kind === "edge") {
    const pane = Number(value)
    if (pane < panes - 1) return { pane: pane + 1 }
    return panes < MAX_PANES ? "newPane" : null
  }
  const found = locate(workspace, String(event.over?.id ?? ""))
  return found ? { pane: found.pane, index: found.index } : null
}

// Dragging a tab by its title: to reorder, to the other pane, or to a new one.
export function useJournalTabDrag(workspace: Workspace, move: (key: string, place: Place) => void) {
  const [dragged, setDragged] = useState<string | null>(null)
  const [slot, setSlot] = useState<DropSlot | null>(null)
  // Not before a few pixels of movement, so that a click is still a click.
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }))

  function reset() {
    setDragged(null)
    setSlot(null)
  }

  function end(event: DragEndEvent) {
    const place = event.over ? placeFor(workspace, event) : null
    reset()
    if (place) move(String(event.active.id), place)
  }

  function onDragMove(event: DragMoveEvent) {
    const next = slotFor(workspace, event)
    setSlot((old) => (old?.pane === next?.pane && old?.index === next?.index && old?.width === next?.width ? old : next))
  }

  return {
    sensors,
    dragged,
    slot,
    onDragStart: (event: { active: { id: string | number } }) => setDragged(String(event.active.id)),
    onDragMove,
    onDragEnd: end,
    onDragCancel: reset,
  }
}
