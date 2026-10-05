import { useEffect, useRef } from "react"
import type { AssetEditing } from "./use-asset-editing"

// Nudging by one canvas pixel, or ten with Shift.
const NUDGE = 1
const NUDGE_BIG = 10

const ARROWS: Record<string, [number, number]> = {
  ArrowLeft: [-1, 0],
  ArrowRight: [1, 0],
  ArrowUp: [0, -1],
  ArrowDown: [0, 1],
}

// The shortcuts for the art that is chosen: Delete, Ctrl+D to duplicate, ] and
// [ for forward and back, Shift+H and Shift+V to flip, the arrows to nudge and
// Escape to let go. They only act while the select tool is in use and a field
// is not being typed in.
export function useAssetKeys(editing: AssetEditing, enabled: boolean) {
  const latest = useRef(editing)
  useEffect(() => {
    latest.current = editing
  })

  useEffect(() => {
    if (!enabled) return
    const onKey = (event: KeyboardEvent) => {
      const target = event.target
      if (target instanceof Element && target.closest("input, textarea, [contenteditable=true]")) {
        return
      }
      const now = latest.current
      if (now.selected.length === 0) return
      const key = event.key
      const command = event.ctrlKey || event.metaKey

      if (key === "Delete" || key === "Backspace") now.remove()
      else if (command && key.toLowerCase() === "d") now.duplicate()
      else if (!command && key === "]") now.reorder("forward")
      else if (!command && key === "[") now.reorder("back")
      else if (event.shiftKey && key.toLowerCase() === "h") now.flip("x")
      else if (event.shiftKey && key.toLowerCase() === "v") now.flip("y")
      else if (key === "Escape") now.clear()
      else if (key in ARROWS && !command) {
        const [dx, dy] = ARROWS[key]
        const step = event.shiftKey ? NUDGE_BIG : NUDGE
        now.nudge(dx * step, dy * step)
      } else return
      event.preventDefault()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [enabled])
}
