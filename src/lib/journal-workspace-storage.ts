import { EMPTY_WORKSPACE, MAX_PANES } from "./journal-workspace"
import type { Pane, Tab, Workspace } from "./journal-workspace"

const isTab = (value: unknown): value is Tab => {
  const tab = value as Partial<Tab> | null
  return (tab?.kind === "page" || tab?.kind === "entry") && typeof tab.id === "string"
}

function readPane(value: unknown): Pane | null {
  const pane = value as { tabs?: unknown; active?: unknown } | null
  if (!Array.isArray(pane?.tabs)) return null
  const tabs = pane.tabs.filter(isTab)
  const active = typeof pane.active === "number" ? pane.active : 0
  return { tabs, active: Math.max(0, Math.min(active, tabs.length - 1)) }
}

// What was remembered, or an empty workspace for anything missing or not as
// expected. The same tab twice would mean two editors on one page, so repeats go.
export function readWorkspace(text: string | null): Workspace {
  try {
    const stored = JSON.parse(text ?? "null") as { panes?: unknown; focused?: unknown } | null
    const panes = Array.isArray(stored?.panes)
      ? stored.panes.slice(0, MAX_PANES).map(readPane).filter((pane): pane is Pane => pane !== null)
      : []
    if (panes.length === 0) return EMPTY_WORKSPACE

    const seen = new Set<string>()
    for (const pane of panes) {
      pane.tabs = pane.tabs.filter((tab) => !seen.has(`${tab.kind}:${tab.id}`) && !!seen.add(`${tab.kind}:${tab.id}`))
      pane.active = Math.max(0, Math.min(pane.active, pane.tabs.length - 1))
    }
    const focused = typeof stored?.focused === "number" ? stored.focused : 0
    return { panes, focused: Math.max(0, Math.min(focused, panes.length - 1)) }
  } catch {
    return EMPTY_WORKSPACE
  }
}

export const writeWorkspace = (workspace: Workspace) => JSON.stringify(workspace)
