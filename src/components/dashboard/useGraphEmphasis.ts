import { useCallback, useEffect, useRef, useState } from "react"
import type { RefObject } from "react"
import type { Graph } from "@/lib/world-graph"
import { createEmphasis } from "./graph-emphasis"
import type { Aim } from "./graph-emphasis"
import { createFrame } from "./graph-frame"
import type { GraphMethods } from "./graph-types"

// The canvas is redrawn on demand, so a fade needs a frame asked for until it ends.
// This feeds what the graph emphasises to the emphasis, and runs those frames.
export function useGraphEmphasis(
  graphRef: RefObject<GraphMethods | undefined>,
  graph: Graph,
  size: { width: number; height: number },
  goals: Pick<Aim, "selected" | "focus" | "matches" | "hiddenKinds">
) {
  const [emphasis] = useState(createEmphasis)
  const [frame] = useState(createFrame)
  const loop = useRef(0)
  const { selected, focus, matches, hiddenKinds } = goals

  // The library has it, its types do not say so.
  const refresh = useCallback(
    () => (graphRef.current as { refresh?: () => void } | undefined)?.refresh?.(),
    [graphRef]
  )

  const run = useCallback(() => {
    cancelAnimationFrame(loop.current)
    const tick = () => {
      if (!graphRef.current) return
      refresh()
      if (emphasis.animating()) loop.current = requestAnimationFrame(tick)
    }
    tick()
  }, [emphasis, graphRef, refresh])

  useEffect(() => {
    emphasis.aim({ selected, focus, matches, hiddenKinds })
    run()
  }, [emphasis, run, selected, focus, matches, hiddenKinds])

  useEffect(() => () => cancelAnimationFrame(loop.current), [])

  const hover = useCallback(
    (id: string | null) => {
      emphasis.aim({ hover: id })
      run()
    },
    [emphasis, run]
  )

  // Runs before each frame: the fades move on, and what is on screen is worked out.
  const beforeFrame = useCallback(
    (_ctx: CanvasRenderingContext2D, scale: number) => {
      emphasis.step(graph.nodes, graph.near, performance.now())
      const instance = graphRef.current
      if (!instance) return
      const from = instance.screen2GraphCoords(0, 0)
      const to = instance.screen2GraphCoords(size.width, size.height)
      // Room for the names, which hang outside the dots.
      frame.set(from.x, from.y, to.x, to.y, 120 / scale)
    },
    [emphasis, frame, graph, graphRef, size.width, size.height]
  )

  return { emphasis, frame, refresh, hover, beforeFrame }
}
