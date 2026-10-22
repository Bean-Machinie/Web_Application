import { useEffect, useState } from "react"
import { fetchRecentEntries } from "@/lib/world-recent"
import type { RecentBy, RecentEntry } from "@/lib/world-recent"

// The newest entries to go back to. `entries` is the last that loaded, so the list can
// stay in place while another sort loads (`loading`), and is null only until the first
// load. If they cannot be read the list just stays away.
export function useRecentEntries(campaignIds: string[], by: RecentBy, limit: number) {
  const [loaded, setLoaded] = useState<{ key: string; entries: RecentEntry[] } | null>(null)
  const key = `${by}|${campaignIds.join(",")}`

  useEffect(() => {
    let current = true
    fetchRecentEntries(campaignIds, by, limit)
      .then((entries) => current && setLoaded({ key, entries }))
      .catch(() => {})
    return () => {
      current = false
    }
    // The ids are in the key.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, limit])

  return { entries: loaded?.entries ?? null, loading: loaded?.key !== key }
}
