import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import type { Graph, GraphNode } from "@/lib/world-graph"
import { withinSteps } from "@/lib/world-graph-focus"
import type { WorldEntryKind } from "@/lib/world-kinds"
import type { useGraphCamera } from "./useGraphCamera"
import { useWorldScope } from "./useWorldScope"

// Two clicks on the same entry this close together open it.
const DOUBLE_CLICK_MS = 350

// The selected entry, and the focus on it: only what is within `depth` steps of it.
// Focus frames what is near the selection; leaving it frames everything again.
export function useGraphSelection(
  graph: Graph,
  hiddenKinds: ReadonlySet<WorldEntryKind>,
  camera: ReturnType<typeof useGraphCamera>
) {
  const { basePath } = useWorldScope()
  const navigate = useNavigate()
  const [chosen, setChosen] = useState<string | null>(null)
  const [focusOn, setFocusOn] = useState(false)
  const [depth, setDepth] = useState(1)
  const lastClick = useRef({ id: "", at: 0 })
  const wasFocused = useRef(false)

  const selected = useMemo(() => {
    const node = chosen ? graph.byId.get(chosen) : undefined
    return node && !hiddenKinds.has(node.entry.kind) ? node : null
  }, [chosen, graph, hiddenKinds])

  const focus = useMemo(
    () => (focusOn && selected ? withinSteps(graph.near, selected.id, depth) : null),
    [focusOn, selected, graph, depth]
  )

  useEffect(() => {
    if (focus) camera.frame([...focus].flatMap((id) => graph.byId.get(id) ?? []))
    else if (wasFocused.current) camera.fit()
    wasFocused.current = focus !== null
    // Only a change of focus moves the camera.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focus])

  const clear = useCallback(() => {
    setChosen(null)
    setFocusOn(false)
  }, [])

  const onNodeClick = useCallback(
    (node: GraphNode) => {
      const now = performance.now()
      const again = lastClick.current.id === node.id && now - lastClick.current.at < DOUBLE_CLICK_MS
      lastClick.current = { id: node.id, at: now }
      if (again) navigate(`${basePath}/${node.id}`)
      else setChosen(node.id)
    },
    [basePath, navigate]
  )

  return { selected, focus, focusOn, setFocusOn, depth, setDepth, choose: setChosen, clear, onNodeClick }
}
