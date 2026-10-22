import { useEffect, useMemo, useState } from "react"
import type { RefObject } from "react"
import type { GraphSettings } from "@/lib/graph-settings"
import type { Graph, GraphLink, GraphNode } from "@/lib/world-graph"
import { applyForces } from "./graph-forces"
import type { GraphMethods } from "./graph-types"

const NOTHING = { nodes: [] as GraphNode[], links: [] as GraphLink[] }
// A slider sends a change per step; the layout is only stirred once it rests.
const REHEAT_MS = 120

// Sets the forces, in place, and hands out the graph data: the same object for as
// long as the graph is the same. The forces are set before the entries are given,
// so the first layout uses them. A change of force stirs the layout again; under
// reduced motion it is laid out afresh before it is drawn instead. A new graph is
// framed once it has had a moment to spread out.
export function useGraphForces(
  graphRef: RefObject<GraphMethods | undefined>,
  graph: Graph,
  settings: GraphSettings,
  showGraph: boolean,
  reduced: boolean,
  fit: () => void
) {
  const [ready, setReady] = useState(false)
  const [layout, setLayout] = useState(0)
  const { centerForce, repelForce, linkForce, linkDistance } = settings

  useEffect(() => {
    const instance = graphRef.current
    if (!instance) return
    applyForces(instance, { centerForce, repelForce, linkForce, linkDistance })
    if (!ready) {
      setReady(true)
      return
    }
    const timer = window.setTimeout(
      () => (reduced ? setLayout((count) => count + 1) : instance.d3ReheatSimulation()),
      REHEAT_MS
    )
    return () => window.clearTimeout(timer)
    // ready only changes here.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [graphRef, showGraph, centerForce, repelForce, linkForce, linkDistance, reduced])

  useEffect(() => {
    if (!showGraph || !ready) return
    const timer = window.setTimeout(fit, reduced ? 80 : 1000)
    return () => window.clearTimeout(timer)
    // Only a new graph is framed, not a new function.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [graph, showGraph, ready, reduced])

  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(() => (ready ? { nodes: graph.nodes, links: graph.links } : NOTHING), [graph, ready, layout])
}
