import { useCallback } from "react"
import type { RefObject } from "react"
import { snapAngle } from "@/lib/snap-angle"
import { turnedTo } from "@/lib/view-matrix"
import type { BuilderView } from "@/lib/view-matrix"

type Options = {
  container: RefObject<HTMLDivElement | null>
  live: RefObject<BuilderView>
  moveTo: (view: BuilderView) => void
  // The point of the screen the view is turned about.
  about: { x: number; y: number }
}

// Dragging with the rotate tool turns the view by as much as the pointer sweeps
// around the middle of what is seen, as a dial would turn.
export function useRotateDrag({ container, live, moveTo, about }: Options) {
  return useCallback(
    (event: React.PointerEvent) => {
      const element = container.current
      if (!element) return
      const box = element.getBoundingClientRect()
      const angleOf = (x: number, y: number) =>
        (Math.atan2(y - box.top - about.y, x - box.left - about.x) * 180) / Math.PI
      const from = angleOf(event.clientX, event.clientY)
      const start = live.current.rotation
      const move = (next: PointerEvent) => {
        const turn = start + angleOf(next.clientX, next.clientY) - from
        moveTo(turnedTo(live.current, snapAngle(turn, next.shiftKey), about))
      }
      const end = () => {
        window.removeEventListener("pointermove", move)
        window.removeEventListener("pointerup", end)
      }
      window.addEventListener("pointermove", move)
      window.addEventListener("pointerup", end)
    },
    [container, live, moveTo, about]
  )
}
