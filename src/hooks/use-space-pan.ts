import { useEffect, useMemo, useRef, useState } from "react"
import type { Hold } from "./use-shortcuts"

// Whether the hand is held: while it is, whatever the tool, the canvas pans. A
// drag that is under way keeps what it began as: a hand picked up mid-stroke waits
// for the stroke to end, and one put down mid-pan waits for the pan to end. "hold"
// is for the shortcut that holds it (see useShortcuts), which also keeps the key
// from pressing a focused button.
export function useSpacePan(enabled: boolean) {
  const [panning, setPanning] = useState(false)
  const keyDown = useRef(false)
  const pointerDown = useRef(false)

  const hold = useMemo<Hold>(
    () => ({
      down: () => {
        keyDown.current = true
        if (!pointerDown.current) setPanning(true)
      },
      up: () => {
        keyDown.current = false
        if (!pointerDown.current) setPanning(false)
      },
    }),
    []
  )

  useEffect(() => {
    if (!enabled) return
    const onPointerDown = () => {
      pointerDown.current = true
    }
    const onPointerUp = () => {
      pointerDown.current = false
      setPanning(keyDown.current)
    }
    const onBlur = () => {
      keyDown.current = false
      pointerDown.current = false
      setPanning(false)
    }
    window.addEventListener("pointerdown", onPointerDown, true)
    window.addEventListener("pointerup", onPointerUp, true)
    window.addEventListener("pointercancel", onPointerUp, true)
    window.addEventListener("blur", onBlur)
    return () => {
      window.removeEventListener("pointerdown", onPointerDown, true)
      window.removeEventListener("pointerup", onPointerUp, true)
      window.removeEventListener("pointercancel", onPointerUp, true)
      window.removeEventListener("blur", onBlur)
      keyDown.current = false
      setPanning(false)
    }
  }, [enabled])

  return { panning, hold }
}
