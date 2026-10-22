import { supabase } from "@/lib/supabase"
import type { WorldEntry } from "./world-entries"

// One row of world_entry_links: a pin or a mention from one entry to another.
export type RawLink = { type: "pin" | "mention"; sourceId: string; targetId: string }

type Row = { link_type: RawLink["type"]; source_id: string; target_id: string }

// The server sends this many rows at most, so a long list comes in pages.
const PAGE = 1000
const MAX_PAGES = 20

// Every link the person may see, in every campaign and in the library; the graph
// keeps the ones between the entries it shows. The view applies the read rules of
// both its tables, so a player gets only what they may see.
export async function fetchAllLinks(): Promise<RawLink[]> {
  const links: RawLink[] = []
  for (let page = 0; page < MAX_PAGES; page += 1) {
    const { data, error } = await supabase
      .from("world_entry_links")
      .select("link_type, source_id, target_id")
      .order("source_id")
      .order("target_id")
      .order("link_type")
      .range(page * PAGE, page * PAGE + PAGE - 1)
    if (error) throw error

    const rows = data as Row[]
    links.push(
      ...rows.map((row) => ({ type: row.link_type, sourceId: row.source_id, targetId: row.target_id }))
    )
    if (rows.length < PAGE) break
  }
  return links
}

// A node of the graph. The graph library adds the position to the same object.
export type GraphNode = { id: string; entry: WorldEntry; degree: number; x?: number; y?: number }

// Two entries joined by a mention, a pin, or both, in either direction, are one
// line: solid if there is a mention, dashed if there are only pins.
export type GraphLink = { source: string; target: string; mention: boolean }

export type Graph = {
  nodes: GraphNode[]
  links: GraphLink[]
  // The entries each entry is joined to.
  near: Map<string, Set<string>>
  byId: Map<string, GraphNode>
  // How many lines there are among all the entries shown, whether or not loose
  // entries are hidden.
  connections: number
}

// The graph of the entries shown. Only links between two of them count. A node
// already in `previous` is reused, so it keeps its place in the layout.
export function buildGraph(
  entries: WorldEntry[],
  links: RawLink[],
  hideLoose: boolean,
  previous?: ReadonlyMap<string, GraphNode>
): Graph {
  const shown = new Set(entries.map((entry) => entry.id))
  const merged = new Map<string, GraphLink>()

  for (const link of links) {
    if (link.sourceId === link.targetId) continue
    if (!shown.has(link.sourceId) || !shown.has(link.targetId)) continue
    const [a, b] = link.sourceId < link.targetId ? [link.sourceId, link.targetId] : [link.targetId, link.sourceId]
    const key = `${a}|${b}`
    const known = merged.get(key) ?? { source: a, target: b, mention: false }
    known.mention ||= link.type === "mention"
    merged.set(key, known)
  }

  const near = new Map<string, Set<string>>()
  for (const { source, target } of merged.values()) {
    near.set(source, (near.get(source) ?? new Set()).add(target))
    near.set(target, (near.get(target) ?? new Set()).add(source))
  }

  const nodes = entries
    .filter((entry) => !hideLoose || near.has(entry.id))
    .map((entry): GraphNode => {
      const degree = near.get(entry.id)?.size ?? 0
      const node = previous?.get(entry.id)
      if (!node) return { id: entry.id, entry, degree }
      node.entry = entry
      node.degree = degree
      return node
    })

  const byId = new Map(nodes.map((node) => [node.id, node]))
  return { nodes, links: [...merged.values()], near, byId, connections: merged.size }
}
