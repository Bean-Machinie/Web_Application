import type { CSSProperties } from "react"

export const SETTLE_MS = 220
const EASE = "cubic-bezier(0.2, 0.8, 0.2, 1)"

export type Drag = {
  id: string
  from: number
  over: number
  dy: number
  height: number
  settling: boolean
}

export function scrollParent(el: HTMLElement) {
  for (let node = el.parentElement; node; node = node.parentElement) {
    if (/(auto|scroll)/.test(getComputedStyle(node).overflowY) && node.scrollHeight > node.clientHeight) {
      return node
    }
  }
  return document.scrollingElement as HTMLElement
}

export function viewport(scroller: HTMLElement) {
  if (scroller === document.scrollingElement) return { top: 0, bottom: window.innerHeight }
  const { top, bottom } = scroller.getBoundingClientRect()
  return { top, bottom }
}

// Rows are assumed to share one height, which is what lets the others slide
// by exactly the dragged row's height.
function shiftFor(drag: Drag, index: number) {
  if (drag.from < drag.over && index > drag.from && index <= drag.over) return -drag.height
  if (drag.from > drag.over && index >= drag.over && index < drag.from) return drag.height
  return 0
}

export function rowStyle(drag: Drag | null, id: string, index: number): CSSProperties | undefined {
  if (!drag) return undefined
  // No hover while rows move under a still pointer.
  if (id !== drag.id) {
    return {
      pointerEvents: "none",
      translate: `0 ${shiftFor(drag, index)}px`,
      // Only the rows behind fade; the held row stays solid.
      opacity: drag.settling ? 1 : 0.7,
      transition: `translate ${SETTLE_MS}ms ${EASE}, opacity 200ms ${EASE}`,
    }
  }
  return {
    pointerEvents: "none",
    translate: `0 ${drag.dy}px`,
    zIndex: 20,
    backgroundColor: "var(--card)",
    // Translate stays unanimated while following the pointer, then eases into
    // the slot on release.
    transition: drag.settling ? `translate ${SETTLE_MS}ms ${EASE}` : "none",
  }
}
