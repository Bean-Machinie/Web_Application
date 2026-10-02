import type { CSSProperties } from "react"

export const SETTLE_MS = 220
const EASE = "cubic-bezier(0.2, 0.8, 0.2, 1)"

// The centre of a slot, in page coordinates at the moment the drag began.
export type Point = { x: number; y: number }

export type Drag = {
  id: string
  from: number
  over: number
  dx: number
  dy: number
  slots: Point[]
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

// Null if a row is not mounted, which would leave a hole in the slots.
export function measure(ids: string[], rows: Map<string, HTMLElement>, scroller: HTMLElement) {
  const slots: Point[] = []
  for (const id of ids) {
    const rect = rows.get(id)?.getBoundingClientRect()
    if (!rect) return null
    slots.push({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 + scroller.scrollTop })
  }
  return slots
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

// Keeps the held item inside the slots and finds the slot it is nearest to.
export function locate(slots: Point[], from: number, dx: number, dy: number) {
  const home = slots[from]
  const xs = slots.map((s) => s.x)
  const ys = slots.map((s) => s.y)
  const x = clamp(dx, Math.min(...xs) - home.x, Math.max(...xs) - home.x)
  const y = clamp(dy, Math.min(...ys) - home.y, Math.max(...ys) - home.y)
  let over = from
  let best = Infinity
  slots.forEach((slot, index) => {
    const distance = Math.hypot(slot.x - home.x - x, slot.y - home.y - y)
    if (distance < best) {
      best = distance
      over = index
    }
  })
  return { over, dx: x, dy: y }
}

// Items between the held one's old and new slot each move to their neighbour's
// slot.
function shiftFor(drag: Drag, index: number): Point {
  const { from, over, slots } = drag
  const step = from < over && index > from && index <= over ? -1 : from > over && index >= over && index < from ? 1 : 0
  if (step === 0) return { x: 0, y: 0 }
  return { x: slots[index + step].x - slots[index].x, y: slots[index + step].y - slots[index].y }
}

export function rowStyle(drag: Drag | null, id: string, index: number): CSSProperties | undefined {
  if (!drag) return undefined
  // No hover while rows move under a still pointer.
  if (id !== drag.id) {
    const { x, y } = shiftFor(drag, index)
    return {
      pointerEvents: "none",
      translate: `${x}px ${y}px`,
      // Only the rows behind fade; the held row stays solid.
      opacity: drag.settling ? 1 : 0.7,
      transition: `translate ${SETTLE_MS}ms ${EASE}, opacity 200ms ${EASE}`,
    }
  }
  return {
    pointerEvents: "none",
    translate: `${drag.dx}px ${drag.dy}px`,
    zIndex: 20,
    backgroundColor: "var(--card)",
    // Translate stays unanimated while following the pointer, then eases into
    // the slot on release.
    transition: drag.settling ? `translate ${SETTLE_MS}ms ${EASE}` : "none",
  }
}
