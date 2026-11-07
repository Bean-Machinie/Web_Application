import { useEffect, useState } from "react"
import { activeTab } from "@/lib/journal-workspace"
import { readWorkspace } from "@/lib/journal-workspace-storage"
import { fetchJournalTree } from "@/lib/journal"
import { storage } from "@/lib/browser-storage"

// The journal page last showing in a campaign, from the workspace this browser remembers; null when
// none was, or it is gone, or until it is found.
export function useLastPage(campaignId: string) {
  const [page, setPage] = useState<{ id: string; title: string } | null>(null)

  useEffect(() => {
    let current = true
    const tab = activeTab(readWorkspace(storage.getItem(`journal-workspace:${campaignId}`)))
    if (tab?.kind !== "page") return
    fetchJournalTree(campaignId)
      .then((pages) => {
        const found = pages.find((candidate) => candidate.id === tab.id)
        if (current && found) setPage({ id: found.id, title: found.title })
      })
      .catch(() => {})
    return () => {
      current = false
    }
  }, [campaignId])

  return page
}
