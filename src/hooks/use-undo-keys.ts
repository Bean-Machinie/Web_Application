import { useEffect } from "react"

// Ctrl+Z to undo, Ctrl+Shift+Z or Ctrl+Y to redo, except while typing in a field.
export function useUndoKeys(undo: () => void, redo: () => void, enabled: boolean) {
  useEffect(() => {
    if (!enabled) return
    const onKey = (event: KeyboardEvent) => {
      if (!(event.ctrlKey || event.metaKey)) return
      if (event.target instanceof Element && event.target.closest("input, textarea")) return
      const key = event.key.toLowerCase()
      if (key === "z") {
        event.preventDefault()
        if (event.shiftKey) redo()
        else undo()
      } else if (key === "y") {
        event.preventDefault()
        redo()
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [undo, redo, enabled])
}
