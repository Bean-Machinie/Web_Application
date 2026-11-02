import { useEffect } from "react"
import type { RefObject } from "react"

// One card for about this much wheel travel, so a notch moves one card and a fast scroll
// several.
const PIXELS_PER_CARD = 80
// What is left over is let go after this long without scrolling.
const IDLE_MS = 150

// Turns a ring with the wheel or a trackpad over `stage`, which does not scroll the page. The
// movement adds up across events; each full step goes at once, and the rest waits for more.
// Not a React handler: those are passive, and could not keep the page from scrolling.
export function useRingWheel(stage: RefObject<HTMLElement | null>, go: (steps: number) => void) {
  useEffect(() => {
    const element = stage.current
    if (!element) return
    let carried = 0
    let idle = 0
    const onWheel = (event: WheelEvent) => {
      event.preventDefault()
      carried += Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY
      const steps = Math.trunc(carried / PIXELS_PER_CARD)
      if (steps !== 0) {
        carried -= steps * PIXELS_PER_CARD
        go(steps)
      }
      window.clearTimeout(idle)
      idle = window.setTimeout(() => (carried = 0), IDLE_MS)
    }
    element.addEventListener("wheel", onWheel, { passive: false })
    return () => {
      window.clearTimeout(idle)
      element.removeEventListener("wheel", onWheel)
    }
  }, [stage, go])
}
