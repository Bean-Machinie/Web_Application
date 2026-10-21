import type { ForceGraphMethods } from "react-force-graph-2d"
import type { GraphSettings } from "@/lib/graph-settings"

type Body = { x?: number; y?: number; vx?: number; vy?: number }

// Far-away entries do not push each other: repulsion stops at this distance.
const REPEL_REACH = 250

// A gentle pull of every entry toward the centre, so the ones with no connections
// float around the edge instead of drifting off. The same as d3's forceX and forceY
// toward zero, in one force.
function pull(strength: number) {
  let bodies: Body[] = []
  const force = (alpha: number) => {
    for (const body of bodies) {
      body.vx = (body.vx ?? 0) - (body.x ?? 0) * strength * alpha
      body.vy = (body.vy ?? 0) - (body.y ?? 0) * strength * alpha
    }
  }
  force.initialize = (list: Body[]) => {
    bodies = list
  }
  return force
}

// Sets the d3 forces the way Obsidian lays its graph out: a moderate repulsion that
// reaches only so far, links that hold at a distance, and the gentle pull to the
// middle in place of the library's own centring.
export function applyForces(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  graph: ForceGraphMethods<any, any>,
  settings: Pick<GraphSettings, "centerForce" | "repelForce" | "linkForce" | "linkDistance">
) {
  graph.d3Force("charge")?.strength(-settings.repelForce).distanceMax(REPEL_REACH)
  graph.d3Force("link")?.distance(settings.linkDistance).strength(settings.linkForce)
  graph.d3Force("center", null)
  graph.d3Force("pull", pull(settings.centerForce))
}
