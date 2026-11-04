import { useCallback, useMemo, useRef } from "react"
import { useStoredValue } from "@/hooks/use-stored-value"
import {
  closeTab,
  focusPane,
  focusTab,
  moveTab,
  openTab,
  pruneTabs,
  splitRight,
  stepTab,
} from "@/lib/journal-workspace"
import type { Place, Tab, Workspace, Where } from "@/lib/journal-workspace"
import { readWorkspace, writeWorkspace } from "@/lib/journal-workspace-storage"

// The open tabs and panes of a campaign's journal, remembered in this browser. Each
// action is a change to the workspace as it is now, so several in one go (an address
// that opens a tab, a click) do not undo each other.
export function useJournalWorkspace(campaignId: string) {
  const [workspace, save] = useStoredValue(`journal-workspace:${campaignId}`, readWorkspace, writeWorkspace)
  const latest = useRef(workspace)

  const apply = useCallback(
    (change: (current: Workspace) => Workspace) => {
      const next = change(latest.current)
      if (next === latest.current) return
      latest.current = next
      save(next)
    },
    [save]
  )

  const actions = useMemo(
    () => ({
      open: (tab: Tab, where: Where, focus = true) => apply((ws) => openTab(ws, tab, where, focus)),
      close: (pane: number, index: number) => apply((ws) => closeTab(ws, pane, index)),
      show: (pane: number, index: number) => apply((ws) => focusTab(ws, pane, index)),
      focus: (pane: number) => apply((ws) => focusPane(ws, pane)),
      move: (key: string, place: Place) => apply((ws) => moveTab(ws, key, place)),
      split: () => apply(splitRight),
      step: (by: 1 | -1) => apply((ws) => stepTab(ws, by)),
      prune: (pages: Set<string> | null, entries: Set<string> | null) =>
        apply((ws) => pruneTabs(ws, pages, entries)),
    }),
    [apply]
  )

  return { workspace, ...actions }
}

export type JournalWorkspaceState = ReturnType<typeof useJournalWorkspace>
