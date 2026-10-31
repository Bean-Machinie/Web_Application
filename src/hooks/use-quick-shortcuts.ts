import { useEffect } from "react"
import { WORKSPACES } from "@/lib/quick-workspace"
import type { Workspace } from "@/lib/quick-workspace"

const KEYS = new Map(WORKSPACES.map(({ id, key }) => [key.toLowerCase(), id]))
// Where a letter is what is being typed or chosen, not a shortcut.
const OWN = "input, textarea, select, [contenteditable=true], [role=dialog], [role=menu], [role=listbox], [role=combobox]"

// The character builder's keys: a letter switches to the workspace that has it. The map
// builder's keys are its own (see shortcut-actions.ts) and are not shared.
export function useQuickShortcuts(onWorkspace: (workspace: Workspace) => void) {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey || event.altKey || event.shiftKey) return
      if (event.target instanceof Element && event.target.closest(OWN)) return
      const next = KEYS.get(event.key.toLowerCase())
      if (!next) return
      event.preventDefault()
      onWorkspace(next)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [onWorkspace])
}
