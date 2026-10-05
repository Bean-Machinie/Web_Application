import { useEffect } from "react"
import { BUILDER_TOOLS } from "@/lib/map-builder-tools"
import type { BuilderTool } from "@/lib/map-builder-tools"

// A single key picks a tool: V, L or H. Ignored with Ctrl, Alt or Shift held (so
// Ctrl+V and Shift+H keep their own meanings) and while typing in a field.
export function useToolKeys(onTool: (tool: BuilderTool) => void, enabled: boolean) {
  useEffect(() => {
    if (!enabled) return
    const onKey = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey || event.altKey || event.shiftKey) return
      const target = event.target
      if (target instanceof Element && target.closest("input, textarea, [contenteditable=true]")) {
        return
      }
      const tool = BUILDER_TOOLS.find((candidate) => candidate.key.toLowerCase() === event.key.toLowerCase())
      if (!tool) return
      event.preventDefault()
      onTool(tool.id)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [onTool, enabled])
}
