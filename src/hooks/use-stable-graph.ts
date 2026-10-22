import { useEffect, useState } from "react"
import type { WorldEntry } from "@/lib/world-entries"
import { buildGraph } from "@/lib/world-graph"
import type { Graph, GraphNode, RawLink } from "@/lib/world-graph"

const keyOf = (graph: Graph) =>
  [
    graph.nodes.map((node) => node.id).sort().join(","),
    graph.links.map((link) => `${link.source}>${link.target}${link.mention ? "!" : ""}`).sort().join(","),
  ].join("|")

// The graph of the entries, handed out as the very same object for as long as its
// entries and lines are the same. The list above rebuilds its entries on every
// render, and a new graph would make the layout start over; this way only a real
// change does, and even then the nodes that stay keep their places.
export function useStableGraph(entries: WorldEntry[], links: RawLink[], hideLoose: boolean): Graph {
  const [seen] = useState(() => new Map<string, GraphNode>())
  const [kept, setKept] = useState<{ key: string; graph: Graph } | null>(null)

  const fresh = buildGraph(entries, links, hideLoose, seen)
  const key = keyOf(fresh)
  const same = kept !== null && kept.key === key
  if (!same) setKept({ key, graph: fresh })
  const graph = same ? kept.graph : fresh

  useEffect(() => {
    for (const node of graph.nodes) seen.set(node.id, node)
  }, [graph, seen])

  return graph
}
