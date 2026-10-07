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

// The shortcuts for art: Delete, Ctrl+A, Ctrl+C, Ctrl+X, Ctrl+V and Ctrl+D, Shift+H and
// Shift+V to flip, the arrows to nudge and Escape to let go. They are off while
// a field is being typed in.
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
      const key = event.key
      const letter = key.toLowerCase()
      const command = event.ctrlKey || event.metaKey
      const has = now.selected.length > 0

      if (command && letter === "v") now.paste()
      else if (command && letter === "a") now.selectAll()
      else if (!has) return
      else if (key === "Delete" || key === "Backspace") now.remove()
      else if (command && letter === "c") now.copy()
      else if (command && letter === "x") now.cut()
      else if (command && letter === "d") now.duplicate()
      else if (event.shiftKey && !command && letter === "h") now.flip("x")
      else if (event.shiftKey && !command && letter === "v") now.flip("y")
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
