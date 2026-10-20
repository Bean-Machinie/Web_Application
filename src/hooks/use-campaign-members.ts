import { useEffect, useState } from "react"
import { fetchMembers } from "@/lib/campaign-members"
import type { Member } from "@/lib/campaign-members"
import type { Campaign } from "@/lib/campaigns"

// The last lists seen, so coming back to the page shows people at once and
// refreshes quietly instead of starting from skeletons.
const seen = new Map<string, Member[]>()

// Members per campaign id. One that fails to load stays on its skeleton.
export function useCampaignMembers(campaigns: Campaign[]) {
  const [members, setMembers] = useState<Record<string, Member[]>>(() => Object.fromEntries(seen))
  // The list is re-fetched every minute; only a change of campaigns matters.
  const ids = campaigns.map((campaign) => campaign.id).join(",")

  useEffect(() => {
    let current = true
    Promise.all(
      ids
        .split(",")
        .filter(Boolean)
        .map((id) =>
          fetchMembers(id).then(
            (list) => [id, list] as const,
            () => null
          )
        )
    ).then((entries) => {
      if (!current) return
      const loaded = entries.filter((entry) => entry !== null)
      loaded.forEach(([id, list]) => seen.set(id, list))
      // Keep what was already shown for a campaign whose refresh failed.
      setMembers((previous) => ({ ...previous, ...Object.fromEntries(loaded) }))
    })
    return () => {
      current = false
    }
  }, [ids])

  return members
}
