import { useRef } from "react"
import type { PointerEvent } from "react"

type Reel = { grab: () => void; drag: (cards: number) => void; release: () => void }

// Grabbing the reel: dragging along its slant (`axis`, a unit vector) moves it a card for every
// `spacing` pixels, and let go it is thrown.
export function useReelDrag(reel: Reel, axis: { x: number; y: number }, spacing: number) {
  const last = useRef<{ x: number; y: number } | null>(null)

  const onPointerDown = (event: PointerEvent<HTMLElement>) => {
    if (event.button !== 0) return
    // On the card pressed, which keeps the pointer while it slides away underneath.
    ;(event.target as Element).setPointerCapture(event.pointerId)
    last.current = { x: event.clientX, y: event.clientY }
    reel.grab()
  }

  const onPointerMove = (event: PointerEvent<HTMLElement>) => {
    const at = last.current
    if (!at || spacing <= 0) return
    last.current = { x: event.clientX, y: event.clientY }
    // Cards further along the slant are ahead in the reel, so pulling along it moves the reel back.
    reel.drag(-((event.clientX - at.x) * axis.x + (event.clientY - at.y) * axis.y) / spacing)
  }

  const onPointerUp = () => {
    if (!last.current) return
    last.current = null
    reel.release()
  }

  return { onPointerDown, onPointerMove, onPointerUp, onPointerCancel: onPointerUp }
}
