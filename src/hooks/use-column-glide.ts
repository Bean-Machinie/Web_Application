import { useLayoutEffect } from "react"
import type { RefObject } from "react"

const DURATION_MS = 360
const EASING = "cubic-bezier(0.32, 0.72, 0, 1)"
const ID = "column-glide"

type Box = { left: number; top: number; width: number }

const columnsOf = (grid: HTMLElement) => getComputedStyle(grid).gridTemplateColumns.split(" ").length

// When a column comes or goes, every card eases from the place and size it was drawn at to its new
// ones, in one move, so the step in size is a glide. Nothing animates while the grid is only
// being resized between those moments: the cards scale live with the panel. A glide that is still
// running starts the next from where the card is on screen, so cards never snap or pile up.
// It is a web animation on `transform`, which neither the drag to reorder nor the glide of
// use-flip-grid (`translate`) uses.
export function useColumnGlide(grid: RefObject<HTMLElement | null>, itemSelector: string) {
  useLayoutEffect(() => {
    const box = grid.current
    if (!box || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return

    let columns = columnsOf(box)
    let seen = new Map<HTMLElement, Box>()

    const items = () => Array.from(box.querySelectorAll<HTMLElement>(itemSelector))
    const drawn = () => {
      const now = new Map<HTMLElement, Box>()
      for (const element of items()) {
        const { left, top, width } = element.getBoundingClientRect()
        now.set(element, { left, top, width })
      }
      return now
    }

    const update = () => {
      const count = columnsOf(box)
      if (count === columns) {
        seen = drawn()
        return
      }
      columns = count

      // Stop what is running to read the new layout, then glide from what was on screen.
      for (const element of items()) for (const run of element.getAnimations()) if (run.id === ID) run.cancel()
      const after = drawn()
      for (const [element, to] of after) {
        const from = seen.get(element)
        if (!from || to.width === 0) continue
        const grow = from.width / to.width
        element.animate(
          [
            { transformOrigin: "0 0", transform: `translate(${from.left - to.left}px, ${from.top - to.top}px) scale(${grow})` },
            { transformOrigin: "0 0", transform: "translate(0, 0) scale(1)" },
          ],
          { id: ID, duration: DURATION_MS, easing: EASING }
        )
      }
      seen = after
    }

    seen = drawn()
    const resize = new ResizeObserver(update)
    resize.observe(box)
    const change = new MutationObserver(() => {
      columns = columnsOf(box)
      seen = drawn()
    })
    change.observe(box, { childList: true })
    return () => {
      resize.disconnect()
      change.disconnect()
    }
  }, [grid, itemSelector])
}
