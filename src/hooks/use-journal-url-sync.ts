import { useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { campaignPath } from "@/lib/campaign-paths"
import { activeTab } from "@/lib/journal-workspace"
import type { JournalWorkspaceState } from "./use-journal-workspace"

const pagePath = (campaignId: string, pageId?: string) =>
  campaignPath(campaignId, pageId ? `journal/${pageId}` : "journal")

// Keeps /journal/:pageId in step with the workspace. An address that names a page
// opens it (a link, or Back); and when the pane in focus shows a page, the address
// is that page. A pane showing an entry, or none, leaves the address at /journal.
export function useJournalUrlSync(campaignId: string, pageId: string | undefined, space: JournalWorkspaceState) {
  const navigate = useNavigate()
  const { open, workspace } = space
  const tab = activeTab(workspace)
  const shown = tab?.kind === "page" ? tab.id : undefined
  const arriving = useRef(true)
  const previous = useRef(shown)

  // The address changed: show its page, in a tab of its own when the journal has
  // only just opened, in the current one after.
  useEffect(() => {
    if (!pageId) return
    open({ kind: "page", id: pageId }, arriving.current ? { kind: "newTab" } : { kind: "current" })
    arriving.current = false
  }, [pageId, open])

  // Opened at /journal with a page showing from last time.
  useEffect(() => {
    if (!pageId && shown) navigate(pagePath(campaignId, shown), { replace: true })
    // Only when the journal opens; later changes are the effect below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // The workspace changed what is showing: the address follows.
  useEffect(() => {
    if (previous.current === shown) return
    previous.current = shown
    if (shown !== pageId) navigate(pagePath(campaignId, shown), { replace: true })
    // The address is read as it is when the change happens, not re-run when it changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shown])
}
