import { useRef } from "react"
import type { MouseEvent, PointerEvent } from "react"
import type { MotionValue } from "motion/react"

// Moving less than this is a click.
const THRESHOLD_PX = 6
// How far ahead of the pointer the ring coasts on release, in seconds of its speed.
const MOMENTUM_S = 0.25

type Options = {
  angle: MotionValue<number>
  // Turns to a position, in whole cards from the start.
  moveTo: (position: number) => void
  // How far the pointer goes to turn the ring one card.
  pixelsPerCard: () => number
  onGrab: () => void
}

// Dragging a ring round: it follows the pointer, and on release coasts a little further
// with the speed the pointer had, then settles on a card. A drag does not click the card
// under it.
export function useRingDrag({ angle, moveTo, pixelsPerCard, onGrab }: Options) {
  const dragged = useRef(false)

  function onPointerDown(event: PointerEvent) {
    if (event.button !== 0) return
    dragged.current = false
    const origin = event.clientX
    const from = angle.get()
    const perCard = pixelsPerCard()
    let last = { x: origin, time: event.timeStamp }
    let speed = 0

    const move = (next: globalThis.PointerEvent) => {
      const travelled = next.clientX - origin
      if (!dragged.current) {
        if (Math.abs(travelled) < THRESHOLD_PX) return
        dragged.current = true
        onGrab()
      }
      angle.jump(from - travelled / perCard)
      const elapsed = next.timeStamp - last.time
      if (elapsed > 0) speed = 0.7 * speed + 0.3 * (((next.clientX - last.x) / elapsed) * 1000)
      last = { x: next.clientX, time: next.timeStamp }
    }
    const release = () => {
      window.removeEventListener("pointermove", move)
      window.removeEventListener("pointerup", release)
      window.removeEventListener("pointercancel", release)
      if (dragged.current) moveTo(Math.round(angle.get() - (speed * MOMENTUM_S) / perCard))
    }
    window.addEventListener("pointermove", move)
    window.addEventListener("pointerup", release)
    window.addEventListener("pointercancel", release)
  }

  // In the capture phase, so the card never hears the click that ends a drag.
  function onClickCapture(event: MouseEvent) {
    if (!dragged.current) return
    dragged.current = false
    event.preventDefault()
    event.stopPropagation()
  }

  return { onPointerDown, onClickCapture }
}
