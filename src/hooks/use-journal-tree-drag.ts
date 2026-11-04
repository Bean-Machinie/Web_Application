import { useMemo, useRef, useState } from "react"
import { KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core"
import type { DragEndEvent, DragMoveEvent } from "@dnd-kit/core"
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable"
import type { JournalNode } from "@/lib/journal"
import { projectDrop } from "@/lib/journal-drop"
import type { Drop } from "@/lib/journal-drop"
import { childrenByParent, descendantIds } from "@/lib/journal-tree"
import type { TreeRow } from "@/lib/journal-tree"

// A drag that began on a page's name ends in a click on it, which for a link would
// also go to its address, and the page would reload. Stopped before it gets there.
function guardNextClick() {
  const stop = (event: Event) => event.preventDefault()
  window.addEventListener("click", stop, true)
  return () => window.setTimeout(() => window.removeEventListener("click", stop, true), 50)
}

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
  const release = useRef<(() => void) | null>(null)

  const finish = () => {
    release.current?.()
    release.current = null
    setActiveId(null)
    setProjected(null)
  }

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
    finish()
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
    onDragStart: (event: { active: { id: string | number } }) => {
      release.current = guardNextClick()
      setActiveId(String(event.active.id))
    },
    onDragMove: (event: DragMoveEvent) => setProjected(project(event)),
    onDragEnd: end,
    onDragCancel: finish,
  }
}
