import type { JournalNode } from "./journal"

// One row of the tree as drawn: the pages that are showing, in order.
export type TreeRow = { node: JournalNode; depth: number }

// A page whose parent is not in the list (a player is not sent hidden pages)
// stands at the top.
function parentKey(node: JournalNode, known: Set<string>) {
  return node.parentId && known.has(node.parentId) ? node.parentId : null
}

function byPosition(a: JournalNode, b: JournalNode) {
  return a.position - b.position || a.id.localeCompare(b.id)
}

export function childrenByParent(nodes: JournalNode[]) {
  const known = new Set(nodes.map((node) => node.id))
  const groups = new Map<string | null, JournalNode[]>()
  for (const node of [...nodes].sort(byPosition)) {
    const key = parentKey(node, known)
    groups.set(key, [...(groups.get(key) ?? []), node])
  }
  return groups
}

// Depth first, leaving out what is inside a collapsed page.
export function visibleRows(nodes: JournalNode[], collapsed: ReadonlySet<string>): TreeRow[] {
  const groups = childrenByParent(nodes)
  const rows: TreeRow[] = []
  const walk = (parent: string | null, depth: number) => {
    for (const node of groups.get(parent) ?? []) {
      rows.push({ node, depth })
      if (!collapsed.has(node.id)) walk(node.id, depth + 1)
    }
  }
  walk(null, 0)
  return rows
}

// Every page whose title has the text in it, and the pages above them, so each
// match is still seen where it sits.
export function filteredRows(nodes: JournalNode[], query: string): TreeRow[] {
  const needle = query.trim().toLowerCase()
  const byId = new Map(nodes.map((node) => [node.id, node]))
  const shown = new Set<string>()
  for (const node of nodes) {
    if (!(node.title || "untitled").toLowerCase().includes(needle)) continue
    for (let up: JournalNode | undefined = node; up && !shown.has(up.id); up = byId.get(up.parentId ?? "")) {
      shown.add(up.id)
    }
  }
  return visibleRows(nodes, new Set()).filter((row) => shown.has(row.node.id))
}

export function descendantIds(nodes: JournalNode[], id: string) {
  const groups = childrenByParent(nodes)
  const found = new Set<string>()
  const walk = (parent: string) => {
    for (const child of groups.get(parent) ?? []) {
      found.add(child.id)
      walk(child.id)
    }
  }
  walk(id)
  return found
}

// What move_journal_page does in the database, so the tree can follow at once.
export function applyMove(
  nodes: JournalNode[],
  id: string,
  parentId: string | null,
  position: number
) {
  const siblings = (childrenByParent(nodes).get(parentId) ?? []).filter((node) => node.id !== id)
  const moved = nodes.find((node) => node.id === id)
  if (!moved) return nodes
  siblings.splice(Math.min(Math.max(position, 0), siblings.length), 0, { ...moved, parentId })
  const places = new Map(siblings.map((node, index) => [node.id, index]))
  return nodes.map((node) =>
    places.has(node.id)
      ? { ...node, parentId: node.id === id ? parentId : node.parentId, position: places.get(node.id)! }
      : node
  )
}
