import { useLayoutEffect } from "react"
import type { RefObject } from "react"

const DURATION_MS = 280
const EASING = "cubic-bezier(0.22, 1, 0.36, 1)"
const GLIDE = "grid-glide"
// More than the grid drifts in one frame of the sidebar's easing, less than half a column.
const JUMP_PX = 40

// What an element is shifted by now, which is part way through if it is gliding.
function shiftOf(element: HTMLElement) {
  const [x, y] = getComputedStyle(element).translate.split(" ")
  return { x: parseFloat(x) || 0, y: parseFloat(y) || 0 }
}

// Cards of a grid that move to another row, or to another place on one, when the grid is
// resized or its cards change (the sidebar opening, a search) glide there rather than jump.
// Each starts from where it was last drawn, before the page is painted, and eases to its
// new place. A card still gliding when the layout changes again carries on from where it is.
// The sideways drift of a centred grid as it widens is left to the browser. It is a web
// animation, so it does not touch the card's own style, which the drag to reorder also uses.
export function useFlipGrid(grid: RefObject<HTMLElement | null>, itemSelector: string) {
  useLayoutEffect(() => {
    const box = grid.current
    if (!box || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return

    // Where each card sits in the layout, with no shift counted.
    let placed = new Map<HTMLElement, { x: number; y: number }>()

    const update = () => {
      const next = new Map<HTMLElement, { x: number; y: number }>()
      const moved: { element: HTMLElement; dx: number; dy: number }[] = []

      for (const element of box.querySelectorAll<HTMLElement>(itemSelector)) {
        const rect = element.getBoundingClientRect()
        const shift = shiftOf(element)
        const now = { x: rect.left - shift.x, y: rect.top - shift.y }
        next.set(element, now)
        const before = placed.get(element)
        // A card that changed row, or that was thrown sideways (a column came or went, and the
        // centred grid took its new place at once). The slow drift of a grid being widened is
        // a few pixels a frame, and stays the browser's.
        if (!before || (Math.abs(before.y - now.y) < 1 && Math.abs(before.x - now.x) < JUMP_PX)) continue
        // Back to where the eye last saw it: where it was laid out, plus what it was shifted by.
        moved.push({ element, dx: before.x + shift.x - now.x, dy: before.y + shift.y - now.y })
      }
      placed = next

      for (const { element, dx, dy } of moved) {
        for (const running of element.getAnimations()) if (running.id === GLIDE) running.cancel()
        element.animate([{ translate: `${dx}px ${dy}px` }, { translate: "0px 0px" }], {
          id: GLIDE,
          duration: DURATION_MS,
          easing: EASING,
        })
      }
    }

    update()
    const resize = new ResizeObserver(update)
    resize.observe(box)
    const change = new MutationObserver(update)
    change.observe(box, { childList: true })
    return () => {
      resize.disconnect()
      change.disconnect()
    }
  }, [grid, itemSelector])
}
