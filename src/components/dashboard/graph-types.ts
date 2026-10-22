import type { ForceGraphMethods, LinkObject, NodeObject } from "react-force-graph-2d"
import type { GraphLink, GraphNode } from "@/lib/world-graph"

export type GraphMethods = ForceGraphMethods<NodeObject<GraphNode>, LinkObject<GraphNode, GraphLink>>
