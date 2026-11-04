import { useEffect } from "react"
import type { JournalWorkspaceState } from "./use-journal-workspace"

// Ctrl+W closes the tab showing, Ctrl+Tab goes to the next, Ctrl+Shift+Tab the one before.
// A browser may keep these for its own tabs; they work where it hands them over.
export function useJournalShortcuts({ workspace, close, step }: JournalWorkspaceState) {
  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      const key = event.key.toLowerCase()
      if ((event.ctrlKey || event.metaKey) && key === "w") {
        event.preventDefault()
        close(workspace.focused, workspace.panes[workspace.focused]?.active ?? 0)
      } else if (event.ctrlKey && key === "tab") {
        event.preventDefault()
        step(event.shiftKey ? -1 : 1)
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [workspace, close, step])
}
