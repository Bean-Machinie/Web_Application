import { useEffect } from "react"

// Typing somewhere, or a dialog on top, keeps the keys.
const KEEPS_KEYS = "input, textarea, select, [contenteditable='true'], [role='dialog'], [role='menu']"

// F fits the graph; Escape clears the selection and the focus.
export function useGraphKeys(onFit: () => void, onClear: () => void) {
  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.ctrlKey || event.metaKey || event.altKey) return
      if ((event.target as HTMLElement | null)?.closest(KEEPS_KEYS)) return
      if (event.key === "Escape") onClear()
      else if (event.key.toLowerCase() === "f") onFit()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [onFit, onClear])
}
