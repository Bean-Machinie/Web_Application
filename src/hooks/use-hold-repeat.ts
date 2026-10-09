import { useEffect, useRef } from "react"

const FIRST_REPEAT_MS = 400

// Repeats slow at first, then faster the longer the button stays down.
function delayFor(repeats: number) {
  if (repeats < 6) return 140
  if (repeats < 16) return 70
  return 35
}

// Press and hold to repeat `step`: once at once, again after a short pause,
// then faster. Spread the result onto the pressed element.
export function useHoldRepeat(step: () => void) {
  const latest = useRef(step)
  const timer = useRef(0)
  useEffect(() => {
    latest.current = step
  })

  const stop = () => window.clearTimeout(timer.current)
  useEffect(() => stop, [])

  function start() {
    let repeats = 0
    const tick = () => {
      latest.current()
      timer.current = window.setTimeout(tick, delayFor(repeats++))
    }
    latest.current()
    timer.current = window.setTimeout(tick, FIRST_REPEAT_MS)
    // The button can become disabled under the finger (at 0 or full), which
    // stops its own pointer events, so the release is listened for globally.
    window.addEventListener("pointerup", stop, { once: true })
    window.addEventListener("pointercancel", stop, { once: true })
  }

  return {
    onPointerDown: (event: React.PointerEvent) => {
      if (event.button !== 0) return
      stop()
      start()
    },
    onPointerUp: stop,
    onPointerLeave: stop,
    onPointerCancel: stop,
    // Keyboard activation arrives as a click without a pointer (detail 0).
    onClick: (event: React.MouseEvent) => {
      if (event.detail === 0) latest.current()
    },
    onContextMenu: (event: React.MouseEvent) => event.preventDefault(),
  }
}
