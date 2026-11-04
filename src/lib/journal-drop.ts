import { arrayMove } from "@dnd-kit/sortable"
import type { TreeRow } from "./journal-tree"

export const INDENT_PX = 16

export type Drop = { parentId: string | null; position: number; depth: number }

// Where a dragged page would land, from the row it is over and how far sideways
// it has been pulled: one indent to the right nests it under the page above,
// to the left brings it out. `rows` is what is showing without the dragged
// page's own pages. `collapsed` and `childCounts` let a page dropped into a
// collapsed one go to the end of what is hidden there.
export function projectDrop(
  rows: TreeRow[],
  activeId: string,
  overId: string,
  offsetX: number,
  collapsed: ReadonlySet<string>,
  childCounts: ReadonlyMap<string | null, number>
): Drop | null {
  const from = rows.findIndex((row) => row.node.id === activeId)
  const to = rows.findIndex((row) => row.node.id === overId)
  if (from < 0 || to < 0) return null

  const moved = arrayMove(rows, from, to)
  const above = moved.slice(0, to)
  const previous = above[above.length - 1]
  const after = moved[to + 1]

  const wanted = rows[from].depth + Math.round(offsetX / INDENT_PX)
  const depth = Math.min(Math.max(wanted, after ? after.depth : 0), previous ? previous.depth + 1 : 0)

  const parentId =
    previous && depth > previous.depth
      ? previous.node.id
      : ([...above].reverse().find((row) => row.depth === depth)?.node.parentId ?? null)

  const shown = above.filter((row) => row.node.parentId === parentId).length
  const hidden = parentId !== null && collapsed.has(parentId)
  return { parentId, position: hidden ? (childCounts.get(parentId) ?? 0) : shown, depth }
}
