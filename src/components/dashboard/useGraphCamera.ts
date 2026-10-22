import { useMemo } from "react"
import type { RefObject } from "react"
import type { GraphNode } from "@/lib/world-graph"
import type { GraphMethods } from "./graph-types"

const EASE_MS = 500
// Close enough to read a name, never closer than it was.
const REVEAL_ZOOM = 2.5

// The camera of the graph: every move eases, unless motion is reduced.
export function useGraphCamera(graphRef: RefObject<GraphMethods | undefined>, reduced: boolean) {
  return useMemo(() => {
    const ms = reduced ? 0 : EASE_MS

    function reveal(node: GraphNode) {
      const instance = graphRef.current
      if (!instance || node.x == null || node.y == null) return
      instance.centerAt(node.x, node.y, ms)
      instance.zoom(Math.max(instance.zoom(), REVEAL_ZOOM), ms)
    }

    return {
      fit: () => graphRef.current?.zoomToFit(ms, 48),
      reveal,
      // One entry alone has nothing to fit.
      frame(nodes: GraphNode[]) {
        if (nodes.length === 1) return reveal(nodes[0])
        const ids = new Set(nodes.map((node) => node.id))
        graphRef.current?.zoomToFit(ms, 96, (node) => ids.has(node.id))
      },
    }
  }, [graphRef, reduced])
}
