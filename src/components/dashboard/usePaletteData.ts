import { useEffect, useState } from "react"
import { fetchLibraryEntries, fetchWorldEntries } from "@/lib/world-entries"
import type { WorldEntry } from "@/lib/world-entries"

// The entries the palette searches, read each time it opens. What was read last
// time stays until the new list arrives, so reopening never starts empty.
export function usePaletteData(open: boolean, campaignId: string | null) {
  const [library, setLibrary] = useState<WorldEntry[] | null>(null)
  const [campaign, setCampaign] = useState<{ id: string; entries: WorldEntry[] } | null>(null)

  useEffect(() => {
    if (!open) return
    fetchLibraryEntries().then(setLibrary, () => setLibrary((current) => current ?? []))
  }, [open])

  useEffect(() => {
    if (!open || !campaignId) return
    fetchWorldEntries(campaignId).then(
      (entries) => setCampaign({ id: campaignId, entries }),
      () => setCampaign((current) => current ?? { id: campaignId, entries: [] })
    )
  }, [open, campaignId])

  return {
    libraryEntries: library,
    // Entries read for another campaign are not this one's.
    campaignEntries: campaign?.id === campaignId ? campaign.entries : null,
  }
}
