import { useEffect } from "react"

// Tab or Enter takes the suggestion shown at the caret, like accepting an autocomplete. It only
// does so with nothing focused, so it never takes a key from a control, a field or a dialog.
export function useAcceptSuggestion(suggestion: string | null, onAccept: (id: string) => void) {
  useEffect(() => {
    if (!suggestion) return
    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "Tab" && event.key !== "Enter") return
      if (event.shiftKey || event.ctrlKey || event.metaKey || event.altKey || event.defaultPrevented) return
      if (document.activeElement !== document.body) return
      event.preventDefault()
      onAccept(suggestion!)
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [suggestion, onAccept])
}
