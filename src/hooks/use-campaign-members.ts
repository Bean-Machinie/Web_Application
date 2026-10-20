import { useEffect, useState } from "react"
import { fetchMembers } from "@/lib/campaign-members"
import type { Member } from "@/lib/campaign-members"
import type { Campaign } from "@/lib/campaigns"

// Members per campaign id. A campaign whose members fail to load is simply
// missing, and its card shows no people.
export function useCampaignMembers(campaigns: Campaign[]) {
  const [members, setMembers] = useState<Record<string, Member[]>>({})
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
      setMembers(Object.fromEntries(entries.filter((entry) => entry !== null)))
    })
    return () => {
      current = false
    }
  }, [ids])

  return members
}
