import { useMemo, useState } from "react"
import { KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core"
import type { DragEndEvent, DragMoveEvent } from "@dnd-kit/core"
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable"
import type { JournalNode } from "@/lib/journal"
import { projectDrop } from "@/lib/journal-drop"
import type { Drop } from "@/lib/journal-drop"
import { childrenByParent, descendantIds } from "@/lib/journal-tree"
import type { TreeRow } from "@/lib/journal-tree"

// Dragging pages in the tree. While one is dragged, the pages inside it travel
// with it, so they are left out of the rows, and `projected` says where it would
// land (its parent, its place and how far in it sits).
export function useJournalTreeDrag(
  nodes: JournalNode[],
  rows: TreeRow[],
  collapsed: ReadonlySet<string>,
  move: (id: string, parentId: string | null, position: number) => void
) {
  const [activeId, setActiveId] = useState<string | null>(null)
  const [projected, setProjected] = useState<Drop | null>(null)

  // Not before a few pixels of movement, so that a click is still a click.
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const shown = useMemo(() => {
    if (!activeId) return rows
    const inside = descendantIds(nodes, activeId)
    return rows.filter((row) => !inside.has(row.node.id))
  }, [nodes, rows, activeId])

  const counts = useMemo(
    () => new Map([...childrenByParent(nodes)].map(([parent, children]) => [parent, children.length])),
    [nodes]
  )

  const project = (event: DragMoveEvent | DragEndEvent) =>
    event.over
      ? projectDrop(shown, String(event.active.id), String(event.over.id), event.delta.x, collapsed, counts)
      : null

  function end(event: DragEndEvent) {
    const drop = project(event)
    const id = String(event.active.id)
    setActiveId(null)
    setProjected(null)
    const node = nodes.find((candidate) => candidate.id === id)
    if (!drop || !node) return

    const index = childrenByParent(nodes).get(node.parentId)?.findIndex((child) => child.id === id)
    if (drop.parentId !== node.parentId || drop.position !== index) move(id, drop.parentId, drop.position)
  }

  return {
    sensors,
    shown,
    activeId,
    projected,
    onDragStart: (event: { active: { id: string | number } }) => setActiveId(String(event.active.id)),
    onDragMove: (event: DragMoveEvent) => setProjected(project(event)),
    onDragEnd: end,
    onDragCancel: () => {
      setActiveId(null)
      setProjected(null)
    },
  }
}
