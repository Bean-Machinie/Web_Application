import { useEffect, useState } from "react"

// Where Space is typing or choosing, not a key for the canvas.
const OWN_SPACE = "input, textarea, select, [contenteditable=true], [role=dialog], [role=menu], [role=listbox]"

// Whether Space is holding the hand: while it is held, whatever the tool, the
// canvas pans. Space is taken from a focused button as well, which would
// otherwise be pressed by it, on the way down and on the way up. A drag that is
// under way keeps what it began as: a hand picked up mid-stroke waits for the
// stroke to end, and one put down mid-pan waits for the pan to end.
export function useSpacePan(enabled: boolean) {
  const [panning, setPanning] = useState(false)

  useEffect(() => {
    if (!enabled) return
    let spaceDown = false
    let pointerDown = false

    const onKey = (event: KeyboardEvent) => {
      if (event.code !== "Space") return
      const target = event.target
      if (target instanceof Element && target.closest(OWN_SPACE)) return
      event.preventDefault()
      if (event.repeat) return
      spaceDown = event.type === "keydown"
      if (!pointerDown) setPanning(spaceDown)
    }
    const onPointerDown = () => {
      pointerDown = true
    }
    const onPointerUp = () => {
      pointerDown = false
      setPanning(spaceDown)
    }
    const onBlur = () => {
      spaceDown = false
      pointerDown = false
      setPanning(false)
    }

    window.addEventListener("keydown", onKey)
    window.addEventListener("keyup", onKey)
    window.addEventListener("pointerdown", onPointerDown, true)
    window.addEventListener("pointerup", onPointerUp, true)
    window.addEventListener("pointercancel", onPointerUp, true)
    window.addEventListener("blur", onBlur)
    return () => {
      window.removeEventListener("keydown", onKey)
      window.removeEventListener("keyup", onKey)
      window.removeEventListener("pointerdown", onPointerDown, true)
      window.removeEventListener("pointerup", onPointerUp, true)
      window.removeEventListener("pointercancel", onPointerUp, true)
      window.removeEventListener("blur", onBlur)
      setPanning(false)
    }
  }, [enabled])

  return panning
}
