import { useCallback, useEffect } from "react"
import type { PointerEvent, RefObject } from "react"
import type { Spot } from "./graph-backdrop"
import type { GraphMethods } from "./graph-types"

// The backdrop is alive: its band of light drifts, so the canvas is redrawn about
// thirty times a second (not at all while the tab is hidden or motion is reduced),
// and it follows the pointer.
export function useGraphBackdrop(
  graphRef: RefObject<GraphMethods | undefined>,
  refresh: () => void,
  spot: RefObject<Spot>,
  reduced: boolean
) {
  useEffect(() => {
    if (reduced) return
    let frame = 0
    let skip = false
    const tick = () => {
      skip = !skip
      if (!skip && !document.hidden) refresh()
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [refresh, reduced])

  const onPointerMove = useCallback(
    (event: PointerEvent<HTMLElement>) => {
      const box = event.currentTarget.getBoundingClientRect()
      const at = graphRef.current?.screen2GraphCoords(event.clientX - box.left, event.clientY - box.top)
      if (!at) return
      spot.current = { x: at.x, y: at.y, on: true }
      if (reduced) refresh()
    },
    [graphRef, refresh, spot, reduced]
  )

  const onPointerLeave = useCallback(() => {
    spot.current = { ...spot.current, on: false }
    if (reduced) refresh()
  }, [refresh, spot, reduced])

  return { onPointerMove, onPointerLeave }
}
