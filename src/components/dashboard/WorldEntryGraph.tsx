import { useEffect, useMemo, useRef, useState } from "react"
import ForceGraph2D from "react-force-graph-2d"
import type { ForceGraphMethods, LinkObject, NodeObject } from "react-force-graph-2d"
import { useNavigate } from "react-router-dom"
import { FormAlert } from "@/components/auth/FormAlert"
import { Skeleton } from "@/components/ui/skeleton"
import { useElementSize } from "@/hooks/use-element-size"
import { useGraphSettings } from "@/hooks/use-graph-settings"
import { useReducedMotion } from "@/hooks/use-reduced-motion"
import { useThemeColors } from "@/hooks/use-theme-colors"
import { errorMessage } from "@/lib/campaigns"
import { buildGraph, fetchAllLinks } from "@/lib/world-graph"
import type { GraphLink, GraphNode, RawLink } from "@/lib/world-graph"
import type { WorldEntry } from "@/lib/world-entries"
import { drawLink, drawNode, radiusOf } from "./graph-draw"
import { applyForces } from "./graph-forces"
import { createHover } from "./graph-hover"
import { GraphSettingsPanel } from "./GraphSettingsPanel"
import { useWorldScope } from "./useWorldScope"

type Methods = ForceGraphMethods<NodeObject<GraphNode>, LinkObject<GraphNode, GraphLink>>

const NOTHING = { nodes: [] as GraphNode[], links: [] as GraphLink[] }

// The entries as a graph, laid out and drawn like Obsidian's: plain dots joined by
// lines, held together and kept apart by forces whose strength the settings panel
// changes as you watch. Hovering lights an entry, its neighbours and their lines in
// the accent colour and dims the rest; a click opens the entry. A dragged node pulls
// its neighbours along and rejoins the layout when let go. The simulation keeps
// running, gently, so the graph is never frozen; with reduced motion it is laid out
// before it is drawn and stays still.
export function WorldEntryGraph({ entries }: { entries: WorldEntry[] }) {
  const { basePath, hasVisibility } = useWorldScope()
  const navigate = useNavigate()
  const colors = useThemeColors()
  const reduced = useReducedMotion()
  const { settings, change, reset } = useGraphSettings()
  const { ref, size } = useElementSize<HTMLDivElement>()
  const graphRef = useRef<Methods>(undefined)
  const hover = useRef(createHover())
  const fadeFrame = useRef(0)
  const [links, setLinks] = useState<RawLink[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  // The forces are set before the entries are given, so the first layout uses them.
  const [ready, setReady] = useState(false)
  // Lays the graph out again when the forces change under reduced motion.
  const [layout, setLayout] = useState(0)

  useEffect(() => {
    fetchAllLinks()
      .then(setLinks)
      .catch((failure) => setError(errorMessage(failure)))
  }, [])

  const graph = useMemo(
    () => buildGraph(entries, links ?? [], !settings.showLoose),
    [entries, links, settings.showLoose]
  )
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const data = useMemo(() => ({ nodes: graph.nodes, links: graph.links }), [graph, layout])
  const showGraph = links !== null && graph.connections > 0 && size.width > 0

  // Redraws now; the library has it, its types do not say so.
  const refresh = () => (graphRef.current as { refresh?: () => void } | undefined)?.refresh?.()
  const frame = (duration: number) => graphRef.current?.zoomToFit(duration, 48)

  const { centerForce, repelForce, linkForce, linkDistance } = settings
  useEffect(() => {
    const instance = graphRef.current
    if (!instance) return
    applyForces(instance, { centerForce, repelForce, linkForce, linkDistance })
    if (!ready) setReady(true)
    else if (reduced) setLayout((count) => count + 1)
    else instance.d3ReheatSimulation()
    // ready only changes here.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showGraph, centerForce, repelForce, linkForce, linkDistance, reduced])

  // A new graph is framed once it has had a moment to spread out.
  useEffect(() => {
    if (!showGraph || !ready) return
    const timer = window.setTimeout(() => frame(reduced ? 0 : 400), reduced ? 80 : 1000)
    return () => window.clearTimeout(timer)
    // frame only reads the ref.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [graph, showGraph, ready, reduced])

  // A drawing that is paused, as under reduced motion, is redrawn for the settings.
  useEffect(() => {
    refresh()
  }, [settings, colors])

  useEffect(() => () => cancelAnimationFrame(fadeFrame.current), [])

  function onHover(node: GraphNode | null) {
    hover.current.set(node ? node.id : null)
    cancelAnimationFrame(fadeFrame.current)
    const step = () => {
      refresh()
      if (hover.current.fading()) fadeFrame.current = requestAnimationFrame(step)
    }
    step()
  }

  const view = {
    hover: hover.current,
    near: graph.near,
    colors,
    settings,
    marksHidden: hasVisibility,
    refresh,
  }

  return (
    <div ref={ref} className="relative min-h-[28rem] min-w-0 flex-1 overflow-hidden">
      {error ? (
        <div className="p-4">
          <FormAlert tone="error">{error}</FormAlert>
        </div>
      ) : !links ? (
        <Skeleton className="absolute inset-3" />
      ) : graph.connections === 0 ? (
        <p className="text-muted-foreground absolute inset-0 flex items-center justify-center px-6 text-center text-sm">
          Nothing is connected yet. Type @ in a description to link entries, or pin entries on a
          map, and they show up here.
        </p>
      ) : (
        <>
          <GraphSettingsPanel
            settings={settings}
            onChange={change}
            onReset={reset}
            onFit={() => frame(reduced ? 0 : 400)}
          />
          {showGraph && (
            <ForceGraph2D<GraphNode, GraphLink>
              ref={graphRef}
              width={size.width}
              height={size.height}
              graphData={ready ? data : NOTHING}
              backgroundColor="rgba(0,0,0,0)"
              minZoom={0.2}
              maxZoom={10}
              nodeCanvasObjectMode={() => "replace"}
              nodeCanvasObject={(node, ctx, scale) => drawNode(node, ctx, scale, view)}
              nodePointerAreaPaint={(node, color, ctx) => {
                ctx.fillStyle = color
                ctx.beginPath()
                ctx.arc(node.x ?? 0, node.y ?? 0, radiusOf(node, settings.nodeSize) + 3, 0, 2 * Math.PI)
                ctx.fill()
              }}
              linkCanvasObjectMode={() => "replace"}
              linkCanvasObject={(link, ctx, scale) => drawLink(link, ctx, scale, view)}
              onNodeHover={onHover}
              onNodeClick={(node) => navigate(`${basePath}/${node.id}`)}
              // Dragging is the library's own: the node follows the pointer, the
              // simulation is heated to 0.3 so its neighbours follow along their
              // links, and on release it is cooled to 0 and the node is let go.
              // Nodes are never pinned.
              d3VelocityDecay={0.5}
              d3AlphaDecay={0.012}
              cooldownTime={Infinity}
              warmupTicks={reduced ? 400 : 0}
              cooldownTicks={reduced ? 0 : Infinity}
            />
          )}
        </>
      )}
    </div>
  )
}
