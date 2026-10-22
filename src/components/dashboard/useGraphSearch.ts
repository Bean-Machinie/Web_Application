import { useEffect, useMemo } from "react"
import type { Graph, GraphNode } from "@/lib/world-graph"
import type { WorldEntryKind } from "@/lib/world-kinds"

// Let the typing rest before the camera moves.
const TYPING_MS = 250

// Starts with the text first, then the more connected ones.
function rank(a: GraphNode, b: GraphNode, text: string) {
  const starts = Number(b.entry.name.toLowerCase().startsWith(text)) - Number(a.entry.name.toLowerCase().startsWith(text))
  return starts || b.degree - a.degree || a.entry.name.length - b.entry.name.length
}

// The entries whose name has the text in it, and the best of them. The camera eases
// to the best one when the text changes.
export function useGraphSearch(
  graph: Graph,
  hiddenKinds: ReadonlySet<WorldEntryKind>,
  query: string,
  reveal: (node: GraphNode) => void
) {
  const found = useMemo(() => {
    const text = query.trim().toLowerCase()
    if (!text) return { matches: null, best: null }
    const hits = graph.nodes.filter(
      (node) => !hiddenKinds.has(node.entry.kind) && node.entry.name.toLowerCase().includes(text)
    )
    hits.sort((a, b) => rank(a, b, text))
    return { matches: new Set(hits.map((node) => node.id)), best: hits[0] ?? null }
  }, [graph, hiddenKinds, query])

  const bestId = found.best?.id
  useEffect(() => {
    if (!bestId) return
    const timer = window.setTimeout(() => {
      const node = graph.byId.get(bestId)
      if (node) reveal(node)
    }, TYPING_MS)
    return () => window.clearTimeout(timer)
    // A rebuilt graph or camera must not move the view; only a new best does.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bestId])

  return found
}
