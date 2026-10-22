import { useEffect, useMemo, useRef, useState } from "react"
import ForceGraph2D from "react-force-graph-2d"
import { FormAlert } from "@/components/auth/FormAlert"
import { Skeleton } from "@/components/ui/skeleton"
import { useElementSize } from "@/hooks/use-element-size"
import { useGraphSettings } from "@/hooks/use-graph-settings"
import { useReducedMotion } from "@/hooks/use-reduced-motion"
import { useStableGraph } from "@/hooks/use-stable-graph"
import { useThemeColors } from "@/hooks/use-theme-colors"
import { useWorldLinks } from "@/hooks/use-world-links"
import type { WorldEntry } from "@/lib/world-entries"
import type { GraphLink, GraphNode } from "@/lib/world-graph"
import type { WorldEntryKind } from "@/lib/world-kinds"
import type { Spot } from "./graph-backdrop"
import { drawLink, drawNode, radiusOf } from "./graph-draw"
import type { GraphMethods } from "./graph-types"
import { GraphFocusControls } from "./GraphFocusControls"
import { GraphPreviewCard } from "./GraphPreviewCard"
import { GraphSearch } from "./GraphSearch"
import { GraphSettingsPanel } from "./GraphSettingsPanel"
import { useGraphBackdrop } from "./useGraphBackdrop"
import { useGraphCamera } from "./useGraphCamera"
import { useGraphEmphasis } from "./useGraphEmphasis"
import { useGraphForces } from "./useGraphForces"
import { useGraphKeys } from "./useGraphKeys"
import { useGraphSearch } from "./useGraphSearch"
import { useGraphSelection } from "./useGraphSelection"
import { useWorldScope } from "./useWorldScope"

const replace = () => "replace" as const

// The entries as a graph, laid out and drawn like Obsidian's: dots joined by lines,
// held together and kept apart by forces whose strength the settings panel changes as
// you watch. Hovering lights an entry and its neighbours and dims the rest. A click
// selects an entry (a card in the corner, Focus to show only what is near it), a
// double click opens it. A dragged node pulls its neighbours along and rejoins the
// layout when let go. The simulation keeps running, gently; with reduced motion it
// is laid out before it is drawn and stays still.
//
// The graph data is handed to the library once and never rebuilt for a hover, a
// selection or a setting; those only change what the draw functions read.
export function WorldEntryGraph({ entries }: { entries: WorldEntry[] }) {
  const { hasVisibility, canManage, kinds } = useWorldScope()
  const colors = useThemeColors()
  const reduced = useReducedMotion()
  const { settings, change, reset } = useGraphSettings()
  const { ref, size } = useElementSize<HTMLDivElement>()
  const graphRef = useRef<GraphMethods>(undefined)
  const { links, error } = useWorldLinks()
  const [query, setQuery] = useState("")
  const [asPlayer, setAsPlayer] = useState(false)
  const [hiddenKinds, setHiddenKinds] = useState<ReadonlySet<WorldEntryKind>>(new Set())

  const shown = asPlayer ? entries.filter((entry) => entry.revealed) : entries
  const graph = useStableGraph(shown, links ?? [], !settings.showLoose)
  const showGraph = links !== null && graph.connections > 0 && size.width > 0

  const camera = useGraphCamera(graphRef, reduced)
  const selection = useGraphSelection(graph, hiddenKinds, camera)
  const { selected, focus } = selection
  const { matches, best } = useGraphSearch(graph, hiddenKinds, query, camera.reveal)
  const spot = useRef<Spot>({ x: 0, y: 0, on: false })
  const { emphasis, frame, refresh, hover, beforeFrame } = useGraphEmphasis(graphRef, graph, size, colors, spot, {
    selected: selected?.id ?? null,
    focus,
    matches,
    hiddenKinds,
  })
  const pointer = useGraphBackdrop(graphRef, refresh, spot, reduced)
  const data = useGraphForces(graphRef, graph, settings, showGraph, reduced, camera.fit)

  useGraphKeys(camera.fit, selection.clear)

  const view = useMemo(
    () => ({ emphasis, frame, colors, settings, marksHidden: hasVisibility, refresh }),
    [emphasis, frame, colors, settings, hasVisibility, refresh]
  )
  // A drawing that is paused, as under reduced motion, is redrawn for the settings.
  useEffect(() => {
    refresh()
  }, [view, refresh])

  const toggleKind = (kind: WorldEntryKind) =>
    setHiddenKinds((old) => {
      const next = new Set(old)
      if (!next.delete(kind)) next.add(kind)
      return next
    })

  return (
    <div
      ref={ref}
      onPointerMove={pointer.onPointerMove}
      onPointerLeave={pointer.onPointerLeave}
      // A hand over the whole graph, closed while pressed: you pan the ground and drag
      // the entries alike.
      className="relative min-h-[28rem] min-w-0 flex-1 overflow-hidden [&_canvas]:cursor-grab! [&_canvas:active]:cursor-grabbing!"
    >
      {/* A soft pool of light in the middle, darker toward the edges, under the grid. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_20%,var(--muted)_100%)]"
      />
      {error ? (
        <div className="p-4">
          <FormAlert tone="error">{error}</FormAlert>
        </div>
      ) : !links ? (
        <Skeleton className="absolute inset-3" />
      ) : (
        <>
          <GraphSettingsPanel
            settings={settings}
            onChange={change}
            onReset={reset}
            onFit={camera.fit}
            legend={{ kinds, hidden: hiddenKinds, onToggle: toggleKind }}
            player={canManage && hasVisibility ? { on: asPlayer, onChange: setAsPlayer } : null}
          />
          <div className="absolute top-3 left-3 z-10 flex w-56 flex-col gap-2">
            <GraphSearch value={query} onChange={setQuery} onSubmit={() => best && selection.choose(best.id)} />
            {selected && (
              <GraphFocusControls
                on={selection.focusOn}
                onToggle={selection.setFocusOn}
                depth={selection.depth}
                onDepth={selection.setDepth}
              />
            )}
          </div>
          {graph.connections === 0 ? (
            <p className="text-muted-foreground absolute inset-0 flex items-center justify-center px-6 text-center text-sm">
              Nothing is connected yet. Type @ in a description to link entries, or pin entries on
              a map, and they show up here.
            </p>
          ) : (
            showGraph && (
              <ForceGraph2D<GraphNode, GraphLink>
                ref={graphRef}
                width={size.width}
                height={size.height}
                graphData={data}
                backgroundColor="rgba(0,0,0,0)"
                minZoom={0.2}
                maxZoom={10}
                onRenderFramePre={beforeFrame}
                nodeCanvasObjectMode={replace}
                nodeCanvasObject={(node, ctx, scale) => drawNode(node, ctx, scale, view)}
                nodePointerAreaPaint={(node, color, ctx) => {
                  // What is faded out cannot be pointed at.
                  if (emphasis.look(node.id).alpha < 0.1) return
                  ctx.fillStyle = color
                  ctx.beginPath()
                  ctx.arc(node.x ?? 0, node.y ?? 0, radiusOf(node, settings.nodeSize) + 3, 0, 2 * Math.PI)
                  ctx.fill()
                }}
                linkCanvasObjectMode={replace}
                linkCanvasObject={(link, ctx, scale) => drawLink(link, ctx, scale, view)}
                onNodeHover={(node) => hover(node ? node.id : null)}
                onNodeClick={selection.onNodeClick}
                onBackgroundClick={() => selection.choose(null)}
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
            )
          )}
          {selected && <GraphPreviewCard node={selected} onClose={() => selection.choose(null)} />}
        </>
      )}
    </div>
  )
}
